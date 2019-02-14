const selection = Selection.create({

    // Class for the selection-area
    class: 'selection',

    // All elements in this container can be selected
    containers: ['.box-wrap'],

    // The container is also the boundary in this case
    boundaries: ['.box-wrap'],

    onSelect(evt) {

        // Check if clicked element is already selected
        const selected = evt.target.classList.contains('selected');

        // Remove class if the user isn't pressing the control key or ⌘ key and the
        // current target is already selected
        if (!evt.originalEvent.ctrlKey && !evt.originalEvent.metaKey) {

            // Remove class from every element that is selected
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

    onStart({selectedElements, originalEvent}) {

        // Remove class if the user isn't pressing the control key or ⌘ key
        if (!originalEvent.ctrlKey && !originalEvent.metaKey) {

            // Unselect all elements
            selectedElements.forEach(s => s.classList.remove('selected'));

            // Clear previous selection
            this.clearSelection();
        }
    },

    onMove({selectedElements, changedElements}) {

        // Add a custom class to the elements that where selected.
        selectedElements.forEach(s => s.classList.add('selected'));

        // Remove the class from elements that where removed
        // since the last selection
        changedElements.removed.forEach(s => s.classList.remove('selected'));
    },

    onStop() {
        this.keepSelection();
    }
});
