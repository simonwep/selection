/**
 * Event dispatcher for Selection-js.
 */

export function dispatchFilterEvent(selection, eventName, element) {
    const event = selection.options[eventName];
    if (typeof event !== 'function') return;

    return event.call(selection, {selection, eventName, element});
}

export function dispatchEvent(
    selection,
    eventName,
    areaElement,
    originalEvent,
    selectedElements,
    changedElements,
    additional
) {
    const event = selection.options[eventName];
    if (typeof event !== 'function') return;

    return event.call(selection, {
        selection,
        eventName,
        areaElement,
        selectedElements,
        changedElements,
        originalEvent,
        ...additional
    });
}
