/**
 * Build the optimistic-aware middleware chain runner.
 * @param {Array<Function>} middlewares middleware list to execute in order
 * @returns {Function} middleware runner used by the store
 */
function createOptimisticRunner(middlewares) {
  return async (event, args, nextState, optimistic) => {
    let index = -1;
    const run = async () => {
      index += 1;
      const current = middlewares[index];
      if (!current) return undefined;

      const expectsNext = current.length >= 4;
      if (expectsNext) {
        return current(event, optimistic, nextState, run, args);
      }

      const result = current(event, optimistic, nextState, args);
      if (result && typeof result.then === 'function') {
        await result;
      }
      return run();
    };

    return run();
  };
}

/**
 * Wrap reducers with optimistic-aware middleware.
 * @param {...Function} middlewares redux-style middleware functions
 * @returns {Function} reducer wrapper producing { reducerMap, middleware }
 */
export function applyMiddlewareOptimistics(...middlewares) {
  const wrapped = middlewares.map((middleware) => {
    if (middleware.length >= 4) {
      return (event, optimistic, nextState, next, args) =>
        middleware(event, args, nextState, next);
    }
    return (event, optimistic, nextState, args) =>
      middleware(event, args, nextState);
  });

  return (reducers) => {
    const reducerMap = reducers || {};
    const middleware = createOptimisticRunner(wrapped);
    return { reducerMap, middleware };
  };
}
