# Using Viselect with Vue

::: tip
This is merely a convenience wrapper around the [core library](./vanilla.md).
The core API is fairly simple, if you want to have full control over it, you should [roll out your own wrapper](../custom-integration.md) in your app.
Don't worry, it's not that hard!
:::

## Installation

To use Viselect with Vue, install its Vue package with:

::: code-group

```sh [npm]
$ npm install @viselect/vue
```

```sh [pnpm]
$ pnpm install @viselect/vue
```

```sh [yarn]
$ yarn add @viselect/vue
```

:::

## Usage

You can use Viselect in your Vue project by importing the `SelectionArea` component from the `@viselect/vue` package.

::: tip
All options are exposed as `options` prop.
They're a one-to-one mapping of the original options describe [here](../api-reference.md#selectionoptions)!
:::

::: info
Events are handled using props because you can’t return a value in events synchronously!
:::

```vue [App.vue]
<template>
  <SelectionArea class="container"
                 :options="{ selectables: '.selectable' }"
                 :onMove="onMove"
                 :onStart="onStart">
    <div v-for="id of 42"
         class="selectable"
         :key="id" 
         :data-key="id"
         :class="{ selected: selected.has(id) }"/>
  </SelectionArea>
</template>

<script lang="ts" setup>
import { SelectionArea, SelectionEvent } from '@viselect/vue';
import { reactive } from 'vue';

const selected = reactive<Set<number>>(new Set());

const extractIds = (els: Element[]): number[] => {
  return els.map(v => v.getAttribute('data-key'))
      .filter(Boolean)
      .map(Number);
};

const onStart = ({ event, selection }: SelectionEvent) => {
  if (!event?.ctrlKey && !event?.metaKey) {
    selection.clearSelection();
    selected.clear();
  }
};

const onMove = ({ store: { changed: { added, removed } } }: SelectionEvent) => {
  extractIds(added).forEach(id => selected.add(id));
  extractIds(removed).forEach(id => selected.delete(id));
};
</script>

<style>
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

.container.green div.selected {
    background: linear-gradient(45deg, #78b2ff, #218ad9);
}

.container.blue div.selected {
    background: linear-gradient(45deg, #9e91ef, #5c51b4);
}

.selection-area {
    background: rgba(46, 115, 252, 0.11);
    border: 1px solid rgba(98, 155, 255, 0.85);
    border-radius: 0.15em;
}
</style>
```

## Exposed API

#### `selection`

It's possible to get the current `SelectionArea`-instance via [template refs](https://vuejs.org/guide/essentials/template-refs.html).

```vue
<template>
  <SelectionArea 
    class="container"
    :options="{selectables: '.selectable'}"
    ref="selectionAreaRef"
  >
    <div 
        v-for="id of 42"
        class="selectable"
        :key="id" 
        :data-key="id"
        :class="{selected: selected.has(id)}"
    />
  </SelectionArea>
</template>

<script lang="ts" setup>
import { SelectionArea } from '@viselect/vue';
import { ref, reactive, watchEffect } from 'vue';

const selected = reactive<Set<number>>(new Set());
const selectionAreaRef = ref<InstanceType<typeof SelectionArea>>();

watchEffect(() => {
  // log selection instance
  console.log(selectionAreaRef.value?.selection)
});
</script>
```
