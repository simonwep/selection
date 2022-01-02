<h3 align="center">
    <img alt="Logo" src="https://user-images.githubusercontent.com/30767528/123517467-622b0f80-d6a1-11eb-9bf3-abcb4928a89e.png" width="300"/>
</h3>

<h3 align="center">
    Viselect - Preact
</h3>

<p align="center">
    <a href="https://choosealicense.com/licenses/mit/"><img
        alt="License MIT"
        src="https://img.shields.io/badge/license-MIT-ae15cc.svg"></a>
    <img alt="No dependencies"
        src="https://img.shields.io/badge/dependencies-none-8115cc.svg">
    <a href="https://github.com/sponsors/Simonwep"><img
        alt="Support me"
        src="https://img.shields.io/badge/github-support-6a15cc.svg"></a>
    <a href="https://www.buymeacoffee.com/aVc3krbXQ"><img
        alt="Buy me a coffee"
        src="https://img.shields.io/badge/%F0%9F%8D%BA-buy%20me%20a%20beer-%23FFDD00"></a>
    <a href="https://github.com/Simonwep/selection/actions?query=workflow%3ACI"><img
        alt="Build Status"
        src="https://github.com/Simonwep/selection/workflows/CI/badge.svg"></a>
    <img alt="gzip size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@viselect/preact/lib/viselect.esm.js?compression=gzip">
    <img alt="brotli size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@viselect/preact/lib/viselect.esm.js?compression=brotli">
    <a href="https://v3.vuejs.org"><img
        alt="Vue support"
        src="https://img.shields.io/badge/✔-vue-%2340B581"></a>
    <a href="https://preactjs.com/"><img
        alt="Preact support"
        src="https://img.shields.io/badge/✔-preact-%236337B1"></a>
    <a href="https://reactjs.org"><img
        alt="React support"
        src="https://img.shields.io/badge/✔-react-%2359D7FF"></a>
    <a href="https://svelte.dev"><img
        alt="Svelte support"
        src="https://img.shields.io/badge/%E2%9A%99-svelte-%23F83C00"></a>
    <a href="https://lit-element.polymer-project.org"><img
        alt="Lit-Element support"
        src="https://img.shields.io/badge/%E2%9A%99-lit--element-%233CA4F6"></a>
    <a href="https://lit-element.polymer-project.org"><img
        alt="Lit-Element support"
        src="https://img.shields.io/badge/%E2%9A%99-angular-%23c3002f"></a>
</p>

<br>

### Installation

#### Via package manager

```
$ npm install @viselect/preact
# or 
$ yarn add @viselect/preact
```

#### Via script tags

```html

<script src="https://cdn.jsdelivr.net/npm/@viselect/preact/lib/viselect.cjs.js"></script>
```

##### Via ES6 import

```js
import SelectionArea from 'https://cdn.jsdelivr.net/npm/@viselect/preact/lib/viselect.esm.js';
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
import SelectionArea, {SelectionEvent} from '@viselect/preact';
import {FunctionalComponent} from 'preact';
import {useState} from 'preact/hooks';

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


#### Accessing the vanilla version

It's better to access the underlying vanilla version than installing the `@viselect/vanilla` package separately.

```ts
import {VanillaSelectionArea} from '@viselect/preact';
// ...
```
