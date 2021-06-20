/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Method = 'addEventListener' | 'removeEventListener';
type AnyFunction = (...arg: any) => any;

export type EventBindingArgs = [
        EventTarget | Array<EventTarget>,
        string | Array<string>,
    AnyFunction,
    Record<string, unknown>?
];

interface EventBinding {
    (
        elements: EventTarget | Array<EventTarget>,
        events: string | Array<string>,
        fn: AnyFunction,
        options?: Record<string, unknown>
    ): EventBindingArgs;
}

/* eslint-disable prefer-rest-params */
function eventListener(method: Method): EventBinding {
    return (
        items: EventTarget | Array<EventTarget>,
        events: string | Array<string>,
        fn: AnyFunction, options = {}
    ): EventBindingArgs => {

        // Normalize array
        if (items instanceof HTMLCollection || items instanceof NodeList) {
            items = Array.from(items);
        } else if (!Array.isArray(items)) {
            items = [items];
        }

        if (!Array.isArray(events)) {
            events = [events];
        }

        for (const el of items) {
            for (const ev of events) {
                el[method](ev, fn as EventListener, {capture: false, ...options});
            }
        }

        return [items, events, fn, options];
    };
}

/**
 * Add event(s) to element(s).
 * @param elements DOM-Elements
 * @param events Event names
 * @param fn Callback
 * @param options Optional options
 * @return Array passed arguments
 */
export const on = eventListener('addEventListener');

/**
 * Remove event(s) from element(s).
 * @param elements DOM-Elements
 * @param events Event names
 * @param fn Callback
 * @param options Optional options
 * @return Array passed arguments
 */
export const off = eventListener('removeEventListener');

/**
 * Simplifies a touch / mouse-event
 * @param evt
 */
export const simplifyEvent = (evt: any): {
    tap: MouseEvent | Touch;
    x: number;
    y: number;
    target: HTMLElement;
} => {
    const tap = (evt.touches && evt.touches[0] || evt);
    return {
        tap,
        x: tap.clientX,
        y: tap.clientY,
        target: tap.target
    };
};

/**
 * Polyfill for safari & firefox for the eventPath event property.
 * @param evt The event object.
 * @return [String] event path.
 */
export function eventPath(evt: any): Array<EventTarget> {
    let path: Array<EventTarget> = evt.path || (evt.composedPath && evt.composedPath());
    if (path) {
        return path;
    }

    let el = evt.target.parentElement;
    path = [evt.target, el];

    /* eslint-disable no-cond-assign */
    while (el = el.parentElement) {
        path.push(el);
    }

    path.push(document, window);
    return path;
}

