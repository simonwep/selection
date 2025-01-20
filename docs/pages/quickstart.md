# Quickstart

> [!NOTE]
> This documentation is brand new ✨
> If you have any questions or something's missing, feel free to [open an issue](https://github.com/simonwep/viselect/issues) 💖

Viselect can be used with [vue 3](./frameworks/vue.md), [preact](./frameworks/preact.md), [react](./frameworks/react.md), or [without](./frameworks/vanilla.md) any framework.
All its variants are available as separate packages under the `@viselect` namespace.

> [!TIP]
> Even though there are packages for all frameworks, due to its complexity, it is often better to go with a [custom integration](./custom-integration.md) if you're using a framework.
> Don't worry, you can always switch to using the vanilla package later on if needed!

For the following we'll use the vanilla package, an `index.html`, `styles.css`, and `main.mjs` file to demonstrate how to set up a selection area.

::: code-group

```js [main.mjs]
import SelectionArea from 'https://cdn.jsdelivr.net/npm/@viselect/vanilla/dist/viselect.mjs';
// or import SelectionArea from '@viselect/vanilla';

// Generate some divs to select later on
[
  ['.container.purple', 33],
  ['.container.blue', 33]
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
  justify-content: center;
  border-radius: 15px;
  padding: 10px;
  margin: 15px 0;
  user-select: none;
}

.container div {
  height: 50px;
  width: 50px;
  margin: 4px;
  background: rgba(66, 68, 90, 0.075);
  border-radius: 5px;
  cursor: pointer;
}

.container.blue {
  border: 2px dashed #a8b1ff;
}

.container.purple {
  border: 2px dashed #c8abfa;
}

.container.blue div.selected {
  background: #5c73e7;
}

.container.purple div.selected {
  background: #a879e6;
}

.selectionArea {
  background: rgba(102, 110, 255, 0.16);
  border: 1px solid rgb(62, 99, 221);
  border-radius: 0.15em;
}
```

```html [index.html]
<div class="container blue"></div>
<div class="container green"></div>
```

:::

Which will give you something like this:

<div ref="container" :class="[$style.container, $style.purple]"/>
<div :class="[$style.container, $style.blue]"/>

<script setup>
import {useCssModule, onMounted, useTemplateRef} from 'vue';
import SelectionArea from '@viselect/vanilla';

const styles = useCssModule();
const container = useTemplateRef('container');
const { matches: mobile } = window.matchMedia('(max-width: 430px)');

onMounted(() => {
  const { width } = container.value.getBoundingClientRect();
  const boxes = 33;
  const rows = 3;
  const totalBoxMargin = 4 * 2 * (boxes / rows);
  const boxWidth = (width - 20 - 4 - totalBoxMargin) / ((boxes / rows));
  
  [[styles.purple, boxes], [styles.blue, boxes]].forEach(([selector, items]) => {
    const container = document.querySelector(`.${selector}`);
  
    for (let i = 0; i < items; i++) {
      const div = document.createElement('div');
      div.style.width = div.style.height = `${Math.floor(boxWidth)}px`;
      container.appendChild(div);
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
  justify-content: center;
  border-radius: 15px;
  padding: 10px;
  margin: 15px 0;
  user-select: none;
}

.container div {
  margin: 4px;
  background: rgba(66, 68, 90, 0.075);
  border-radius: 0.75vw;
  cursor: pointer;
}

.container.blue {
  border: 2px dashed var(--vp-c-indigo-1);
}

.container.purple {
  border: 2px dashed var(--vp-c-purple-1);
}

.container.blue div.selected {
  background: var(--vp-c-indigo-2);
}

.container.purple div.selected {
  background: var(--vp-c-purple-2);
}

.selectionArea {
  background: var(--vp-c-indigo-soft);
  border: 1px solid var(--vp-c-indigo-3);
  border-radius: 6px;
}
</style>

## Configuration

The following is the default configuration for the selection area, which can be customized to fit your needs.
For more information on the available options, check out the [API reference](./api-reference.md).

```ts
const selection = new SelectionArea({

  // Class for the selection-area itself (the element).
  selectionAreaClass: 'selection-area',

  // Class for the selection-area container.
  selectionContainerClass: 'selection-area-container',

  // Query selector or dom-node to set up container for the selection-area element.
  container: 'body',

  // document object - if you want to use it within an embed document (or iframe).
  // If you're inside of a shadow-dom make sure to specify the shadow root here.
  document: window.document,

  // Query selectors for elements which can be selected.
  selectables: [],

  // Query selectors for elements from where a selection can be started from.
  startareas: ['html'],

  // Query selectors for elements which will be used as boundaries for the selection.
  // The boundary will also be the scrollable container if this is the case.
  boundaries: ['html'],

  // Behaviour related options.
  behaviour: {

    // Specifies what should be done if already selected elements get selected again.
    //   invert: Invert selection for elements which were already selected
    //   keep: Keep selected elements (use clearSelection() to remove those)
    //   drop: Remove stored elements after they have been touched
    overlap: 'invert',

    // On which point an element should be selected.
    // Available modes are cover (cover the entire element), center (touch the center) or
    // the default mode is touch (just touching it).
    intersect: 'touch',

    // px, how many pixels the point should move before starting the selection (combined distance).
    // Or specifiy the threshold for each axis by passing an object like {x: <number>, y: <number>}.
    startThreshold: 10,

    // List of triggers that should cause the selection to begin.
    // Each element in the list can be one of the following
    //    - a MouseButton (numbers 0 through 4)
    //    see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button#value
    //    - an object of shape { button: MouseButton, modifiers: Modifier[] }
    //    where a Modifier is ( 'ctrl' | 'meta' | 'alt' | 'shift' )
    //
    // To trigger the selection with e.g. <CTRL + SHIFT + LEFT-CLICK> OR <RIGHT-CLICK> the
    // trigger property should look like
    //
    // triggers: [ { button: 0, modifiers: [ "ctrl", "shift" ] }, 2 ]
    // 
    // The default value is [0], enabling only the main mouse button (usually left click).
    // On mac the ctrl will act as the meta key.
    triggers: [0],

    // Scroll configuration.
    scrolling: {

      // On scrollable areas the number on px per frame is devided by this amount.
      // Default is 10 to provide a enjoyable scroll experience.
      speedDivider: 10,

      // Browsers handle mouse-wheel events differently, this number will be used as 
      // numerator to calculate the mount of px while scrolling manually: manualScrollSpeed / scrollSpeedDivider.
      manualSpeed: 750,

      // This property defines the virtual inset margins from the borders of the container
      // component that, when crossed by the mouse/touch, trigger the scrolling. Useful for
      // fullscreen containers.
      startScrollMargins: {x: 0, y: 0}
    }
  },

  // Additional, built-in features.
  features: {

    // Enable / disable touch support.
    touch: true,

    // Range selection.
    range: true,

    // De-select all if user clicks clicks outside selectables.
    // Disabled by default because it is not possible to reliably detect if the user clicked on a scrollbar.
    deselectOnBlur: false,

    // Configuration in case a selectable gets just clicked.
    singleTap: {

      // Enable single-click selection (Also disables range-selection via shift + ctrl).
      allow: true,

      // 'native' (element was mouse-event target) or 'touch' (element visually touched).
      intersect: 'native'
    }
  }
});
```

## What's next

If you are working on a large-scale project, you might want to consider a [custom integration](./custom-integration.md) to have more control over the selection process.
It only takes marginally more effort to set up and can save you a lot of time in the long run as your project grows.

If you just want to get it up and running quickly, you can check out the setup instructions for [vue 3](./frameworks/vue.md), [preact](./frameworks/preact.md), [react](./frameworks/react.md), or [vanilla](./frameworks/vanilla.md) to get started right away.

If you have any questions, [open a discussion](https://github.com/simonwep/viselect/discussions), check out [current issues](https://github.com/simonwep/viselect/issues) or take a look at the [faqs](./faq.md) to see if your question has already been answered.

For further information on the API, check out the [API reference](./api-reference.md).

