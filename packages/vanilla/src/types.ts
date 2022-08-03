import type SelectionArea from '@vanilla/index';
import type {Intersection} from './utils';

export type Quantify<T> = Readonly<T[]> | T;

export interface ScrollEvent extends MouseEvent {
    deltaY: number;
    deltaX: number;
}

export interface ChangedElements {
    added: Element[];
    removed: Element[];
}

export interface SelectionStore {
    touched: Element[];
    stored: Element[];
    selected: Element[];
    changed: ChangedElements;
}

export interface SelectionEvent {
    event: MouseEvent | TouchEvent | null;
    store: SelectionStore;
    selection: SelectionArea;
}

export type SelectionEvents = {
    beforestart: (e: SelectionEvent) => boolean | void;
    beforedrag: (e: SelectionEvent) => boolean | void;
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
    startScrollMargins: {x: number, y: number};
}

export interface SingleTap {
    allow: boolean;
    intersect: TapMode;
}

export interface Features {
    singleTap: SingleTap;
    range: boolean;
    touch: boolean;
}

export interface Behaviour {
    intersect: Intersection;
    startThreshold: number | Coordinates;
    overlap: OverlapMode;
    scrolling: Scrolling;
}

export interface SelectionOptions {
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

export type PartialSelectionOptions = Partial<Omit<SelectionOptions, 'behaviour' | 'features'>> & {
    behaviour?: Partial<Behaviour>;
    features?: Partial<Features>;
}
