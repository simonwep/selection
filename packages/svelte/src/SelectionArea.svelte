<script lang="ts">
    import SelectionArea from '../../vanilla/src';
    import type {SelectionEvents, SelectionOptions} from '../../vanilla/src';
    import {onDestroy, onMount} from 'svelte';

    export let onBeforeStart: SelectionEvents['beforestart'] | null = null;
    export let onStart: SelectionEvents['start'] | null = null;
    export let onMove: SelectionEvents['move'] | null = null;
    export let onStop: SelectionEvents['stop'] | null = null;

    export let className: string;
    export let options: Partial<Omit<SelectionOptions, 'boundaries'>>;

    let container: HTMLDivElement;
    let selection: SelectionArea;

    onMount(() => {
        selection = new SelectionArea({
            boundaries: container,
            ...options
        });

        onBeforeStart && selection.on('beforestart', onBeforeStart);
        onStart && selection.on('start', onStart);
        onMove && selection.on('move', onMove);
        onStop && selection.on('stop', onStop);
    });

    onDestroy(() => selection.destroy());
</script>

<div bind:this={container} class={className}>
    <slot/>
</div>
