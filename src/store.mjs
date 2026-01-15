import { createStore } from '@bunnix/redux';

/**
 * Create a Bunnix state wrapper using the redux store primitive.
 * @param {any} value initial state value
 * @returns {Object} state object with get/set/subscribe/map
 */
const createState = (value) => createStore(value, {}).state;

function normalizeReducers(reducersOrMiddleware) {
  if (reducersOrMiddleware && reducersOrMiddleware.reducerMap) {
    return {
      reducerMap: reducersOrMiddleware.reducerMap,
      middleware: reducersOrMiddleware.middleware
    };
  }

  return {
    reducerMap: reducersOrMiddleware || {},
    middleware: undefined
  };
}

/**
 * Normalize store state access regardless of store shape.
 * @param {Object} store store created by @bunnix/redux
 * @returns {Object} state object with get/set/subscribe
 */
function extractState(store) {
  if (store && store.state && typeof store.state.get === 'function') {
    return store.state;
  }
  if (store && typeof store.get === 'function' && typeof store.set === 'function') {
    return store;
  }
  throw new Error('Invalid store shape from createStore');
}

/**
 * Create an optimistic store that mirrors a committed base state.
 * @param {any} initialValue initial store value
 * @param {Object} reducersOrMiddleware reducer map or middleware wrapper
 * @returns {Object} optimistic store API
 */
export function useOptimistics(initialValue, reducersOrMiddleware) {
  const { reducerMap, middleware } = normalizeReducers(reducersOrMiddleware);
  const baseStore = createStore(initialValue, reducerMap);
  const optimisticStore = createStore(initialValue, reducerMap);

  const base = extractState(baseStore);
  const optimistic = extractState(optimisticStore);
  const status = createState('idle');

  // Commit optimistic state into base and synchronize.
  const commit = () => {
    const nextValue = optimistic.get();
    base.set(nextValue);
    optimistic.set(nextValue);
    status.set('synced');
  };

  // Reset optimistic state back to the committed base.
  const rollback = () => {
    optimistic.set(base.get());
    status.set('error');
  };

  // Force base to the current optimistic value.
  const flush = () => {
    const nextValue = optimistic.get();
    base.set(nextValue);
    optimistic.set(nextValue);
    status.set('synced');
  };

  const api = {
    base,
    optimistic,
    status,
    state: optimistic,
    get: () => optimistic.get(),
    set: (value) => optimistic.set(value)
  };

  /**
   * Run a scoped optimistic transaction.
   * @param {Function} fn transaction callback receiving a tx helper
   * @returns {Promise<any>} result of the transaction callback
   */
  api.transaction = async (fn) => {
    let finalized = false;
    const txCommit = () => {
      if (finalized) return;
      finalized = true;
      commit();
    };
    const txRollback = () => {
      if (finalized) return;
      finalized = true;
      rollback();
    };

    /**
     * Transaction helper used inside api.transaction.
     * @type {Object}
     */
    const tx = {
      apply: (patch) => {
        const nextValue = patch(optimistic.get());
        optimistic.set(nextValue);
        status.set('pending');
      },
      commit: txCommit,
      rollback: txRollback,
      flush: () => flush(),
      status
    };

    status.set('pending');

    try {
      const result = await fn(tx);
      txCommit();
      return result;
    } catch (err) {
      txRollback();
      throw err;
    }
  };

  const actionApi = {};
  Object.keys(reducerMap).forEach((event) => {
    actionApi[event] = (args) => {
      const nextState = reducerMap[event](optimistic.get(), args);
      optimistic.set(nextState);
      status.set('pending');

      const result = middleware
        ? middleware(event, args, nextState, api)
        : undefined;
      if (result && typeof result.then === 'function') {
        return result.then(
          () => {
            commit();
            return nextState;
          },
          (err) => {
            rollback();
            throw err;
          }
        );
      }

      commit();
      return nextState;
    };
  });

  return { ...api, ...actionApi };
}
