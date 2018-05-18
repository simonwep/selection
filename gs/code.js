const options = {

    // Class for the selection-area
    class: 'selection',

    // All elements in this container can be selected
    containers: ['.box-wrap'],

    // The container is also the boundary in this case
    boundaries: ['.box-wrap'],

    onSelect(evt) {

        // Check if clicked element is already selected
        const selected = evt.target.classList.contains('selected');

        // Remove class if the user don't pressed the control key or ⌘ key and the
        // current target is already selected
        if (!evt.originalEvent.ctrlKey && !evt.originalEvent.metaKey) {

            // Remove class from every element which is selected
            evt.selectedElements.forEach(s => s.classList.remove('selected'));

            // Clear previous selection
            this.clearSelection();
        }

        if (!selected) {

            // Select element
            evt.target.classList.add('selected');
            this.keepSelection();
        } else {

            // Unselect element
            evt.target.classList.remove('selected');
            this.removeFromSelection(evt.target);
        }
    },

    onStart(evt) {

        // Get elements which has been selected so far
        const selectedElements = evt.selectedElements;

        // Remove class if the user don't pressed the control key or ⌘ key
        if (!evt.originalEvent.ctrlKey && !evt.originalEvent.metaKey) {

            // Unselect all elements
            selectedElements.forEach(s => s.classList.remove('selected'));

            // Clear previous selection
            this.clearSelection();
        }
    },

    onMove(evt) {

        // Get the currently selected elements and those
        // which where removed since the last selection.
        const selectedElements = evt.selectedElements;
        const removedElements = evt.changedElements.removed;

        // Add a custom class to the elements which where selected.
        selectedElements.forEach(s => s.classList.add('selected'));

        // Remove the class from elements which where removed
        // since the last selection
        removedElements.forEach(s => s.classList.remove('selected'));
    },

    onStop(evt) {
        this.keepSelection();
    },
};

Selection.create(options);
