<h3 align="center">
    <img alt="Logo" src="https://user-images.githubusercontent.com/30767528/103286800-5a83fa00-49e1-11eb-8091-ef895c6f8241.png" width="300"/>
</h3>

<h3 align="center">
    Viselect - React
</h3>

<br>

### Installation

#### Via package manager

```
$ npm install @viselect/react
# or 
$ yarn add @viselect/react
```

#### Via script tags

```html

<script src="https://cdn.jsdelivr.net/npm/@viselect/react/lib/viselect.min.js"></script>
```

##### Via ES6 import

```js
import SelectionArea from 'https://cdn.jsdelivr.net/npm/@viselect/react/lib/viselect.min.mjs';
```

### Getting started

Last but not least you'll need to add some basic styles to make your selection-area visible:

```css
.selection-area {
    background: rgba(46, 115, 252, 0.11);
    border: 2px solid rgba(98, 155, 255, 0.81);
    border-radius: 0.1em;
}
```

Additionally, to not interfere with text-selection, selection-js won't prevent any default events anymore (as of `v2.0.3`). This however can cause problems with the actual
selection ("introduced" by [#99](https://github.com/Simonwep/selection/pull/99), reported in [#103](https://github.com/Simonwep/selection/issues/103)). If you don't care about
text-selection, add the following to the container where all your selectables are located:

```css
.container {
    user-select: none;
}
```

### Usage

> All options are exposed as props. They're a one-to-one mapping of the original options found in the [vanilla](../vanilla) version!

```tsx
import SelectionArea, {SelectionEvent} from '@viselect/react';
import React, {FunctionComponent, useState} from 'react';

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
