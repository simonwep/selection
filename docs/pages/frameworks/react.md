# Using Viselect with React

<!--@include: ../../parts/custom-integration-note.md-->

## Installation

To use Viselect with React, install its react package with:

::: code-group

```sh [npm]
$ npm install @viselect/react
```

```sh [pnpm]
$ pnpm install @viselect/react
```

```sh [yarn]
$ yarn add @viselect/react
```

:::

## Usage

You can use Viselect in your React project by importing the `SelectionArea` component from the `@viselect/react` package.

> [!TIP]
> All options are exposed as direct props.
> They're a one-to-one mapping of the original options describe [here](../api-reference.md#selectionoptions)!

> [!NOTE]
> Changing the props won't do anything as React doesn't deep-compare props.
> Trigger a re-render by adding and changing the key of the `SelectionArea` component.
> See [#226](https://github.com/simonwep/viselect/issues/226).

::: code-group

```tsx [App.tsx]
import {SelectionArea, SelectionEvent} from '@viselect/react';
import React, {FunctionComponent, useState} from 'react';
import './styles.css';

const App: FunctionComponent = () => {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  const extractIds = (els: Element[]): number[] =>
    els.map(v => v.getAttribute('data-key'))
      .filter(Boolean)
      .map(Number);

  const onStart = ({ event, selection }: SelectionEvent) => {
    if (!event?.ctrlKey && !event?.metaKey) {
      selection.clearSelection();
      setSelected(() => new Set());
    }
  };

  const onMove = ({ store: { changed: { added, removed } } }: SelectionEvent) => {
    setSelected(prev => {
      const next = new Set(prev);
      extractIds(added).forEach(id => next.add(id));
      extractIds(removed).forEach(id => next.delete(id));
      return next;
    });
  };

  return (
    <>
      <SelectionArea className="container"
               onStart={onStart}
               onMove={onMove}
               selectables=".selectable">
        {new Array(42).fill(0).map((_, index) => (
          <div className={selected.has(index) ? 'selected selectable' : 'selectable'}
             data-key={index}
             key={index}/>
        ))}
      </SelectionArea>
    </>
  );
}
```

```css [styles.css]
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  border: 1px dashed #4f5276;
  border-radius: 15px;
  padding: 15px;
  margin: 15px 0;
  user-select: none;
}

.container div {
  height: 50px;
  width: 50px;
  margin: 3px;
  background: rgba(66, 68, 90, 0.075);
  border-radius: 10px;
  cursor: pointer;
}

div.selected {
  background: linear-gradient(45deg, #78b2ff, #218ad9);
}

.selection-area {
  background: rgba(46, 115, 252, 0.11);
  border: 1px solid rgba(98, 155, 255, 0.85);
  border-radius: 0.15em;
}
```

:::

## Hooks

To access the `SelectionArea` instance, you can use the `useSelection` hook provided by the `@viselect/react` package.
The context is provided by the `SelectionArea` component, so make sure to use it within the component tree where the `SelectionArea` is rendered.
It contains a [SelectionArea](../api-reference.md) instance.

```tsx
import { useSelection } from '@viselect/react';
```
