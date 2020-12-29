// Generate dom elements
const boxes = [
    ['.box-wrap.boxes.red', 252],
    ['.box-wrap.boxes.blue', 42],
    ['.box-wrap.boxes.green', 42]
];

for (const [sel, items] of boxes) {
    const container = document.querySelector(sel);

    for (let i = 0; i < items; i++) {
        container.appendChild(
            document.createElement('div')
        );
    }
}

// Initialize selectionjs
const selection = new SelectionArea({

    // Class for the selection-area
    class: 'selection',

    // All elements in this container can be selected
    selectables: ['.box-wrap > div'],

    // The container is also the boundary in this case
    boundaries: ['.box-wrap']
}).on('start', ({stored, event}) => {

    // Remove class if the user isn't pressing the control key or ⌘ key
    if (!event.ctrlKey && !event.metaKey) {

        // Unselect all elements
        for (const el of stored) {
            el.classList.remove('selected');
        }

        // Clear previous selection
        selection.clearSelection();
    }

}).on('move', ({changed: {removed, added}}) => {

    // Add a custom class to the elements that where selected.
    for (const el of added) {
        el.classList.add('selected');
    }

    // Remove the class from elements that where removed
    // since the last selection
    for (const el of removed) {
        el.classList.remove('selected');
    }

}).on('stop', () => {
    selection.keepSelection();
});
