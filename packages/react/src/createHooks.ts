import { Query, Context, UpdateType, INode } from '@aphro/runtime-ts';
import counter from '@strut/counter';
import { useRef, useSyncExternalStore } from 'react';
import { suspend } from 'suspend-react';

const count = counter('model-infra/CreateHooks');

export type ContextPromise = Promise<Context>;

export type UseQueryOptions = {
  // If you want to limit what sorts of updates will cause the live query to re-fire
  on?: UpdateType;
  // Required to cache the results of a query
  // This allows components to unmount and remount without losing previously queried state.
  // Should we just compute the key for them?
  // We can given the declarative nature of the queries...
  key: string;
  // a list of dependencies for the query creator function. if these change,
  // the query will be re-run.
  deps?: any[];
};

type QueryReturnType<Q> = Q extends Query<infer M> ? M : any;

export function createHooks(contextPromise: ContextPromise) {
  // suspends the subtree using a hook that depends on context initialization
  // until the context has been initialized.
  function suspendOnContext() {
    return suspend(() => {
      return contextPromise;
    }, ['context']);
  }

  function useQueryContext() {
    const ctx = suspendOnContext();
    return ctx;
  }

  function useQuery<Q extends Query<QueryReturnType<Q>>>(
    queryProvider: (ctx: Context) => Q,
    { on, key, deps = [] }: UseQueryOptions,
  ) {
    const ctx = useQueryContext();

    // suspend on the first result to skip 'pending' state and always work
    // with either fresh or stale resolved data. suspended value will be cached
    // according to user-supplied key which is required
    // TODO: generate cache key from query
    const liveRef = useRef<any>();
    const liveResult = suspend(async () => {
      count.bump('suspend.liveResult.initial');
      const q = queryProvider(ctx);
      const liveResult = q.live(on || UpdateType.ANY);
      // Keep a ref to `liveResult` since `liveResult` weakly subscribes to data sources.
      liveRef.current = liveResult;
      await liveResult.__currentHandle;
      return liveResult;
    }, [key, ...deps]);

    const latestResult = useSyncExternalStore(
      cb => liveResult.subscribe(cb),
      // asserting that latest is defined here because the suspense
      // above should ensure this.
      () => {
        count.bump('liveResult.subscribe');
        return liveResult.latest!;
      },
    );

    return latestResult;
  }

  function useQueryOne<ResultType>(
    queryProvider: (ctx: Context) => Query<ResultType>,
    { on, key, deps }: UseQueryOptions,
  ) {
    const result = useQuery(queryProvider, { on, key, deps });
    return result[0];
  }

  function useBind<Node extends INode<Shape>, Shape>(node: Node, keys?: (keyof Shape)[]) {
    const latestResult = useSyncExternalStore(
      cb => {
        if (keys) {
          count.bump('keyed.subcription.' + node.constructor.name);
          return node.subscribeTo(keys, cb);
        } else {
          return node.subscribe(cb);
        }
      },
      // works because this is not referentially stable across updates -
      // the snapshot must always return a different object after each
      // change.
      node._d.bind(node),
    );
    return latestResult;
  }

  return {
    useQuery,
    useQueryOne,
    useBind,
  };
}
