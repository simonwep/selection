import SelectionArea from '../src';

const boxes: [string, number][] = [
    ['section.green', 42],
    ['section.blue', 42],
    ['section.red', 252]
];

for (const [sel, items] of boxes) {
    const container = document.querySelector(sel);

    for (let i = 0; i < items; i++) {
        container?.appendChild(document.createElement('div'));
    }
}

const selection = new SelectionArea({
    selectables: ['body > section > div'],
    boundaries: ['body > section']
}).on('start', ({store, event}) => {

    if (!(event as MouseEvent).ctrlKey && !(event as MouseEvent).metaKey) {

        for (const el of store.stored) {
            el.classList.remove('selected');
        }

        selection.clearSelection();
    }

}).on('move', ({store: {changed: {added, removed}}}) => {

    for (const el of added) {
        el.classList.add('selected');
    }

    for (const el of removed) {
        el.classList.remove('selected');
    }

}).on('stop', () => {
    selection.keepSelection();
});
