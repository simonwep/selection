/**
 * Definitions initially taken from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/simonwep__selection-js/index.d.ts
 * maintainted unofficially until v1.2.0 by Mitsuka Hanakura a.k.a. ragg <https://github.com/ra-gg>.
 */

type ElementList = HTMLCollection | HTMLElement | Array<HTMLElement>;

declare namespace Selection {
    interface SelectionEvent {
        oe: MouseEvent | TouchEvent;
        inst: Selection;
        area: Element;
        selected: ReadonlyArray<Element>;
        changed: {
            added: ReadonlyArray<Element>;
            removed: ReadonlyArray<Element>;
        };
    }

    type Mode = 'touch' | 'center' | 'cover';
    type TapMode = 'touch' | 'native';

    interface SelectionOptions {
        class?: string;
        frame?: Node;
        mode?: Mode;
        tapMode?: TapMode;
        startThreshold?: number;
        singleClick?: boolean;
        disableTouch?: boolean;

        selectables?: ReadonlyArray<String>;
        scrollSpeedDivider?: number;
        manualScrollSpeed?: number;

        startareas?: ReadonlyArray<string>;
        boundaries?: ReadonlyArray<string>;
        selectionAreaContainer?: string | HTMLElement | ReadonlyArray<string | HTMLElement>;
    }

    interface SelectionUtils {
        on(
            el: ElementList,
            events: string | ReadonlyArray<string>,
            fn: (ev: Event) => void,
            options?: AddEventListenerOptions
        ): void;

        off(
            el: ElementList,
            events: string | ReadonlyArray<string>,
            fn: (ev: Event) => void,
            options?: AddEventListenerOptions
        ): void;

        css(el: Element, attr: Record<string, string | number>): any;

        css(el: Element, attr: string, val: string | number): any;

        intersects(a: Element, b: Element, mode: Mode): boolean;

        selectAll(selector: string | HTMLElement | ReadonlyArray<string | HTMLElement>): Element[];

        eventPath(evt: Event): EventTarget[];

        removeElement(arr: Element[], el: Element): void;
    }
}

interface SelectionEvents {
    beforestart: (e: Selection.SelectionEvent) => boolean;
    start: (e: Selection.SelectionEvent) => void;
    move: (e: Selection.SelectionEvent) => void;
    stop: (e: Selection.SelectionEvent) => void;
}

declare class Selection {
    static create(options: Selection.SelectionOptions): Selection;

    static utils: Selection.SelectionUtils;
    static version: string;

    constructor(options: Selection.SelectionOptions);

    trigger(evt: UIEvent, silent?: boolean): void;

    on<E extends keyof SelectionEvents>(ev: E, cb: SelectionEvents[E]): this;

    off<E extends keyof SelectionEvents>(ev: E, cb: SelectionEvents[E]): this;

    resolveSelectables(): void;

    keepSelection(): void;

    clearSelection(): void;

    removeFromSelection(el: Element): void;

    getSelection(): Element[];

    cancel(keepEvent?: boolean): void;

    option<K extends keyof Selection.SelectionOptions>(
        name: K,
        value?: Selection.SelectionOptions[K]
    ): Selection.SelectionOptions[K];

    disable(): void;

    destroy(): void;

    enable(): void;

    select(query: Parameters<Selection.SelectionUtils['selectAll']>[0]): this;
}

export = Selection;
export as namespace Selection;