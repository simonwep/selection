const options = {

    class: 'selection',

    startThreshold: 10,

    containers: ['.box-wrap'],

    selectables: ['.box-wrap'],

    boundarys: ['.box-wrap'],

    onMove(evt) {
        const selectedElements = evt.selectedElements;
        const changedElements = evt.changedElements;

        for (let se of selectedElements) {
            se.classList.add('selected');
        }

        for (let rm of changedElements.removed) {
            rm.classList.remove('selected');
        }
    },

    onStop(evt) {
        const changedElements = evt.changedElements;

        for (let rm of changedElements.removed) {
            rm.classList.remove('selected');
        }
    },

    startFilter(evt) {
        return true;
    },

    selectionFilter(evt) {
        return true;
    },
};

Selection.create(options);
