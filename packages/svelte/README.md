<h3 align="center">
    <img alt="Logo" src="https://user-images.githubusercontent.com/30767528/103286800-5a83fa00-49e1-11eb-8091-ef895c6f8241.png" width="300"/>
</h3>

<h3 align="center">
    Viselect - Svelte
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
    <img alt="gzip size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@viselect/svelte/lib/viselect.min.js?compression=gzip">
    <img alt="brotli size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@viselect/svelte/lib/viselect.min.js?compression=brotli">
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
</p>

<br>

### Installation

#### Via package manager

```
$ npm install @viselect/svelte
# or 
$ yarn add @viselect/svelte
```


#### Via script tags

```html
<script src="https://cdn.jsdelivr.net/npm/@viselect/svelte/lib/viselect.min.js"></script>
```

##### Via ES6 import

```js
import SelectionArea from "https://cdn.jsdelivr.net/npm/@viselect/svelte/lib/viselect.min.mjs"
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

Additionally, to not interfere with text-selection, selection-js won't prevent any default events anymore (as of `v2.0.3`).
This however can cause problems with the actual selection ("introduced" by [#99](https://github.com/Simonwep/selection/pull/99), reported in [#103](https://github.com/Simonwep/selection/issues/103)).
If you don't care about text-selection, add the following to the container where all your selectables are located:

```css
.container {
    user-select: none;
}
```

### Usage

```sveltehtml
<script lang="ts">
    import type {SelectionEvent} from '@viselect/svelte';
    import SelectionArea from '@viselect/svelte';

    const range = (n: number, offset = 0) => new Array(n).fill(0).map((_, i) => offset + i);
    let selected: Set<number> = new Set();

    const extractIds = (els: Element[]): number[] =>
        els.map(v => v.getAttribute('data-key'))
            .filter(Boolean)
            .map(Number);

    const onStart = ({event, selection}: SelectionEvent) => {
        if (!event?.ctrlKey && !event?.metaKey) {
            selection.clearSelection();
            selected = new Set();
        }
    };

    const onMove = ({store: {changed: {added, removed}}}: SelectionEvent) => {
        extractIds(added).forEach(id => selected.add(id));
        extractIds(removed).forEach(id => selected.delete(id));
        selected = selected;
    };
    
</script>

<main>
    <SelectionArea className="container"
                   onStart={onStart}
                   onMove={onMove}
                   options={{selectables: '.selectable'}}>
        {#each range(42) as id}
            <div class="{selected.has(id) ? 'selectable selected' : 'selectable'}"
                 data-key={id}></div>
        {/each}
    </SelectionArea>
</main>
```
