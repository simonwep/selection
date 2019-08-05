const selection = Selection.create({

    // Class for the selection-area
    class: 'selection',

    // All elements in this container can be selected
    selectables: ['.box-wrap > div'],

    // The container is also the boundary in this case
    boundaries: ['.box-wrap']
}).on('select', ({inst, target, oe, selected}) => {

    // Check if clicked element is already selected
    const isSelected = target.classList.contains('selected');

    // Remove class if the user isn't pressing the control key or ⌘ key and the
    // current target is already selected
    if (!oe.ctrlKey && !oe.metaKey) {

        // Remove class from every element that is selected
        for (const el of selected) {
            el.classList.remove('selected');
        }

        // Clear previous selection
        inst.clearSelection();
    }

    if (!isSelected) {

        // Select element
        target.classList.add('selected');
        inst.keepSelection();
    } else {

        // Unselect element
        target.classList.remove('selected');
        inst.removeFromSelection(target);
    }
}).on('start', ({inst, selected, oe}) => {

    // Remove class if the user isn't pressing the control key or ⌘ key
    if (!oe.ctrlKey && !oe.metaKey) {

        // Unselect all elements
        for (const el of selected) {
            el.classList.remove('selected');
        }

        // Clear previous selection
        inst.clearSelection();
    }

}).on('move', ({selected, changed: {removed}}) => {

    // Add a custom class to the elements that where selected.
    for (const el of selected) {
        el.classList.add('selected');
    }

    // Remove the class from elements that where removed
    // since the last selection
    for (const el of removed) {
        el.classList.remove('selected');
    }

}).on('stop', ({inst}) => {
    inst.keepSelection();
});