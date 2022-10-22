<template>
    <div ref="container">
        <slot/>
    </div>
</template>

<script lang="ts" setup>
import SelectionArea, {SelectionEvents} from '@vanilla/index';
import {SelectionOptions} from '@vanilla/types';
import {onBeforeUnmount, ref, watchEffect} from 'vue';

const props = defineProps<{
    options: Omit<SelectionOptions, 'boundaries'>;
    onBeforeStart?: SelectionEvents['beforestart'];
    onStart?: SelectionEvents['start'];
    onMove?: SelectionEvents['move'];
    onStop?: SelectionEvents['stop'];
}>();

const container = ref<HTMLDivElement>();
let instance: SelectionArea;

watchEffect(() => {
    if (container.value) {
        instance?.destroy();

        instance = new SelectionArea({
            boundaries: container.value,
            ...props.options
        });

        const {onBeforeStart, onStart, onMove, onStop} = props;

        onBeforeStart && instance.on('beforestart', onBeforeStart as SelectionEvents['beforestart']);
        onStart && instance.on('start', onStart as SelectionEvents['start']);
        onMove && instance.on('move', onMove as SelectionEvents['move']);
        onStop && instance.on('stop', onStop as SelectionEvents['stop']);
    }
});


onBeforeUnmount(() => {
    instance?.destroy();
});
</script>
