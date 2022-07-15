<template>
    <h1>Vue</h1>

    <SelectionArea class="container green"
                   :options="{selectables: '.selectable'}"
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

<script lang="ts" setup>
import {SelectionEvent} from '@vanilla/types';
import {reactive} from 'vue';
import SelectionArea from '../src/SelectionArea.vue';

const selected = reactive<Set<number>>(new Set());

const extractIds = (els: Element[]): number[] => {
    return els.map(v => v.getAttribute('data-key'))
        .filter(Boolean)
        .map(Number);
};

const onStart = ({event, selection}: SelectionEvent): void => {
    if (!event?.ctrlKey && !event?.metaKey) {
        selection.clearSelection();
        selected.clear();
    }
};

const onMove = ({store: {changed: {added, removed}}}: SelectionEvent): void => {
    extractIds(added).forEach(id => selected.add(id));
    extractIds(removed).forEach(id => selected.delete(id));
};

const range = (to: number, offset = 0): number[] => {
    return new Array(to).fill(0).map((_, i) => offset + i);
};

</script>

<style>
@import './index.css';
</style>
