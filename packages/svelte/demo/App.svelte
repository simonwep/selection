<script lang="ts">
    import type {SelectionEvent} from '@viselect/vanilla/src';
    import SelectionArea from '../src/SelectionArea.svelte';

    const range = (n: number, offset = 0) => new Array(n).fill(0).map((_, i) => offset + i);
    let selected: Set<number> = new Set();

    const extractIds = (els: Element[]): number[] =>
        els.map(v => v.getAttribute('data-key'))
            .filter(Boolean)
            .map(Number);

    const onStart = ({event, selection}: SelectionEvent) => {
        if (!event?.ctrlKey && !event?.metaKey) {
            selection.clearSelection();
            selected = new Set();
        }
    };

    const onMove = ({store: {changed: {added, removed}}}: SelectionEvent) => {
        extractIds(added).forEach(id => selected.add(id));
        extractIds(removed).forEach(id => selected.delete(id));
        selected = selected;
    };

</script>

<main>
    <h1>Svelte</h1>
    <SelectionArea className="container green"
                   onStart={onStart}
                   onMove={onMove}
                   options={{selectables: '.selectable'}}>
        {#each range(42) as id}
            <div class="{selected.has(id) ? 'selectable selected' : 'selectable'}"
                 data-key={id}></div>
        {/each}
    </SelectionArea>
    <SelectionArea className="container blue"
                   onStart={onStart}
                   onMove={onMove}
                   options={{selectables: '.selectable'}}>
        {#each range(42, 42) as id}
            <div class="{selected.has(id) ? 'selectable selected' : 'selectable'}"
                 data-key={id}></div>
        {/each}
    </SelectionArea>
    <SelectionArea className="container red"
                   onStart={onStart}
                   onMove={onMove}
                   options={{selectables: '.selectable'}}>
        {#each range(400, 84) as id}
            <div class="{selected.has(id) ? 'selectable selected' : 'selectable'}"
                 data-key={id}></div>
        {/each}
    </SelectionArea>
</main>
