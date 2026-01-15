# @bunnix/optimistics

Optimistic state control while external data loads, built for Bunnix. It pairs a committed base state with an optimistic state, supports scoped transactions, and integrates with `@bunnix/redux` style reducers.

## Install

```sh
npm install @bunnix/optimistics
```

## Basic usage

```js
import { useOptimistics } from '@bunnix/optimistics';

const counter = useOptimistics(0, {
  add: (state, args) => state + args
});

counter.add(1);
console.log(counter.state.get());
```

## Transactional optimistic flow

```js
import { useOptimistics } from '@bunnix/optimistics';

const tasks = useOptimistics([], {
  addTask: (state, args) => (args.task ? [...state, args.task] : state)
});

await tasks.transaction(async (tx) => {
  tx.apply((value) => [...value, { id: 't1', title: 'Ship' }]);
  // await api.save(...)
});
```

## Middleware integration

```js
import { applyMiddlewareOptimistics, useOptimistics } from '@bunnix/optimistics';

const reducers = {
  init: (state, args) => (Array.isArray(args.tasks) ? args.tasks : state),
  addTask: (state, args) => (args.task ? [...state, args.task] : state)
};

const tasks = useOptimistics(
  [],
  applyMiddlewareOptimistics(async (event, args, nextState, next) => {
    if (event === 'addTask') {
      // await api.save(nextState)
    }
    if (next) await next();
  })(reducers)
);
```

```
