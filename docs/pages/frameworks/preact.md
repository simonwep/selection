# Using Viselect with Preact

::: tip
This is merely a convenience wrapper around the [core library](./vanilla.md).
The core API is fairly simple, if you want to have full control over it, you should [roll out your own wrapper](../custom-integration.md) in your app.
Don't worry, it's not that hard!
:::

## Installation

To use Viselect with Preact, install its Preact package with:

::: code-group

```sh [npm]
$ npm install @viselect/preact
```

```sh [pnpm]
$ pnpm install @viselect/preact
```

```sh [yarn]
$ yarn add @viselect/preact
```

:::

## Usage

You can use Viselect in your Preact project by importing the `SelectionArea` component from the `@viselect/preact` package.

::: tip
All options are exposed as props
They're a one-to-one mapping of the original options describe [here](../api-reference.md#selectionoptions)!
:::

::: code-group

```tsx [App.tsx]
import {SelectionArea, SelectionEvent} from '@viselect/preact';
import {FunctionalComponent} from 'preact';
import {useState} from 'preact/hooks';
import './styles.css';

const App: FunctionComponent = () => {
    const [selected, setSelected] = useState<Set<number>>(() => new Set());

    const extractIds = (els: Element[]): number[] =>
        els.map(v => v.getAttribute('data-key'))
            .filter(Boolean)
            .map(Number);

    const onStart = ({event, selection}: SelectionEvent) => {
        if (!event?.ctrlKey && !event?.metaKey) {
            selection.clearSelection();
            setSelected(() => new Set());
        }
    };

    const onMove = ({store: {changed: {added, removed}}}: SelectionEvent) => {
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

To access the `SelectionArea` instance, you can use the `useSelection` hook provided by the `@viselect/preact` package.
The context is provided by the `SelectionArea` component, so make sure to use it within the component tree where the `SelectionArea` is rendered.
It contains a [SelectionArea](../api-reference.md) instance.

```tsx
import { useSelection } from '@viselect/preact';
```
