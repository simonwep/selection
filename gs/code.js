const options = {

    // Class for the selection-area
    class: 'selection',

    // All elements in this container can be selected
    containers: ['.box-wrap'],

    // The container is also the boundary in this case
    boundarys: ['.box-wrap'],

    onMove(evt) {

        // Get the currently selected elements and those
        // which where removed since the last selection.
        const selectedElements = evt.selectedElements;
        const removedElements = evt.changedElements.removed;

        // Add a custom class to the elements which where selected.
        for (let se of selectedElements) {
            se.classList.add('selected');
        }

        // Remove the class from elements which where removed
        // since the last selection.
        for (let rm of removedElements) {
            rm.classList.remove('selected');
        }
    },

    onStop(evt) {

        // Clear selection
        for (let rm of evt.selectedElements) {
            rm.classList.remove('selected');
        }
    },
};

Selection.create(options);
