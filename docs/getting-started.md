---
layout: default
title: Getting Started
---

# Getting Started

## Install

```bash
npm install @bunnix/optimistics @bunnix/redux
```

## Minimal usage

```js
import { useOptimistics } from '@bunnix/optimistics';

const counter = useOptimistics(0, {
  increment: (state) => state + 1
});

counter.increment();
console.log(counter.state.get());
```

## Integrate with a Bunnix view

```js
import Bunnix from '@bunnix/core';
import { useOptimistics } from '@bunnix/optimistics';

const counter = useOptimistics(0, {
  increment: (state) => state + 1
});

const { button, p, div } = Bunnix;
const View = () => div([
  p(['Count: ', counter.state]),
  button({ click: () => counter.increment() }, 'Add')
]);

Bunnix.render(View, document.getElementById('root'));
```
