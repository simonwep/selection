# Quickstart

### How to use Viselect

Viselect can be used with [Vue 3](./frameworks/vue.md), [preact](./frameworks/preact.md), [react](./frameworks/react.md), or [without](./frameworks/vanilla.md) any framework.
All its variants are available as separate packages under the `@viselect` namespace.

::: tip
Even though there are packages for all frameworks, due to its complexity, it is often better to go with a [custom integration](./custom-integration.md) if you're using a framework.
Don't worry, you can always switch to using the vanilla package later on if needed!
:::

For the following we'll use the vanilla package, an index.html file, a css file, and a js module to get started.

::: code-group

```js [main.mjs]
import SelectionArea from 'https://cdn.jsdelivr.net/npm/@viselect/vanilla/dist/viselect.mjs';

// Generate some divs to select later
[
  ['.container.blue', 33],
  ['.container.green', 33]
].forEach(([selector, items]) => {
  const container = document.querySelector(selector);

  for (let i = 0; i < items; i++) {
    container.appendChild(document.createElement('div'));
  }
});

// Instantiate the selection area
const selection = new SelectionArea({
  selectables: ['.container > div'], // Specifies the elements that can be selected
  boundaries: ['.container'], // Specifies the boundaries of each selection
  selectionAreaClass: 'selectionArea' // Specifies the class to be added to the selection area
}).on('start', ({ store, event }) => {
  if (!event.ctrlKey && !event.metaKey) {
    store.stored.forEach(el => el.classList.remove('selected'));
    selection.clearSelection();
  }
}).on('move', ({ store: { changed: { added, removed } } }) => {
  added.forEach(el => el.classList.add('selected'));
  removed.forEach(el => el.classList.remove('selected'));
});
```

```css [styles.css]
.container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    border: 2px dashed #4f5276;
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

.selectionArea {
    background: rgba(46, 115, 252, 0.11);
    border: 1px solid rgba(98, 155, 255, 0.85);
    border-radius: 0.15em;
}
```

```html [index.html]
<div class="container blue"></div>
<div class="container green"></div>
```

:::

Which will give you the following result:

<div :class="[$style.container, $style.blue]"/>
<div :class="[$style.container, $style.green]"/>

<script setup>
import { useCssModule, onMounted } from 'vue';
import SelectionArea from '@viselect/vanilla';

const styles = useCssModule();

onMounted(() => {
    [[styles.blue, 33], [styles.green, 33]].forEach(([selector, items]) => {
      const container = document.querySelector(`.${selector}`);
    
      for (let i = 0; i < items; i++) {
        container.appendChild(document.createElement('div'));
      }
    });

    const selection = new SelectionArea({
      selectables: [`.${styles.container} > div`],
      boundaries: [`.${styles.container}`],
      selectionAreaClass: styles.selectionArea
    }).on('start', ({ store, event }) => {
      if (!event.ctrlKey && !event.metaKey) {
        store.stored.forEach(el => el.classList.remove(styles.selected));
        selection.clearSelection();
      }
    }).on('move', ({ store: { changed: { added, removed } } }) => {
      added.forEach(el => el.classList.add(styles.selected));
      removed.forEach(el => el.classList.remove(styles.selected));
    }); 
});
</script>

<style module>
.container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    border: 2px dashed #4f5276;
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

.selectionArea {
    background: rgba(46, 115, 252, 0.11);
    border: 1px solid rgba(98, 155, 255, 0.85);
    border-radius: 0.15em;
}
</style>
