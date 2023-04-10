import SelectionArea from 'https://cdn.jsdelivr.net/npm/@viselect/vanilla/dist/viselect.mjs';

[
    ['.boxes.red', 252],
    ['.boxes.blue', 42],
    ['.boxes.green', 42]
].forEach(([selector, items]) => {
    const container = document.querySelector(selector);

    for (let i = 0; i < items; i++) {
        container.appendChild(document.createElement('div'));
    }
});

const selection = new SelectionArea({
    selectables: ['.boxes > div'],
    boundaries: ['.boxes']
}).on('start', ({store, event}) => {
    if (!event.ctrlKey && !event.metaKey) {

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
});

// Prevent flickering
document.body.style.display = 'unset';

// Log version
console.log(`Using Viselect v${SelectionArea.version}`);
