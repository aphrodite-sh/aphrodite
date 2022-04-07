import { CodegenFile, CodegenStep } from '@aphro/codegen-api';
import { Node } from '@aphro/schema-api';
export default class GenMySqlTableSchema extends CodegenStep {
    private schema;
    static accepts(schema: Node): boolean;
    constructor(schema: Node);
    gen(): CodegenFile;
    private getColumnDefinitionsCode;
    private getPrimaryKeyCode;
    private getIndexDefinitionsCode;
}
