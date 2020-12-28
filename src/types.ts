interface SelectionEvent {
    event: MouseEvent | TouchEvent | null;
    area: Element;
    selected: ReadonlyArray<Element>;
    changed: {
        added: ReadonlyArray<Element>;
        removed: ReadonlyArray<Element>;
    };
}

type Mode = 'touch' | 'center' | 'cover';
type TapMode = 'touch' | 'native';

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

export interface SelectionEvents {
    beforestart: (e: SelectionEvent) => boolean;
    start: (e: SelectionEvent) => void;
    move: (e: SelectionEvent) => void
    stop: (e: SelectionEvent) => void;
}
