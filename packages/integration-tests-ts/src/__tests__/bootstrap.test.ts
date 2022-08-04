import { resolver } from '../testdb.js';
import sqlFiles from '../generated/generated/exports-node-sql.js';
import { bootstrap } from '@aphro/runtime-ts';

test('creating tables that do not exist', async () => {
  await bootstrap.createIfNotExists(resolver, sqlFiles);
});

test('creating tables that do exist', async () => {
  await bootstrap.createIfNotExists(resolver, sqlFiles);
  await bootstrap.createIfNotExists(resolver, sqlFiles);

  expect(async () => {
    await bootstrap.createThrowIfExists(resolver, sqlFiles);
  }).rejects.toThrow();
});

test('auto-migrate', async () => {
  // no deltas, be silent
  // deltas, make a change
  // require numbering of fields so we can detect renames?
  await bootstrap.createAutomigrateIfExists(resolver, sqlFiles);
});
