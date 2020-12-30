import {Intersection} from '@utils';

export interface ChangedElements {
    added: Array<Element>;
    removed: Array<Element>;
}

export interface SelectionStore {
    touched: Array<Element>;
    stored: Array<Element>;
    selected: Array<Element>;
    changed: ChangedElements;
}

export interface SelectionEvent {
    event: MouseEvent | TouchEvent | null;
    store: SelectionStore;
}

export interface SelectionEvents {
    beforestart: (e: SelectionEvent) => boolean;
    start: (e: SelectionEvent) => void;
    move: (e: SelectionEvent) => void
    stop: (e: SelectionEvent) => void;
}

export type AreaRect = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface Coordinates {
    x: number;
    y: number;
}

export type TapMode = 'touch' | 'native';
export type OverlapMode = 'keep' | 'drop' | 'invert';

export interface Scrolling {
    speedDivider: number;
    manualSpeed: number;
}

export interface SingleTap {
    allow: boolean;
    intersect: TapMode;
}

export interface SelectionOptions {
    class: string;
    document: Document;
    intersect: Intersection;
    singleTap: SingleTap;
    startThreshold: number | Coordinates;
    allowTouch: boolean;
    overlap: OverlapMode;

    selectables: ReadonlyArray<string>;
    scrolling: Scrolling;

    startareas: ReadonlyArray<string>;
    boundaries: ReadonlyArray<string>;
    container: string | HTMLElement | ReadonlyArray<string | HTMLElement>;
}

export interface ScrollEvent extends MouseEvent {
    deltaY: number;
    deltaX: number;
}
