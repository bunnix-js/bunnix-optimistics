---
layout: default
title: Examples
---

# Examples

## Example index

- Minimal optimistic counter
- Transactional optimistic update
- Async persistence with middleware

## Minimal optimistic counter

```js
import { useOptimistics } from '@bunnix/optimistics';

const counter = useOptimistics(0, {
  increment: (state) => state + 1
});

counter.increment();
```

## Transactional optimistic update

```js
import { useOptimistics } from '@bunnix/optimistics';

const tasks = useOptimistics([], {
  add: (state, args) => (args.task ? [...state, args.task] : state)
});

await tasks.transaction(async (tx) => {
  tx.apply((value) => [...value, { id: 't1', title: 'Draft' }]);
  // await api.save(...)
});
```

## Async persistence with middleware

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
