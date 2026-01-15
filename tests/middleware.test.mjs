import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyMiddlewareOptimistics, useOptimistics } from '../src/index.mjs';

const reducers = {
  add: (state, args) => state + args
};

test('status transitions on async success', async () => {
  const withMiddleware = applyMiddlewareOptimistics(async (_event, _args, _nextState, next) => {
    await Promise.resolve();
    if (next) await next();
  });

  const store = useOptimistics(0, withMiddleware(reducers));
  const promise = store.add(1);

  assert.equal(store.status.get(), 'pending');
  await promise;
  assert.equal(store.status.get(), 'synced');
  assert.equal(store.base.get(), 1);
});

test('status transitions on async failure and rollback', async () => {
  const withMiddleware = applyMiddlewareOptimistics(async () => {
    await Promise.resolve();
    throw new Error('remote failed');
  });

  const store = useOptimistics(0, withMiddleware(reducers));

  await assert.rejects(() => store.add(2), /remote failed/);
  assert.equal(store.status.get(), 'error');
  assert.equal(store.optimistic.get(), store.base.get());
});

test('middleware without next auto-commits on success', async () => {
  const withMiddleware = applyMiddlewareOptimistics(async (_event, _args, _nextState) => {
    await Promise.resolve();
  });

  const store = useOptimistics(0, withMiddleware(reducers));
  await store.add(4);

  assert.equal(store.status.get(), 'synced');
  assert.equal(store.base.get(), 4);
});
