// Generate dom elements
const boxes = [
    ['.boxes.red', 252],
    ['.boxes.blue', 42],
    ['.boxes.green', 42]
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

    // All elements in this container can be selected
    selectables: ['.boxes > div'],

    // The container is also the boundary in this case
    boundaries: ['.boxes']
}).on('start', ({store, event}) => {

    // Remove class if the user isn't pressing the control key or ⌘ key
    if (!event.ctrlKey && !event.metaKey) {

        // Unselect all elements
        for (const el of store.stored) {
            el.classList.remove('selected');
        }

        // Clear previous selection
        selection.clearSelection();
    }

}).on('move', ({store: {changed: {added, removed}}}) => {

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
