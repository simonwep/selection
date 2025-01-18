---
outline: deep
---

# API Reference

The `SelectionArea` is the main class of the library, it is responsible for handling the selection process.
It is passed to each event and can be used to interact with the selection process.

### Static Properties

The only static property is the version of the library.

```typescript
version: string;
```

### Methods

#### `constructor`

Instantiates a new `SelectionArea`.

```typescript
constructor(opt: PartialSelectionOptions): SelectionArea;
```

- `opt: PartialSelectionOptions` - The options for the selection area.

#### `trigger`

Manually triggers the start of a selection, can be used to start a selection without a user interaction.

```typescript
trigger(evt: MouseEvent | TouchEvent, silent = true): void;
```

- `evt: MouseEvent | TouchEvent` - A MouseEvent or TouchEvent-like object.
- `silent: boolean` - If `beforestart` should be fired.

#### `resolveSelectables`

Updates the list of selectables, useful if new elements have been added during a selection.

```typescript
resolveSelectables(): void;
```

#### `clearSelection`

Clears the selection.

```typescript
clearSelection(includeStored = true, quiet = false): void;
```

- `includeStored: boolean` - If the store should also get cleared.
- `quiet: boolean` - If move/stop events should be fired.

#### `getSelection`

Returns currently selected elements.

```typescript
getSelection(): Element[];
```

#### `getSelectionArea`

Returns the selection area element.

```typescript
getSelectionArea(): HTMLElement;
```

#### `getSelectables`

Returns all selectables.

```typescript
getSelectables(): Element[];
```

#### `setAreaLocation`

Sets the location of the selection area.

```typescript
setAreaLocation(location: Partial<AreaLocation>): void;
```

- `location: Partial<AreaLocation>` - A partial AreaLocation object.

#### `getAreaLocation`

Returns the current location of the selection area.

```typescript
getAreaLocation(): AreaLocation;
```

#### `cancel`

Cancels the current selection process.

```typescript
cancel(keepEvent = false): void;
```

- `keepEvent: boolean` - If a stop event should be fired.

#### `destroy`

Unbinds all events and removes the area-element.

```typescript
destroy(): void;
```

#### `enable`

Enables selecting elements, this is the default state.

```typescript
enable(): void;
```

#### `disable`

Disables selecting elements.

```typescript
disable(): void;
```

#### `select`

Manually selects elements and adds them to the store.

```typescript
select(query: SelectAllSelectors, quiet = false): Element[];
```

- `query: SelectAllSelectors` - CSS Query, can be an array of queries.
- `quiet: boolean` - If this should not trigger the move event.

#### `deselect`

Manually deselects elements and removes them from the store.

```typescript
deselect(query: SelectAllSelectors, quiet = false): Element[];
```

- `query: SelectAllSelectors` - CSS Query, can be an array of queries.
- `quiet: boolean` - If this should not trigger the move event.

## Types

### `DeepPartial<T>`

A type that makes all properties in `T` optional and allows for nested optional properties.

```typescript
type DeepPartial<T> = T extends unknown[] ? T : T extends HTMLElement ? T : { [P in keyof T]?: DeepPartial<T[P]>; };
```

### `Quantify<T>`

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

### `SelectionEvents`

An interface representing the selection events.

```typescript
interface SelectionEvents {
    beforestart: (e: SelectionEvent) => boolean | void;
    beforedrag: (e: SelectionEvent) => boolean | void;
    start: (e: SelectionEvent) => void;
    move: (e: SelectionEvent) => void;
    stop: (e: SelectionEvent) => void;
}
```

- `beforestart` - Fired before the selection starts, if `false` is returned the selection will be canceled.
- `beforedrag` - Fired before the selection area is moved, if `false` is returned the move will be canceled.
- `start` - Fired when the selection starts.
- `move` - Fired when the selection area is moved.
- `stop` - Fired when the selection stops.

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
