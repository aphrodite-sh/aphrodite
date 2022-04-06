import uniqueImports from '../uniqueImports.js';
function fieldToTsType(field) {
    switch (field.type) {
        case 'id':
            // TODO: pull in the correct id type.
            return 'SID_of<any>';
        case 'naturalLanguage':
            return 'string';
        case 'enumeration':
            return field.keys.join('|');
        case 'currency':
        case 'timestamp':
            return 'number';
        case 'primitive':
            switch (field.subtype) {
                case 'bool':
                    return 'boolean';
                case 'int32':
                case 'float32':
                case 'uint32':
                    return 'number';
                // since JS can't represent 64 bit numbers -- 53 bits is js max int.
                case 'int64':
                case 'float64':
                case 'uint64':
                case 'string':
                    return 'string';
            }
        case 'map':
            return `ReadonlyMap<${fieldToTsType(field.keys)}, ${fieldToTsType(field.values)}>`;
    }
    throw new Error(`Cannot convert from ${field.type} of ${JSON.stringify(field)} to a typescript type`);
}
export function importToString(val) {
    const name = val.name != null ? val.name + ' ' : '';
    const as = val.as != null ? 'as ' + val.as + ' ' : '';
    if (name === '') {
        return `import "${val.from}";`;
    }
    else if (name[0] === '{' && val.as != null) {
        return `import ${name.substring(0, name.length - 2)} ${as}} from '${val.from}';`;
    }
    else {
        return `import ${name}${as}from '${val.from}';`;
    }
}
// Uniques and collapses imports.
export function importsToString(imports) {
    return collapseImports(uniqueImports(imports)).map(importToString).join('\n');
}
export function collapseImports(imports) {
    // not yet implemented
    return imports;
}
export { fieldToTsType };
//# sourceMappingURL=tsUtils.js.map