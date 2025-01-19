---
outline: deep
---

# API Reference

The `SelectionArea` is the main class of the library, it is responsible for handling the selection process.
It is passed to each event and can be used to interact with the selection process.

## Static Properties

The only static property is the version of the library.

```typescript
version: string;
```

## Events

All events receive a [selection event](#selectionevent) object.
Events are bind/unbind using the [on](#on--addeventlistener) and [off](#off--removeeventlistener) methods:

```ts
selection.on('beforestart', evt => {

  // Use this event to decide whether a selection should take place or not.
  // For example if the user should be able to normally interact with input-elements you 
  // may want to prevent a selection if the user clicks such a element:
  // selection.on('beforestart', ({event}) => {
  //   return event.target.tagName !== 'INPUT'; // Returning false prevents a selection
  // });

  console.log('beforestart', evt);
}).on('beforedrag', evt => {

  // Same as 'beforestart' but before a selection via dragging happens.
  console.log('beforedrag', evt);
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

### `beforestart`

The user tapped one of the areas within the specified boundaries.
Return `false` to cancel selection immediately.

```typescript
beforestart: (e: SelectionEvent) => boolean | void;
```

### `beforedrag`

Same as `beforestart` but _before_ the user starts selecting by dragging the mouse.
Can be used to conditionally allow a selection by dragging. Return `false` to cancel the selection.

```typescript
beforedrag: (e: SelectionEvent) => boolean | void;
```

### `start`

Selection started, here you can decide if you want to keep your previously selected elements.

```typescript
start: (e: SelectionEvent) => void;
```

### `move`

Selection is active, user is moving the pointer around.
This is where you apply styles to selected elements and process them further.

```typescript
move: (e: SelectionEvent) => void;
```

### `stop`

Selection has stopped.

```typescript
stop: (e: SelectionEvent) => void;
```

## Methods

### `constructor`

Instantiates a new `SelectionArea`.

```typescript
constructor(opt: PartialSelectionOptions): SelectionArea;
```

- `opt: PartialSelectionOptions` - The options for the selection area.

### `on` / `addEventListener`

Binds an event listener, listener functions are documented under [Events](#events).

```typescript
on(event: string, listener: (e: SelectionEvent) => void): void;
addEventListener(event: string, listener: (e: SelectionEvent) => void): void;
```

- `event: string` - The event to listen to.
- `listener: (e: SelectionEvent) => void` - The listener function.

### `off` / `removeEventListener`

Unbinds an event listener, listener functions are documented under [Events](#events).

```typescript
off(event: string, listener: (e: SelectionEvent) => void): void;
removeEventListener(event: string, listener: (e: SelectionEvent) => void): void;
```

- `event: string` - The event to unbind.
- `listener: (e: SelectionEvent) => void` - The listener function.

### `trigger`

Manually triggers the start of a selection, can be used to start a selection without a user interaction.

```typescript
trigger(evt: MouseEvent | TouchEvent, silent = true): void;
```

- `evt: MouseEvent | TouchEvent` - A MouseEvent or TouchEvent-like object.
- `silent: boolean` - If `beforestart` should be fired.

### `resolveSelectables`

Updates the list of selectables, useful if new elements have been added during a selection.

```typescript
resolveSelectables(): void;
```

### `clearSelection`

Clears the selection.

```typescript
clearSelection(includeStored = true, quiet = false): void;
```

- `includeStored: boolean` - If the store should also get cleared.
- `quiet: boolean` - If move/stop events should be fired.

### `getSelection`

Returns currently selected elements.

```typescript
getSelection(): Element[];
```

### `getSelectionArea`

Returns the selection area element.

```typescript
getSelectionArea(): HTMLElement;
```

### `getSelectables`

Returns all selectables.

```typescript
getSelectables(): Element[];
```

### `setAreaLocation`

Sets the location of the selection area.

```typescript
setAreaLocation(location: Partial<AreaLocation>): void;
```

- `location: Partial<AreaLocation>` - A partial AreaLocation object.

### `getAreaLocation`

Returns the current location of the selection area.

```typescript
getAreaLocation(): AreaLocation;
```

### `cancel`

Cancels the current selection process.

```typescript
cancel(keepEvent = false): void;
```

- `keepEvent: boolean` - If a stop event should be fired.

### `destroy`

Unbinds all events and removes the area-element.

```typescript
destroy(): void;
```

### `enable`

Enables selecting elements, this is the default state.

```typescript
enable(): void;
```

### `disable`

Disables selecting elements.

```typescript
disable(): void;
```

### `select`

Manually selects elements and adds them to the store.

```typescript
select(query: SelectAllSelectors, quiet = false): Element[];
```

- `query: SelectAllSelectors` - CSS Query, can be an array of queries.
- `quiet: boolean` - If this should not trigger the move event.

### `deselect`

Manually deselects elements and removes them from the store.

```typescript
deselect(query: SelectAllSelectors, quiet = false): Element[];
```

- `query: SelectAllSelectors` - CSS Query, can be an array of queries.
- `quiet: boolean` - If this should not trigger the move event.

## Types

### `DeepPartial<T>`

> [!WARNING]
> Internal type, subject to change at any time.

A type that makes all properties in `T` optional and allows for nested optional properties.

```typescript
type DeepPartial<T> = T extends unknown[] ? T : T extends HTMLElement ? T : { [P in keyof T]?: DeepPartial<T[P]>; };
```

### `Quantify<T>`

> [!WARNING]
> Internal type, subject to change at any time.

A type that allows `T` to be an array or a single value.

```typescript
type Quantify<T> = T[] | T;
```

### `ScrollEvent`

An interface that extends `MouseEvent` with additional properties.

```typescript
interface ScrollEvent extends MouseEvent {
  deltaY: number;
  deltaX: number;
}
```

### `ChangedElements`

An interface representing elements that have been added or removed.

```typescript
interface ChangedElements {
  added: Element[];
  removed: Element[];
}
```

### `SelectionStore`

An interface representing the selection store.

```typescript
interface SelectionStore {
  touched: Element[];
  stored: Element[];
  selected: Element[];
  changed: ChangedElements;
}
```

### `SelectionEvent`

An interface representing a selection event.

```typescript
interface SelectionEvent {
  event: MouseEvent | TouchEvent | null;
  store: SelectionStore;
  selection: SelectionArea;
}
```

- `event` - The original event that triggered the selection, may be `null` if manually triggered.
- `store` - The current state of the selection store.
- `selection` - The selection area instance.

### `AreaLocation`

An interface representing the location of the selection area.

```typescript
interface AreaLocation {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
```

### `Coordinates`

An interface representing coordinates.

```typescript
interface Coordinates {
  x: number;
  y: number;
}
```

### `TapMode`

A type representing the tap mode.

```typescript
type TapMode = 'touch' | 'native';
```

- `touch` - The element was at the time of click touched "visually" (default).
- `native` - The element was the actual element of the click event.

### `Intersection`

A type representing the intersection mode.

```typescript
type Intersection = 'center' | 'cover' | 'touch';
```

- `center` - The element is selected if the center of the given element is touched.
- `cover` - The element is selected if the whole element is covered by the selection area.
- `touch` - The element is selected if the selection area touches the element.

### `Trigger`

A type representing the trigger for the selection.
Specifies which mouse button or combination of buttons and modifiers should trigger the selection.

```ts
type MouseButton = 0 | 1  | 2 | 3 | 4;
type Modifier = 'ctrl' | 'alt' | 'shift';
type MouseButtonWithModifiers = { button: MouseButton; modifiers: Modifier[]; };
type Trigger = MouseButton | MouseButtonWithModifiers;
```

### `OverlapMode`

A type representing the overlap mode, e.g. what should happen if you select an element that is already selected.

```typescript
type OverlapMode = 'keep' | 'drop' | 'invert';
```

- `keep` - Keep the element selected.
- `drop` - Deselect the element.
- `invert` - Deselect the element if it is selected, otherwise select it (default).

### `SelectionOptions`

An interface representing selection options, this is after defaults have been applied.
It consists of the following interfaces:

```typescript
interface SingleTap {
  allow: boolean;
  intersect: TapMode;
}

interface Features {
  deselectOnBlur: boolean;
  singleTap: SingleTap;
  range: boolean;
  touch: boolean;
}

interface Scrolling {
  speedDivider: number;
  manualSpeed: number;
  startScrollMargins: {x: number, y: number};
}

interface Behaviour {
  intersect: Intersection;
  startThreshold: number | Coordinates;
  overlap: OverlapMode;
  scrolling: Scrolling;
  triggers: Trigger[];
}

interface SelectionOptions {
  selectionAreaClass: string;
  selectionContainerClass: string | undefined;
  container: Quantify<string | HTMLElement>;
  document: Document;
  selectables: Quantify<string>;
  startAreas: Quantify<string | HTMLElement>;
  boundaries: Quantify<string | HTMLElement>;
  behaviour: Behaviour;
  features: Features;
}
```

### `PartialSelectionOptions`

Type of what can be passed to the `SelectionArea` constructor.

```typescript
type PartialSelectionOptions = DeepPartial<Omit<SelectionOptions, 'document'>> & {
  document?: Document;
};
```
