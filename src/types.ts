import {Intersection} from '@utils';

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

type TapMode = 'touch' | 'native';

interface Scrolling {
    speedDivider: number;
    manualSpeed: number;
}

interface SingleTap {
    allow: boolean;
    intersect: TapMode;
}

export interface SelectionOptions {
    class: string;
    frame: Document;
    intersect: Intersection;
    singleTap: SingleTap;
    startThreshold: number | Coordinates;
    allowTouch: boolean;

    selectables: ReadonlyArray<string>;
    scrolling: Scrolling;

    startareas: ReadonlyArray<string>;
    boundaries: ReadonlyArray<string>;
    container: string | HTMLElement | ReadonlyArray<string | HTMLElement>;
}

