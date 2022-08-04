import { SQLResolvedDB } from '@aphro/context-runtime-ts';
import { sql, SQLQuery } from '@aphro/sql-ts';
import { nullthrows } from '@strut/utils';

export type CreateError = {
  cause: any;
  sql: string;
  schemaName: string;
  db: SQLResolvedDB;
};
type MigrationTask = Omit<CreateError, 'cause'>;

type ColumnDef = {
  num: number | null;
  name: string;
  type: string | null;
};

export async function autoMigrate(migrationTasks: MigrationTask[]) {
  await Promise.all(migrationTasks.map(migrateOne));
}

async function migrateOne(task: MigrationTask) {
  const newSql = task.sql.replaceAll('\n', '');
  const db = task.db;

  const tableName = extractTableName(newSql);
  const oldSql = (await getOldSql(db, tableName)).replaceAll('\n', '');
  const oldColumnDefs = extractColumnDefs(oldSql);
  const newColumnDefs = extractColumnDefs(newSql);

  const removedColumns = findRemovedColumns(oldColumnDefs, newColumnDefs);
  const addedColumns = findAddedColumns(oldColumnDefs, newColumnDefs);
  const modifiedColumns = findAlteredColumns(oldColumnDefs, newColumnDefs);

  const alterTableStatements = [
    ...removeStatements(removedColumns),
    ...addStatements(addedColumns),
    ...modifyStatements(modifiedColumns),
  ];

  await Promise.all(alterTableStatements.map(stmt => db.query(stmt)));
}

export function extractTableName(sql: string): string {
  const match = sql.match(/.*CREATE TABLE\s+"(.*?)"\s+.*/);
  if (match == null) {
    throw new Error('could not extract a table name from ' + sql);
  }
  return match[1];
}

export async function getOldSql(db: SQLResolvedDB, tableName: string): Promise<string> {
  // Note -- `sqlite_schema` is the proper name but is not accessible in some environments
  // whereas `sqlite_master` is. I wonder if the opposite is ever true.
  const rows = await db.query(sql`SELECT sql FROM main.sqlite_master WHERE name = ${tableName}`);
  if (rows.length < 1) {
    throw new Error('Could not find the old schema for ' + tableName + ' in the provided database');
  }
  if (rows.length > 1) {
    throw new Error(
      'Unexpected number of old schemas returned by the database for table ' + tableName,
    );
  }

  return rows[0].sql;
}

// We do not use a pragma for this given we don't have a created table for the _new_ sql
// pragmas also do not include original comment text on a column which is where we place column numbers.
export function extractColumnDefs(sql: string): ColumnDef[] {
  const match = sql.match(/.*CREATE TABLE\s+".*?"\s+\((.*)\)/);
  if (match == null) {
    throw new Error('could not extract column definitions from the sql create table clause');
  }

  return match[1]
    .split(',')
    .map(c => c.trim())
    .map(c => {
      const match = c.match(
        /"(?<name>.*?)"\s+(?<type>[A-z]+(?<len>\([0-9]+\))?)\s+(?<nonnull>NOT NULL)?\s*(\/\*(?<meta>.*)\*\/)?/,
      );
      const meta = (match?.groups?.meta || '').trim();
      const maybeNum = new URLSearchParams(meta).get('n');

      console.log(c);

      if (match?.groups?.name == null) {
        // check if it is a constraint
      }

      return {
        num: maybeNum != null ? parseInt(maybeNum) : null,
        name: nullthrows(match?.groups?.name),
        type: match?.groups?.type || null,
      };
    });
}

export function findRemovedColumns(left: ColumnDef[], right: ColumnDef[]): ColumnDef[] {
  return [];
}

export function findAddedColumns(left: ColumnDef[], right: ColumnDef[]): ColumnDef[] {
  return [];
}

export function findAlteredColumns(
  left: ColumnDef[],
  right: ColumnDef[],
): [ColumnDef, ColumnDef][] {
  return [];
}

function removeStatements(columns: ColumnDef[]): SQLQuery[] {
  return [];
}

function addStatements(columns: ColumnDef[]): SQLQuery[] {
  return [];
}

function modifyStatements(columns: [ColumnDef, ColumnDef][]): SQLQuery[] {
  return [];
}

/**
 * -- SIGNED-SOURCE: <39e0ffa72e52ff465fbd19ef78209317>\n' +
          'CREATE TABLE\n' +
          '  "decktoeditorsedge" ("id1" bigint NOT NULL, "id2" bigint NOT NULL)
 */
