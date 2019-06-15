const selection = Selection.create({

    // Class for the selection-area
    class: 'selection',

    // All elements in this container can be selected
    selectables: ['.box-wrap > div'],

    // The container is also the boundary in this case
    boundaries: ['.box-wrap'],

    onSelect({target, originalEvent, selectedElements}) {

        // Check if clicked element is already selected
        const selected = target.classList.contains('selected');

        // Remove class if the user isn't pressing the control key or ⌘ key and the
        // current target is already selected
        if (!originalEvent.ctrlKey && !originalEvent.metaKey) {

            // Remove class from every element that is selected
            for (const el of selectedElements) {
                el.classList.remove('selected');
            }

            // Clear previous selection
            this.clearSelection();
        }

        if (!selected) {

            // Select element
            target.classList.add('selected');
            this.keepSelection();
        } else {

            // Unselect element
            target.classList.remove('selected');
            this.removeFromSelection(target);
        }
    },

    onStart({selectedElements, originalEvent}) {

        // Remove class if the user isn't pressing the control key or ⌘ key
        if (!originalEvent.ctrlKey && !originalEvent.metaKey) {

            // Unselect all elements
            for (const el of selectedElements) {
                el.classList.remove('selected');
            }

            // Clear previous selection
            this.clearSelection();
        }
    },

    onMove({selectedElements, changedElements: {removed}}) {

        // Add a custom class to the elements that where selected.
        for (const el of selectedElements) {
            el.classList.add('selected');
        }

        // Remove the class from elements that where removed
        // since the last selection
        for (const el of removed) {
            el.classList.remove('selected');
        }
    },

    onStop() {
        this.keepSelection();
    }
});
