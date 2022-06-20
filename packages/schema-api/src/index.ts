export type ValidationError = {
  message: string;
  severity: 'warning' | 'advice' | 'error';
  type:
    | 'duplicate-nodes'
    | 'duplicate-edges'
    | 'duplicate-fields'
    | 'duplicate-ob-edges'
    | 'duplicate-ib-edges'
    | 'duplicate-extensions'
    | 'duplicate-traits';
};

export type StorageEngine = 'sqlite' | 'postgres'; //| 'mysql' | 'sqlite'; // | maria | neo4j | redis ...
export type StorageType = 'sql'; // opencypher

export type SchemaFileAst = {
  preamble: {
    engine: StorageEngine;
    db: string;
    [key: string]: string; // other engine-specific values
  };
  entities: (NodeAst | EdgeAst | NodeTraitAst)[];
};

export type SchemaFile = {
  nodes: {
    [key: NodeReference]: Node;
  };
  edges: {
    [key: EdgeReference]: Edge;
  };
};

export interface NodeExtensions {
  outboundEdges?: OutboundEdges;
  inboundEdges?: InboundEdges;
  index?: Index;
  storage?: Storage;
  type?: TypeConfig;
  module?: ModuleConfig;
  traits?: Traits;
}

export interface NodeAstExtensions {
  outboundEdges: OutboundEdgesAst;
  inboundEdges: InboundEdgesAst;
  index: Index;
  storage: Storage;
  traits: Traits;
}

export type Node = {
  name: NodeAst['name'];
  primaryKey: string;
  fields: {
    [key: UnqalifiedFieldReference]: Field;
  };
  extensions: NodeExtensions;
  storage: StorageConfig;
};

export type NodeSpec = {
  readonly primaryKey: string;
  readonly storage: StorageConfig;
  readonly outboundEdges: { [key: string]: EdgeSpec };
};

type EdgeSpecBase = {
  source: NodeSpec;
  dest: NodeSpec;
};

export type EdgeSpec =
  | ({
      type: 'junction';
      storage: StorageConfig;
    } & EdgeSpecBase)
  | ({
      type: 'field';
      sourceField: string;
      destField: string;
    } & EdgeSpecBase)
  | ({
      type: 'foreignKey';
      sourceField: string;
      destField: string;
    } & EdgeSpecBase);

export type EdgeType = EdgeSpec['type'];

type TypeConfig = {
  name: 'typeConfig';
} & MaybeDecoratored;

type ModuleConfig = {
  name: 'moduleConfig';
  imports: Map<string, Import>;
};

export type Import = {
  name?: string | null;
  as?: string | null;
  from: string;
};

export type StorageConfig = {
  type: 'sql'; // | cypher | gremlin | ...
  db: string;
  tablish: string;
  engine: StorageEngine;
  [key: string]: string; // engine specific extras
}; // | { type: "opencypher" } ...;

export type Edge = {
  type: 'standaloneEdge';
  name: EdgeAst['name'];
  src: NodeReferenceOrQualifiedColumn;
  dest: NodeReferenceOrQualifiedColumn | null;
  fields: {
    [key: UnqalifiedFieldReference]: Field;
  };
  extensions: {
    [Property in EdgeExtension['name']]?: EdgeExtension;
  };
  storage: StorageConfig;
};

export type RemoveNameField<Type> = {
  [Property in keyof Type as Exclude<Property, 'name'>]: Type[Property];
};

export type NodeReference = string;
type UnqalifiedFieldReference = string;
export type EdgeReference = string;

type NonComplexField = ID | NaturalLanguage | Enum | Time | Primitive;

type ComplexField = MapField | ArrayField;

export type Field = NonComplexField | ComplexField;
export type NodeAstExtension = NodeAstExtensions[keyof NodeAstExtensions];
export type NodeExtension = Node['extensions'][keyof Node['extensions']];

export type NodeAst = {
  type: 'node';
} & NodeAstCommon;

export type NodeTraitAst = {
  type: 'nodeTrait';
} & NodeAstCommon;

export type NodeAstCommon = {
  name: string;
  fields: Field[];
  extensions: NodeAstExtension[];
};

export type EdgeExtension = Index | Invert | Constrain | Storage;

export type EdgeAst = {
  type: 'edge';
  name: string;
  src: NodeReferenceOrQualifiedColumn;
  dest: NodeReferenceOrQualifiedColumn | null;
  fields: Field[];
  extensions: EdgeExtension[];
};

type Invert = {
  name: 'invert';
  as: string;
};

type Constrain = {
  name: 'constrain';
};

type NodeReferenceOrQualifiedColumn = {
  type: NodeReference;
  column?: UnqalifiedFieldReference;
};

export type EdgeDeclaration = {
  type: 'edge';
  name: string;
  throughOrTo: NodeReferenceOrQualifiedColumn;
};

export type EdgeReferenceDeclaration = {
  type: 'edgeReference';
  name: string;
  reference: EdgeReference;
};

type MaybeDecoratored = {
  decorators?: string[];
};

type FieldBase = {
  decorators?: string[];
  description?: string;
  nullable?: boolean;
};

export type ID = {
  name: string;
  type: 'id';
  of: NodeReference;
} & FieldBase;

type NaturalLanguage = {
  name: string;
  type: 'naturalLanguage';
} & FieldBase;

export type Enum = {
  name: string;
  type: 'enumeration';
  keys: string[];
} & FieldBase;

type Time = {
  name: string;
  type: 'timestamp';
} & FieldBase;

export const primitives = [
  'bool',
  'int32',
  'int64',
  'float32',
  'float64',
  'uint32',
  'uint64',
  'string',
  'null',
  'any',
] as const;

export type PrimitiveSubtype = typeof primitives[number];
type Primitive = {
  name: string;
  type: 'primitive';
  subtype: PrimitiveSubtype;
} & FieldBase;

type MapField = {
  name: string;
  type: 'map';
  // Ideally we use `Omit` on name but see https://github.com/microsoft/TypeScript/issues/31501
  keys: RemoveNameField<NonComplexField>;
  values: RemoveNameField<Field>;
} & FieldBase;

type ArrayField = {
  name: string;
  type: 'array';
  // Ideally we use `Omit` on name but see https://github.com/microsoft/TypeScript/issues/31501
  values: RemoveNameField<Field>;
} & FieldBase;

export type OutboundEdgesAst = {
  name: 'outboundEdges';
  declarations: (EdgeDeclaration | EdgeReferenceDeclaration)[];
};

export type OutboundEdges = {
  name: OutboundEdgesAst['name'];
  edges: {
    [key: EdgeReference]: EdgeDeclaration | EdgeReferenceDeclaration;
  };
};

export type InboundEdgesAst = {
  name: 'inboundEdges';
  declarations: (EdgeDeclaration | EdgeReferenceDeclaration)[];
};

export type InboundEdges = {
  name: InboundEdgesAst['name'];
  edges: {
    [key: EdgeReference]: EdgeDeclaration | EdgeReferenceDeclaration;
  };
};

type Index = {
  name: 'index';
  declarations: (Unique | NonUnique)[];
};

type Traits = {
  name: 'traits';
  declarations: string[];
};

export type TypeAtom =
  | {
      type: 'type';
      name: RemoveNameField<Field> | string;
    }
  | {
      type: 'intersection';
    }
  | { type: 'union' }
  | { type: 'primitive'; subtype: PrimitiveSubtype };

type Storage = {
  name: 'storage';
  type?: StorageType;
  engine: StorageEngine;
  db?: string;
  table?: string;
};

type Unique = {
  name: string;
  type: 'unique';
  columns: UnqalifiedFieldReference[];
};

type NonUnique = {
  name: string;
  type: 'nonUnique';
  columns: UnqalifiedFieldReference[];
};
