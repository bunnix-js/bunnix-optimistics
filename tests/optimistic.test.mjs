import assert from 'node:assert/strict';
import { test } from 'node:test';
import { useOptimistics } from '../src/index.mjs';

test('optimistic updates reflect immediately', () => {
  const store = useOptimistics(0, {
    add: (state, args) => state + args
  });

  store.add(2);
  assert.equal(store.optimistic.get(), 2);
});

test('commit updates base and syncs optimistic', async () => {
  const store = useOptimistics(0, {
    add: (state, args) => state + args
  });

  await store.transaction(async (tx) => {
    tx.apply((value) => value + 3);
  });

  assert.equal(store.base.get(), 3);
  assert.equal(store.optimistic.get(), 3);
});

test('rollback resets optimistic to base', async () => {
  const store = useOptimistics(5, {
    add: (state, args) => state + args
  });

  await assert.rejects(
    () =>
      store.transaction(async (tx) => {
        tx.apply((value) => value + 1);
        throw new Error('fail');
      }),
    /fail/
  );

  assert.equal(store.base.get(), 5);
  assert.equal(store.optimistic.get(), 5);
});
