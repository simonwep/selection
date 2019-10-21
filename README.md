<h1 align="center">
   <img alt="Logo" src="https://image.ibb.co/dejTj7/selection_js.png"/>
</h1>

<h3 align="center">
	Simple and easy selection library to enable visual
    DOM-Selection
</h3>

<p align="center">
    <a href="https://choosealicense.com/licenses/mit/"><img
        alt="License MIT"
        src="https://img.shields.io/badge/licence-MIT-blue.svg?style=flat-square"></a>
    <img alt="No dependencies"
        src="https://img.shields.io/badge/dependencies-none-3387e0.svg?style=flat-square">
    <a href="https://www.patreon.com/simonwep"><img
        alt="Support me"
        src="https://img.shields.io/badge/patreon-support-57D3E4.svg?style=flat-square"></a>
    <a href="https://www.jsdelivr.com/package/npm/@simonwep/selection-js"><img
        alt="jsdelivr hits"
        src="https://data.jsdelivr.com/v1/package/npm/@simonwep/selection-js/badge?style=flat-square"></a>
    <a href="https://travis-ci.org/Simonwep/selection"><img
        alt="Build Status"
        src="https://img.shields.io/travis/Simonwep/selection.svg?style=popout-square"></a>
    <a href="https://www.npmjs.com/package/@simonwep/selection-js"><img
        alt="downloads per week"
        src="https://img.shields.io/badge/downloads-1k%2Fweek-brightgreen.svg?style=flat-square"></a>
    <img alt="gzip size" src="https://img.badgesize.io/https://raw.githubusercontent.com/Simonwep/selection-js/master/dist/selection.min.js?compression=gzip&style=flat-square">
    <img alt="brotli size" src="https://img.badgesize.io/https://raw.githubusercontent.com/Simonwep/selection-js/master/dist/selection.min.js?compression=brotli&style=flat-square">
    <img alt="Current version"
        src="https://img.shields.io/github/tag/Simonwep/selection.svg?color=23AD62&label=version&style=flat-square">
</p>

<h3 align="center">
   <img
    width="700px"
    alt="Demo" src="https://user-images.githubusercontent.com/12004383/39947840-4685bc0e-556b-11e8-95cf-068ab6d7e9de.gif"/>
</h3>

<h3 align="center">
  <a href="https://simonwep.github.io/selection/">Fully Featured demo</a>
</h3>

<p align="center">
    <a href="https://www.buymeacoffee.com/aVc3krbXQ" target="_blank">
        <img src="https://user-images.githubusercontent.com/30767528/63641973-9d301680-c6b7-11e9-9d29-2ad1da50fdce.png"></a>
    </a>
</p>

### Features
* Supports touch devices
* Ultra small
* Highly optimized
* Simple usage
* No jQuery
* Vertical and horizontal scroll support

### Install

Via npm
```
$ npm install @simonwep/selection-js --save
```

Include via [jsdelivr.net](https://www.jsdelivr.com/)

```html
<script src="https://cdn.jsdelivr.net/npm/@simonwep/selection-js/dist/selection.min.js"></script>
```

## Usage
```javascript
const selection = new Selection({

    // Class for the selection-area-element
    class: 'selection-area',

    // px, how many pixels the point should move before starting the selection (combined distance).
    // Or specifiy the threshold for each axis by passing an object like {x: <number>, y: <number>}.
    startThreshold: 10,

    // Disable the selection functionality for touch devices
    disableTouch: false,

    // On which point an element should be selected.
    // Available modes are cover (cover the entire element), center (touch the center) or
    // the default mode is touch (just touching it).
    mode: 'touch',

    // Behaviour on single-click
    // Available modes are 'native' (element was mouse-event target) or 
    // 'touch' (element got touched)
    tapMode: 'native',

    // Enable single-click selection (Also disables range-selection via shift + ctrl)
    singleClick: true,

    // Query selectors from elements which can be selected
    selectables: [],

    // Query selectors for elements from where a selection can be start
    startareas: ['html'],

    // Query selectors for elements which will be used as boundaries for the selection
    boundaries: ['html'],

    // Query selector or dom node to set up container for selection-area-element
    selectionAreaContainer: 'body',

    // On scrollable areas the number on px per frame is devided by this amount.
    // Default is 10 to provide a enjoyable scroll experience.
    scrollSpeedDivider: 10
});

```

## Events
Since version `1.2.x` selection-js is event-driven. 
Use the `on(event, cb)` and `off(event, cb)` functions to bind / unbind event-listener.

| Event      | Description
| -------------- | ----------- | 
| `beforestart`  | The `mousedown` / `touchstart` got called inside a valid boundary.  |
| `start`        | User started the selection, the `startThreshold` got fulfilled. | 
| `move`         | The user dragged the mouse aroun. |
| `stop`         | The user stopped the selection, called on `mouseup` and `touchend` / `touchcancel` after a selection. |

Every event-object contains the folling properties:
```js
{
    oe,   // Original mouse- / touchevent.
    inst, // Selectionjs instance
    area, // Area element
    selected, // Array of currently selected elements
    changed: {
        added,  // Added elements against the previous event
        removed // Same as added but for removed elements
    }
}
```

> Example:
```js
selection.on('beforestart', evt => {
    // This function can return "false" to abort the selection
    console.log('beforestart', evt);
}).on('start', evt => {
    console.log('start', evt);
}).on('move', evt => {
    console.log('move', evt);
}).on('stop', evt => {
    console.log('stop', evt);
});
```

## Methods
* selection.on(event`:String`, cb`:Function`) _- Appends an event listener to the given corresponding event-name (see section Events), returns the current instance so it can be chained._
* selection.off(event`:String`, cb`:Function`) _- Removes an event listener from the given corresponding event-name (see section Events), returns the current instance so it can be chained._
* selection.option(name`:String`) _- Returns the option by name._
* selection.option(name`:String`, value`:Mixed`) _- Set a new option value._
* selection.disable() _- Disable the functionality to make selections._
* selection.enable() _- Enable the functionality to make selections._
* selection.destroy() _- Unbinds all events and removes the area-element._
* selection.cancel() _- Cancels the current selection process._

* selection.keepSelection() _- Will save the current selected elements and will append those to the next selection. Can be used to allow multiple selections._
* selection.clearSelection() _- Clear the previous selection (elements which were saved by `keepSelection()`)._
* selection.getSelection() _- Returns currently selected elements as an Array._
* selection.removeFromSelection(el`:HTMLElement`) _- Removes a particular element from the current selection._
* selection.resolveSelectables() _- Need to be called if during a selection elements have been added._
* selection.select(query`:[String]|String`) _- Manually appends elements to the selection, can be a / an array of queries / elements. Returns actual selected elements as array._

## Static methods

Selection
* Selection.create(options`:Object`)`:Selection` _- Creates a new instance._

Selection.utils

* on(el`:HTMLElement`, event`:String`, fn`:Function`[, options `:Object`]) _- Attach an event handler function._
* off(el`:HTMLElement`, event`:String`, fn`:Function`[, options `:Object`]) _- Remove an event handler._
* css(el`:HTMLElement`, attr`:String`, val`:String`) _- Set a specific style property._
* css(el`:HTMLElement`, attr`:Object`) _- Set multiple style properties._
* intersects(ela`:HTMLElement`, elb`:HTMLElement`)`:Boolean` _- Check if an HTMLElement intersects another._
* selectAll(selector`:String|Array`)`:Array` _- Returns all HTMLElements which were selected by the selector._
* eventPath(evt`:DOMEvent`)`:NodeList` _- Event.composedPath() polyfill._
* removeElement(arr`:Array`, el`:Object`) _- Removes an particular element from an Array._
