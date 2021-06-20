import type SelectionArea from '@vanilla/index';
import type {Intersection} from './utils';

type Quantify<T> = ReadonlyArray<T> | T;

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
    selection: SelectionArea;
}

export type SelectionEvents = {
    beforestart: (e: SelectionEvent) => boolean;
    start: (e: SelectionEvent) => void;
    move: (e: SelectionEvent) => void
    stop: (e: SelectionEvent) => void;
}

export type AreaLocation = {
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
    areaClass: string;
    containerClass?: string;

    document: Document;
    intersect: Intersection;
    singleTap: SingleTap;
    startThreshold: number | Coordinates;
    allowTouch: boolean;
    overlap: OverlapMode;

    selectables: Quantify<string>;
    scrolling: Scrolling;

    startareas: Quantify<string | HTMLElement>;
    boundaries: Quantify<string | HTMLElement>;
    container: Quantify<string | HTMLElement>;
}

export interface ScrollEvent extends MouseEvent {
    deltaY: number;
    deltaX: number;
}
