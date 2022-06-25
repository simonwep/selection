<template>
    <h1>Vue</h1>

    <SelectionArea class="container green"
                   :options="{selectables: '.selectable',enabled:false}"
                   :on-move="onMove"
                   :on-start="onStart">
        <div v-for="id of range(42)" :key="id" :data-key="id"
             class="selectable" :class="{selected: selected.has(id)}"/>
    </SelectionArea>

    <SelectionArea class="container blue"
                   :options="{selectables: '.selectable'}"
                   :on-move="onMove"
                   :on-start="onStart">
        <div v-for="id of range(42, 42)" :key="id" :data-key="id"
             class="selectable" :class="{selected: selected.has(id)}"/>
    </SelectionArea>

    <SelectionArea class="container red"
                   :options="{selectables: '.selectable'}"
                   :on-move="onMove"
                   :on-start="onStart">
        <div v-for="id of range(400, 84)" :key="id" :data-key="id"
             class="selectable" :class="{selected: selected.has(id)}"/>
    </SelectionArea>
</template>

<script lang="ts">
import {SelectionEvent} from '@vanilla/types';
import SelectionArea from '../src/SelectionArea.vue';

export default {
    components: {SelectionArea},

    data(): {selected: Set<number>} {
        return {
            selected: new Set()
        };
    },

    methods: {

        extractIds(els: Element[]): number[] {
            return els.map(v => v.getAttribute('data-key'))
                .filter(Boolean)
                .map(Number);
        },

        onStart({event, selection}: SelectionEvent): void {
            if (!event?.ctrlKey && !event?.metaKey) {
                selection.clearSelection();
                this.selected.clear();
            }
        },

        onMove({store: {changed: {added, removed}}}: SelectionEvent): void {
            this.extractIds(added).forEach(id => this.selected.add(id));
            this.extractIds(removed).forEach(id => this.selected.delete(id));
        },

        range(to: number, offset = 0): number[] {
            return new Array(to).fill(0).map((_, i) => offset + i);
        }
    }
};
</script>

<style>
@import './index.css';
</style>
