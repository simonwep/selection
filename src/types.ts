interface SelectionSimpleEvent {
    event: MouseEvent | TouchEvent | null;
}

interface SelectionStartEvent extends SelectionSimpleEvent {
    stored: ReadonlyArray<Element>;
}

interface SelectionMoveEvent extends SelectionSimpleEvent {
    selected: ReadonlyArray<Element>;
    changed: ChangedElements;
}

export interface SelectionEvents {
    beforestart: (e: SelectionSimpleEvent) => boolean;
    start: (e: SelectionStartEvent) => void;
    move: (e: SelectionMoveEvent) => void
    stop: (e: SelectionSimpleEvent) => void;
}

export type AreaRect = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface ChangedElements {
    added: Array<Element>;
    removed: Array<Element>;
}

export interface LooseCoordinates {
    x: number | null;
    y: number | null;
}

export interface Coordinates {
    x: number;
    y: number;
}

type Mode = 'touch' | 'center' | 'cover';
type TapMode = 'touch' | 'native';

export interface SelectionOptions {
    class: string;
    frame: Document;
    mode: Mode;
    tapMode: TapMode;
    startThreshold: number | Coordinates;
    singleClick: boolean;
    disableTouch: boolean;

    selectables: ReadonlyArray<string>;
    scrollSpeedDivider: number;
    manualScrollSpeed: number;

    startareas: ReadonlyArray<string>;
    boundaries: ReadonlyArray<string>;
    selectionAreaContainer: string | HTMLElement | ReadonlyArray<string | HTMLElement>;
}

