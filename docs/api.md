---
layout: default
title: API
---

# API

## Public exports

- useOptimistics
- applyMiddlewareOptimistics

## useOptimistics(initialValue, reducersOrMiddleware)

Creates an optimistic store with base, optimistic, and status state. Reducer methods are available directly on the returned object.

Returns an object with:

- base: committed state
- optimistic: optimistic state
- status: 'idle' | 'pending' | 'synced' | 'error'
- state: alias of optimistic for UI binding
- transaction(fn): scoped optimistic transaction
- reducer methods from your reducer map

Example:

```js
import { useOptimistics } from '@bunnix/optimistics';

const tasks = useOptimistics([], {
  add: (state, args) => (args.task ? [...state, args.task] : state)
});

tasks.add({ task: { id: 't1', title: 'Ship' } });
console.log(tasks.state.get());
```

### transaction(fn)

Runs optimistic updates in a scoped transaction. If the callback resolves, it commits. If it throws, it rolls back.

```js
await tasks.transaction(async (tx) => {
  tx.apply((value) => [...value, { id: 't2', title: 'Save' }]);
  // await api.save(...)
});
```

## applyMiddlewareOptimistics(...middlewares)

Wraps reducers with optimistic-aware middleware. Middlewares follow the @bunnix/redux signature: (event, args, nextState, next?). If next is omitted, the chain continues automatically and waits for any returned promise.

Example:

```js
import { applyMiddlewareOptimistics, useOptimistics } from '@bunnix/optimistics';

const withPersist = applyMiddlewareOptimistics(async (event, args, nextState) => {
  if (event === 'add') {
    // await api.save(nextState)
  }
});

const store = useOptimistics(
  [],
  withPersist({
    add: (state, args) => (args.item ? [...state, args.item] : state)
  })
);
```
