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
        src="https://img.shields.io/badge/licence-MIT-blue.svg"></a>
    <a href="https://webpack.js.org/"><img
        alt="Webpack"
        src="https://img.shields.io/badge/Webpack-4-blue.svg"></a>
    <img alt="No dependencies"
        src="https://img.shields.io/badge/dependencies-none-3387e0.svg">
    <a href="https://travis-ci.org/Simonwep/selection"><img
        alt="Build Status"
        src="https://travis-ci.org/Simonwep/selection.svg?branch=master"></a>
    <a href="https://www.npmjs.com/"><img
        alt="npm package"
        src="https://img.shields.io/badge/npm-6.0.1-brightgreen.svg"></a>
    <a href="https://www.npmjs.com/package/@simonwep/selection-js"><img
          alt="downloads per week"
        src="https://img.shields.io/badge/downloads-1k%2Fweek-brightgreen.svg"></a>
    <img alt="Current version"
        src="https://img.shields.io/badge/version-0.1.0-23AD62.svg">
</p>

<h2 align="center">
   <img
    width="700px"
    alt="Demo" src="https://user-images.githubusercontent.com/12004383/39947840-4685bc0e-556b-11e8-95cf-068ab6d7e9de.gif"/>
</h2>

Quick demo: https://simonwep.github.io/selection

### Features
* Supports touch devices
* Simple usage
* No jQuery
* Nodejs support
* Lightweight, 4KB gzipped

### Install

Via npm
```
$ npm install @simonwep/selection-js --save
```

Include via [jsdelivr.net](https://www.jsdelivr.com/)

```javascript
<script src="https://cdn.jsdelivr.net/npm/@simonwep/selection-js@0.0.11/dist/selection.min.js"></script>
```

## Usage
```javascript
const options = {

  // All elemets with the class 'selectable' selectable.
  selectables: ['.selectable']
};
const selection = Selection.create(options);
```
It's recommend to also specify a bounding area for the selection (see 'Options').

***

## Options
```javascript
const selection = new Selection({

    // Class for the selection-area-element
    class: 'selection-area',

    // px, how many pixels the point should move before starting the selection
    startThreshold: 10,

    // Disable the selection functionality for touch devices
    disableTouch: false,

    // Enable single-click selection
    singleClick: true,

    // Query selectors from elements from which the siblings can be selected
    containers: [],

    // Query selectors from elements which can be selected
    selectables: [],

    // Query selectors for elements from where a selection can be start
    startareas: ['html'],

    // Query selectors for elements which will be used as boundaries for the selection
    boundaries: ['html'],

    // Element selection stardet, see Events for details
    onStart(evt) {
        evt.selection;
        evt.eventName;
        evt.areaElement;
        evt.originalEvent;
        evt.selectedElements;
        evt.changedElements;
    },

    // Single-click selection
    onSelect(evt) {
       // Same properties as onStart
       evt.target; // Clicked element
    },

    // Element selection move
    onMove(evt) {
       // Same properties as onStart
    },

    // Element selection stopped
    onStop(evt) {
       // Same properties as onStart
    },

    // Element selection has stardet
    selectionFilter(evt) {
        evt.selection; // This selection instance
        evt.eventName; // The event name
        evt.element;   // The element which is in the current selection

        // return true to keep the element
    },
});

```

## Methods
* selection.option(name`:String`) _- Returns the option by name._
* selection.option(name`:String`, value`:Mixed`) _- Set a new option value._
* selection.disable() _- Disable the functionality to make selections._
* selection.enable() _- Enable the functionality to make selections._


* selection.keepSelection() _- Will save the current selected elements and will append those to the next selection. Can be used to allow multiple selections._
* selection.clearSelection() _- Clear the previous selection (elements which where saved by `keepSelection()`)._
* selection.removeFromSelection(el`:HTMLElement`) _- Removes a particular element from the current selection._

## Events

### start / stop / move event
 * selection`:Selection` _- Current selection object._
 * eventName`:String` _- The event name._
 * areaElement`:HTMLElement` _- The selection element._
 * originalEvent`:Event` _- The original mouse-event._
 * selectedElements`:Array[HTMLElements]` _- Array with currently selected HTMLElements._
 * changedElements`:Object`
 * added`:Array[HTMLElements]` _- Elements which are added to `selectedElements` since the last interaction (mousemove)._
 * removed`:Array[HTMLElements]`  _- Elements which are removed from `selectedElements` since last interaction (mousemove)._


### Filter event
Will be called on every selection, can be used to ignore specific elements in the current selection.
 * selection`:Selection` _- Current selection object._
 * eventName`:String` _- The event name._
 * element`:HTMLElement` _- HTMLElement, return false if you didn't want it in the selection._


## Static methods

Selection
* Selection.create(options`:Object`)`:Selection` _- Creates a new instance._

Selection.utils

* on(el`:HTMLElement`, event`:String`, fn`:Function`[, options `:Object`]) _- Attach an event handler function._
* off(el`:HTMLElement`, event`:String`, fn`:Function`[, options `:Object`]) _- Remove an event handler._
* css(el`:HTMLElement`)`:Object` _- Get all css properties from this element._
* css(el`:HTMLElement`, attr`:String`)`:Mixed` _- Get the value from a style property._
* css(el`:HTMLElement`, attr`:String`, val`:String`) _- Set a specific style property._
* css(el`:HTMLElement`, attr`:Object`) _- Set multiple style properties._
* intersects(ela`:HTMLElement`, elb`:HTMLElement`)`:Boolean` _- Check if an HTMLElement intersects another._
* selectAll(selector`:String|Array`)`:Array` _- Returns all HTMLElements which were selected by the selector._
* eventPath(evt`:DOMEvent`)`:NodeList` _- Event.composedPath() polyfill._
* removeElement(arr`:Array`, el`:Object`) _- Removes an particular element from an Array._

## Todos / Ideas
* [x] Keep selection option -> select multiple times.
* [x] Select via single-click.
