<h3 align="center">
    <img alt="Logo" src="https://user-images.githubusercontent.com/30767528/123517467-622b0f80-d6a1-11eb-9bf3-abcb4928a89e.png" width="300"/>
</h3>

<h3 align="center">
    Viselect - Vanilla
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
    <img alt="gzip size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@viselect/vanilla/lib/viselect.min.js?compression=gzip">
    <img alt="brotli size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@viselect/vanilla/lib/viselect.min.js?compression=brotli">
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
$ npm install @viselect/vanilla
# or 
$ yarn add @viselect/vanilla
```


#### Via script tags

```html
<script src="https://cdn.jsdelivr.net/npm/@viselect/vanilla/lib/viselect.min.js"></script>
```

##### Via ES6 import

```js
import SelectionArea from "https://cdn.jsdelivr.net/npm/@viselect/vanilla/lib/viselect.min.mjs"
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

```ts
const selection = new SelectionArea({

    // document object - if you want to use it within an embed document (or iframe).
    document: window.document,

    // Class for the selection-area element.
    class: 'selection-area',

    // Query selector or dom-node to set up container for the selection-area element.
    container: 'body',

    // Query selectors for elements which can be selected.
    selectables: [],

    // Query selectors for elements from where a selection can be started from.
    startareas: ['html'],

    // Query selectors for elements which will be used as boundaries for the selection.
    boundaries: ['html'],

    // px, how many pixels the point should move before starting the selection (combined distance).
    // Or specifiy the threshold for each axis by passing an object like {x: <number>, y: <number>}.
    startThreshold: 10,

    // Enable / disable touch support
    allowTouch: true,

    // On which point an element should be selected.
    // Available modes are cover (cover the entire element), center (touch the center) or
    // the default mode is touch (just touching it).
    intersect: 'touch',

    // Specifies what should be done if already selected elements get selected again.
    //   invert: Invert selection for elements which were already selected
    //   keep: Keep selected elements (use clearSelection() to remove those)
    //   drop: Remove stored elements after they have been touched
    overlap: 'invert',

    // Configuration in case a selectable gets just clicked.
    singleTap: {

        // Enable single-click selection (Also disables range-selection via shift + ctrl).
        allow: true,

        // 'native' (element was mouse-event target) or 'touch' (element visually touched).
        intersect: 'native'
    },

    // Scroll configuration.
    scrolling: {

        // On scrollable areas the number on px per frame is devided by this amount.
        // Default is 10 to provide a enjoyable scroll experience.
        speedDivider: 10,

        // Browsers handle mouse-wheel events differently, this number will be used as 
        // numerator to calculate the mount of px while scrolling manually: manualScrollSpeed / scrollSpeedDivider.
        manualSpeed: 750
    }
});

```

## Events
Use the `on(event, cb)` and `off(event, cb)` functions to bind / unbind event-listener.

| Event          | Description |
| -------------- | ----------- | 
| `beforestart` | The user tapped one of the areas within the specified boundaries. Return `false` to cancel selection immediatly.  |
| `start` | Selection started, here you can decide if you want to keep your previously selected elements. | 
| `move` | Selection is active, user is moving the pointer around. |
| `stop` | Selection has stopped. |

### Example

```ts
selection.on('beforestart', evt => {

    // Use this event to decide whether a selection should take place or not.
    // For example if the user should be able to normally interact with input-elements you 
    // may want to prevent a selection if the user clicks such a element:
    // selection.on('beforestart', ({event}) => {
    //   return event.target.tagName !== 'INPUT'; // Returning false prevents a selection
    // });

    console.log('beforestart', evt);
}).on('start', evt => {

    // A selection got initiated, you could now clear the previous selection or
    // keep it if in case of multi-selection.
    console.log('start', evt);
}).on('move', evt => {

    // Here you can update elements based on their state.
    console.log('move', evt);
}).on('stop', evt => {

    // Do something with the selected elements.
    console.log('stop', evt);
});
```

> Common recipes can be found under [recipes](recipes.md).
