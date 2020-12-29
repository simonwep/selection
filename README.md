<h3 align="center">
    <img alt="Logo" src="https://user-images.githubusercontent.com/30767528/103286800-5a83fa00-49e1-11eb-8091-ef895c6f8241.png" width="400"/>
</h3>

<h3 align="center">
    Visual dom-selection library 
</h3>

<p align="center">
    <a href="https://choosealicense.com/licenses/mit/"><img
        alt="License MIT"
        src="https://img.shields.io/badge/licence-MIT-ae15cc.svg"></a>
    <img alt="No dependencies"
        src="https://img.shields.io/badge/dependencies-none-8115cc.svg">
    <a href="https://www.patreon.com/simonwep"><img
        alt="Support me"
        src="https://img.shields.io/badge/patreon-support-6a15cc.svg"></a>
    <a href="https://www.jsdelivr.com/package/npm/@simonwep/selection-js"><img
        alt="jsdelivr hits"
        src="https://img.shields.io/jsdelivr/npm/hm/@simonwep/selection-js"></a>
    <a href="https://github.com/Simonwep/selection/actions?query=workflow%3ACI"><img
        alt="Build Status"
        src="https://github.com/Simonwep/selection/workflows/CI/badge.svg"></a>
    <a href="https://www.npmjs.com/package/@simonwep/selection-js"><img
        alt="downloads per week"
        src="https://img.shields.io/badge/downloads-1k%2Fweek-brightgreen.svg"></a>
    <img alt="gzip size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@simonwep/selection-js/lib/selection.min.js?compression=gzip">
    <img alt="brotli size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@simonwep/selection-js/lib/selection.min.js?compression=brotli">
    <img alt="Current version"
        src="https://img.shields.io/github/tag/Simonwep/selection.svg?color=23AD62&label=version">
</p>

<p align="center">
    <a href="https://www.buymeacoffee.com/aVc3krbXQ" target="_blank">
        <img src="https://user-images.githubusercontent.com/30767528/63641973-9d301680-c6b7-11e9-9d29-2ad1da50fdce.png"></a>
    </a>
</p>

> This README is always up-to-date with the **lastest version**. Check out [releases](https://github.com/Simonwep/selection/releases) if you want to check out the documentation for your version.

### Features
* Tiny (only ~4kb)
* Simple usage
* Highly optimized
* Zero dependencies
* Mobile / touch support
* Vertical and horizontal scroll support

### Install

Via npm:
```
$ npm install @simonwep/selection-js
```

Via yarn:
```
$ yarn add @simonwep/selection-js
```

Include via [jsdelivr.net](https://www.jsdelivr.com/package/npm/@simonwep/selection-js):
```html
<script src="https://cdn.jsdelivr.net/npm/@simonwep/selection-js/lib/selection.min.js"></script>
```

Or using ES6 modules:
```js
import {SelectionArea} from "https://cdn.jsdelivr.net/npm/@simonwep/selection-js/lib/selection.min.mjs"
```

Last but not least you'll need to add some basic styles to make your selection-area visible:
```css
.selection-area {
    background: rgba(46, 115, 252, 0.11);
    border: 2px solid rgba(98, 155, 255, 0.81);
    border-radius: 0.1em;
}
```

## Usage
```javascript
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

> You may want to checkout the [source](https://gist.github.com/Simonwep/b0c25725a4715c1c5aab501d6a782a71) used in the demo-page, it's easier than reading through the manual.

| Event          | Description |
| -------------- | ----------- | 
| `beforestart` | The user tapped one of the areas within the specified boundaries. Return `false` to cancel selection immediatly.  |
| `start` | Selection started, here you can decide if you want to keep your previously selected elements. | 
| `move` | Selection is active, user is moving the pointer around. |
| `stop` | Selection has stopped. |

Check out [types.ts](https://github.com/Simonwep/selection/blob/v2/src/types.ts) to see what kind of data is passed to each event.

> Example:

```js
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

    // The last event can be used to call functions like keepSelection() in case the user wants
    // to select multiple elements.
    console.log('stop', evt);
});
```

> You can find event-related examples [here](EXAMPLES.md).

## Methods

| Method | Description |
| ------ | ----------- |
| **on**(event`:String`, cb`:Function`) | Adds an event listener to the given corresponding event-name (see section Events), returns the current instance, so it can be chained. |
| **off**(event`:String`, cb`:Function`) | Removes an event listener from the given corresponding event-name (see section Events), returns the current instance, so it can be chained. |
| **disable**() | Disable the functionality to make selections. |
| **enable**() | Enable the functionality to make selections. |
| **destroy**() | Unbinds all events and removes the area-element. |
| **cancel**() | Cancels the current selection process. |
| **trigger**(evt`:MouseEvent \| TouchEvent`, silent`: boolean` = true)  | Manually triggers the start of a selection. If `silent` is set to true, no `beforestart` event will be fired. |
| **keepSelection**() | Will save the current selected elements and will append those to the next selection. Can be used to allow multiple selections. |
| **clearSelection**(store`:boolean` = true) | Clear the previous selection (elements which were stored by calling `keepSelection()`). Pass false to only clear the currently selected elements. |
| **getSelection**() | Returns currently selected elements. |
| **resolveSelectables**() | Need to be called if during a selection elements have been added / removed. |
| **select**(query`:(String \| Element)[]`) | Manually appends elements to the selection, can be a / an array of queries / elements. Returns actual selected elements as array. |
| **deselect**(el`:HTMLElement`, silent`: boolean` = true) | Removes a particular element from the current selection. `silent` determines whether the `move` event should be fired. |

