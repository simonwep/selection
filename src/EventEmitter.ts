import {SelectionEvents} from './types';

type UnknownFunction = (...args: unknown[]) => unknown;


export class EventTarget {
    private readonly _listeners = new Map<keyof SelectionEvents, Set<UnknownFunction>>();

    public addEventListener<K extends keyof SelectionEvents>(event: K, cb: SelectionEvents[K]): this {
        const set = this._listeners.get(event) || new Set();
        this._listeners.set(event, set);
        set.add(cb as UnknownFunction);
        return this;
    }

    public removeEventListener<K extends keyof SelectionEvents>(event: K, cb: SelectionEvents[K]): this {
        this._listeners.get(event)?.delete(cb as UnknownFunction);
        return this;
    }

    public dispatchEvent<K extends keyof SelectionEvents>(event: K, ...data: Parameters<SelectionEvents[K]>): unknown {
        let ok = true;
        for (const cb of (this._listeners.get(event) || [])) {
            ok = (cb(...data) !== false) && ok;
        }

        return ok;
    }

    // Let's also support on, off and emit like node
    /* eslint-disable no-invalid-this */
    public on = this.addEventListener;
    public off = this.removeEventListener;
    public emit = this.dispatchEvent;
}
