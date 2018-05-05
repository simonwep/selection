<h1 align="center">
   <img alt="Logo" src="https://image.ibb.co/dejTj7/selection_js.png"/>
</h1>

<h3 align="center">
	Simple and easy selection library to enable visual
    DOM-Selection
</h3>

<p align="center">
    <a href="https://choosealicense.com/licenses/gpl-3.0/"><img
		alt="License MIT"
		src="https://img.shields.io/badge/licence-MIT-blue.svg"></a>
	<a href="http://es6-features.org/"><img
		alt="Javascript ES6"
		src="https://img.shields.io/badge/Javascript-ES6-green.svg"></a>
	<a href="https://www.npmjs.com/"><img 
		alt="npm version"
		src="https://img.shields.io/badge/npm-5.8.0-brightgreen.svg"></a>
	<img alt="Current version"
		src="https://img.shields.io/badge/version-0.0.5-23AD62.svg">
	<img alt="No dependencies"
		src="https://img.shields.io/badge/dependencies-none-57CCE4.svg">
</p>

## Selection
Selection.js is an simple, lightweight, and modern library for making visual DOM Selections.

Quick demo: https://simonwep.github.io/selection

### Features
* Supports touch devices
* Simple usage
* No jQuery 
* Nodejs support
* Lightweight, 3KB gzipped

### Install via npm

`$ npm install @simonwep/selection-js --save`

Or simply include it via `script` tag:
```javascript 
<script src="selection.min.js"></script>
```

## Usage
```javascript

const options = {
  
  // All elemets with the class 'selectable' selectable.
  selectables: ['.selectable']
};
const selection = Selection.create(options);
```
It's reccommended to also specify a bounding area for the selection (see 'Options').

*** 

## Options
```javascript
const selection = new Selection({  
    
    // Class for the selection-area-element
    // Default: 'selection-area'
    class: 'selection',

    // px, how many pixels the point should move before starting the selection
    // Default: 0
    startThreshold: 10,

    // Disable the selection functionality for touch devices
    // Default: false
    disableTouch: false,
    
    // Query selectors from elements from which the siblings can be selected
    // Default: Empty array
    containers: [],

    // Query selectors from elements which can be selected
    // Default: Empty array
    selectables: [],
    
    // Query selectors for elements from where a selection can be start
    // Default: ['html']
    startareas: [],
    
    // Query selectors for elements which will be used as boundarys for the selection
    // Default: ['html']
    boundarys: [],
    
    // Element selection stardet             
    onStart(evt) {
        evt.selection;
        evt.eventName;
        evt.areaElement;
        evt.originalEvent;
        evt.selectedElements;
        evt.changedElements;
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
    startFilter(evt) {
        evt.selection; // This selection instance
        evt.eventName; // The event name
        evt.element;   // The element from where the user stardet the selection
                      
        // return false to cancel the selection process
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
 * selection`:Selection` _- Current selection object._
 * eventName`:String` _- The event name._
 * element`:HTMLElement` _- HTMLElement from which the selection starts._


## Static methods

Selection
* Selection.create(options`:Object`)`:Selection` _- Creates a new instance._

Selection.utils

* on(el`:HTMLElement`, event`:String`, fn`:Function`) _- Attach an event handler function._
* off(el`:HTMLElement`, event`:String`, fn`:Function`) _- Remove an event handler._
* css(el`:HTMLElement`)`:Object` _- Get all css properties from this element._
* css(el`:HTMLElement`, attr`:String`)`:Mixed` _- Get the value from a style property._
* css(el`:HTMLElement`, attr`:String`, val`:String`) _- Set a specific style property._
* css(el`:HTMLElement`, attr`:Object`) _- Set multiple style properties._
* intersects(ela`:HTMLElement`, elb`:HTMLElement`)`:Boolean` _- Check if an HTMLElement intersects another._
* selectAll(selector`:String|Array`)`:Array` _- Returns all HTMLElements which were selected by the selector_
* eventPath(evt`:DOMEvent`)`:Array` _- Provides compatability for Firefox and Safari for the Chrome Event.path method._
