import { asPropertyAccessor, upcaseAt } from '@strut/utils';
import { fieldToTsType, importToString } from './tsUtils.js';
import { CodegenStep } from '@aphro/codegen-api';
import TypescriptFile from './TypescriptFile.js';
import { nodeFn } from '@aphro/schema';
import { edgeFn } from '@aphro/schema';
export default class GenTypescriptModel extends CodegenStep {
    schema;
    static accepts(_schema) {
        return true;
    }
    constructor(schema) {
        super();
        this.schema = schema;
    }
    gen() {
        return new TypescriptFile(this.schema.name + '.ts', `import {Model, Spec} from '@aphro/model-runtime-ts';
import {SID_of} from '@strut/sid';
${this.getImportCode()}

export type Data = ${this.getDataShapeCode()};

${this.schema.extensions.type?.decorators?.join('\n') || ''}
export default class ${this.schema.name}
  extends Model<Data> {
  ${this.getFieldCode()}
  ${this.getEdgeCode()}
}

${this.getSpecCode()}
`);
    }
    getDataShapeCode() {
        const fieldProps = Object.values(this.schema.fields).map(field => `${asPropertyAccessor(field.name)}: ${fieldToTsType(field)}`);
        return `{
  ${fieldProps.join(',\n  ')}
}`;
    }
    getImportCode() {
        const ret = [];
        for (const val of this.schema.extensions.module?.imports.values() || []) {
            ret.push(importToString(val));
        }
        for (const edge of nodeFn.allEdges(this.schema)) {
            ret.push(`import ${edgeFn.queryTypeName(this.schema, edge)} from "./${edgeFn.queryTypeName(this.schema, edge)}.js"`);
            if (edge.type === 'edge') {
                if (edge.throughOrTo.type !== this.schema.name) {
                    ret.push(`import ${edge.throughOrTo.type} from "./${edge.throughOrTo.type}.js"`);
                }
            }
        }
        return ret.join('\n');
    }
    getFieldCode() {
        return Object.values(this.schema.fields)
            .map(field => `${field.decorators?.join('\n') || ''}
      get ${field.name}(): ${fieldToTsType(field)} {
        return this.data.${field.name};
      }
    `)
            .join('\n');
    }
    getEdgeCode() {
        /*
        outbound edges
        - through a field on self: field edge
        - to self type: should have been a junction edge?
          - not yet supported, ask user to declare a standalone junction
          - could be an edge stored in a different system or a junction edge.
        - through a field on other: foreign key edge
        - to a other type: should have been a junction edge?
          - not yet supported, ask user to declare a standalone edge
          - could be an edge stored in a different system or a junction edge.
    
        inbound edges:
        - through a field on self
          - foreign key
        - through a field on other
          - foreign key
        - from self
          - see outbound `to self type`
        - from other type
          - see outbound `to other type`
        */
        return Object.values(this.schema.extensions.outboundEdges?.edges || {})
            .map(edge => `query${upcaseAt(edge.name, 0)}(): ${edgeFn.queryTypeName(this.schema, edge)} {
          return ${edgeFn.queryTypeName(this.schema, edge)}.${this.getFromMethodInvocation('outbound', edge)};
        }`)
            .join('\n');
        // TODO: static inbound edge defs
    }
    getSpecCode() {
        return `
    export const spec: Spec<Data> = {
      createFrom(data: Data) {
        return new ${this.schema.name}(data);
      },

      storageDescriptor: {
        engine: "${this.schema.storage.engine}",
        db: "${this.schema.storage.db}",
        type: "${this.schema.storage.type}",
        tablish: "${this.schema.storage.tablish}",
      },
    }
    `;
    }
    // inbound edges would be static methods
    getFromMethodInvocation(type, edge) {
        if (type === 'inbound') {
            throw new Error('inbound edge generation on models not yet supported');
        }
        // outbound edge through a field would be:
        // outbound foreign key would be: BarQuery.fromFooId(this.id); // Foo | OB { Edge<Bar.fooId> }
        // outbound field edge would be: BarQuery.fromId(this.barId); // Foo | OB { Edge<Foo.barId> }
        switch (edge.type) {
            case 'edge':
                const column = edge.throughOrTo.column;
                if (column == null) {
                    // this error should already have been thrown earlier.
                    throw new Error('Locally declared edge that is not _through_ something is currently unsupported');
                }
                // through a field on self is a field edge
                // a field edge refers to the id of the destination type.
                if (edge.throughOrTo.type === this.schema.name) {
                    return `fromId(this.${column})`;
                }
                // through a field on some other type is a foreign key edge
                // we're thus qurying that type based on some column rather than its id
                return `from${upcaseAt(column, 0)}(this.id)`;
            case 'edgeReference':
                // if (edge.inverted) {
                //   return "fromDst";
                // }
                return 'fromSrc(this.id)';
        }
    }
}
//# sourceMappingURL=GenTypescriptModel.js.map