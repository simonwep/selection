/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Method = 'addEventListener' | 'removeEventListener';
type AnyFunction = (...arg: any) => any;

export type EventBindingArgs = [
        EventTarget | EventTarget[],
        string | string[],
    AnyFunction,
    Record<string, unknown>?
];

interface EventBinding {
    (
        elements: EventTarget | EventTarget[],
        events: string | string[],
        fn: AnyFunction,
        options?: Record<string, unknown>
    ): EventBindingArgs;
}

/* eslint-disable prefer-rest-params */
function eventListener(method: Method): EventBinding {
    return (
        items: EventTarget | EventTarget[],
        events: string | string[],
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
    target: HTMLElement;
    x: number;
    y: number;
} => {
    const { clientX, clientY, target } = evt.touches?.[0] ?? evt;
    return {x: clientX, y: clientY, target};
};
