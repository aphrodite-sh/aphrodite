import { ModelSpec } from '@aphro/model-runtime-ts';
import { BaseChunkIterable } from '../ChunkIterable.js';
import specAndOpsToSQL from './specAndOpsToSQL.js';
import { HoistedOperations } from './SqlSourceExpression.js';
import { invariant } from '@strut/utils';
import { __internalConfig } from '@aphro/config-runtime-ts';

export default class SQLSourceChunkIterable<T> extends BaseChunkIterable<T> {
  private cachedCompilation: ReturnType<typeof compile> | null;
  constructor(private spec: ModelSpec<T>, private hoistedOperations: HoistedOperations) {
    super();
    invariant(this.spec.storage.type === 'sql', 'SQL source used for non-SQL model!');
  }

  async *[Symbol.asyncIterator](): AsyncIterator<readonly T[]> {
    const query = this.compileQuery();

    // TODO: stronger types one day
    // e.g., exec should by parametrized and checked against T somehow.
    // Should probably allow a namespace too?
    return await __internalConfig.resolver
      .type(this.spec.storage.type)
      .engine(this.spec.storage.engine)
      .tablish(this.spec.storage.tablish)
      .exec(query.sql, query.bindings);
  }

  __getSQL() {
    return this.compileQuery();
  }

  private compileQuery() {
    if (this.cachedCompilation != null) {
      return this.cachedCompilation;
    }

    this.cachedCompilation = compile(this.spec, this.hoistedOperations);
    return this.cachedCompilation;
  }
}

function compile(spec: ModelSpec<any>, hoistedOperations: HoistedOperations) {
  // TODO Nit: -- slight problem in that the sql generated here is knex format not native format
  // so it'd require the users to use knex.
  // we should get it to native...
  return specAndOpsToSQL(spec, hoistedOperations).toSQL();
}
