<h3 align="center">
    <img alt="Logo" src="https://user-images.githubusercontent.com/30767528/103286800-5a83fa00-49e1-11eb-8091-ef895c6f8241.png" width="300"/>
</h3>

<h3 align="center">
    Viselect - Vue
</h3>

<br>

### Installation

#### Via package manager

```
$ npm install @viselect/vue
# or 
$ yarn add @viselect/vue
```

#### Via script tags

```html

<script src="https://cdn.jsdelivr.net/npm/@viselect/vue/lib/viselect.min.js"></script>
```

##### Via ES6 import

```js
import SelectionArea from 'https://cdn.jsdelivr.net/npm/@viselect/vue/lib/viselect.min.mjs';
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

> Events are handled using props because you cannot return a value in events synchronously.

```vue
<template>
    <SelectionArea class="container green"
                   :options="{selectables: '.selectable'}"
                   :on-move="onMove"
                   :on-start="onStart">
        <div v-for="id of range(42)" :key="id" :data-key="id"
             class="selectable" :class="{selected: selected.has(id)}"/>
    </SelectionArea>
</template>

<script lang="ts">
import SelectionArea, {SelectionEvent} from '@viselect/vue';

export default {
    components: {SelectionArea},

    data() {
        return {
            selected: new Set()
        };
    },

    methods: {

        extractIds(els: Element[]): number[] {
            return els.map(v => v.getAttribute('data-key'))
                .filter(Boolean)
                .map(Number);
        },

        onStart({event, selection}: SelectionEvent) {
            if (!event?.ctrlKey && !event?.metaKey) {
                selection.clearSelection();
                this.selected.clear();
            }
        },

        onMove({store: {changed: {added, removed}}}: SelectionEvent) {
            this.extractIds(added).forEach(id => this.selected.add(id));
            this.extractIds(removed).forEach(id => this.selected.delete(id));
        },

        range(to: number, offset = 0): number[] {
            return new Array(to).fill(0).map((_, i) => offset + i);
        }
    }
};
</script>
```
