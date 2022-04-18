import { Field, Import, RemoveNameField, TypeAtom } from '@aphro/schema-api';
import { uniqueImports } from '@aphro/codegen';

export function fieldToTsType(field: RemoveNameField<Field>): string {
  switch (field.type) {
    case 'id':
      return `SID_of<${field.of}>`;
    case 'naturalLanguage':
      return 'string';
    case 'enumeration':
      return field.keys.map(k => `'${k}'`).join('|');
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

  throw new Error(
    `Cannot convert from ${field.type} of ${JSON.stringify(field)} to a typescript type`,
  );
}

export function typeDefToTsType(def: TypeAtom[]): string {
  return def
    .map(a =>
      a.type === 'union'
        ? '|'
        : a.type === 'intersection'
        ? '&'
        : typeof a.name === 'string'
        ? a.name
        : fieldToTsType(a.name),
    )
    .join(' ');
}

export function importToString(val: Import): string {
  const name = val.name != null ? val.name + ' ' : '';
  const as = val.as != null ? 'as ' + val.as + ' ' : '';
  if (name === '') {
    return `import "${val.from}";`;
  } else if (name[0] === '{' && val.as != null) {
    return `import ${name.substring(0, name.length - 2)} ${as}} from '${val.from}';`;
  } else {
    return `import ${name}${as}from '${val.from}';`;
  }
}

// Uniques and collapses imports.
export function importsToString(imports: readonly Import[]): string {
  return collapseImports(uniqueImports(imports)).map(importToString).join('\n');
}

export function collapseImports(imports: readonly Import[]): readonly Import[] {
  // not yet implemented
  return imports;
}
