---
layout: default
title: Troubleshooting
---

# Troubleshooting

## Optimistic updates never commit

Ensure your middleware resolves. If you declare `next`, you must call it.

## Rollback does not restore state

Rollback resets optimistic state to the base state. Verify your reducers do not mutate inputs and always return new values.

## Status stays in pending

This happens when a middleware promise never resolves or `next` is never called. Check async flows and add timeouts if needed.

## Middleware errors are swallowed

Throw errors in middleware to trigger rollback. If errors are caught upstream, rethrow them so the optimistic store can rollback.
