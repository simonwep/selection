/**
 * Event dispatcher for Selection-js.
 */

export function dispatchFilterEvent(selection, name, node) {
    const event = selection.options[name];

    if (typeof event === 'function') {

        const evt = {
            selection: selection,
            eventName: name,
            element: node
        };

        return event.call(selection, evt);
    }
}

export function dispatchEvent(selection, name, ae, originalEvt, selected, changed, additional = {}) {
    const event = selection.options[name];

    if (typeof event === 'function') {

        const evt = {
            selection: selection,
            eventName: name,
            areaElement: ae,
            selectedElements: selected,
            changedElements: changed,
            originalEvent: originalEvt
        };

        for (let val in additional) {
            evt[val] = additional[val];
        }

        return event.call(selection, evt);
    }
}