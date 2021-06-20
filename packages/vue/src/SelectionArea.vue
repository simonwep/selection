<template>
    <div ref="container">
        <slot/>
    </div>
</template>

<script lang="ts">
import SelectionArea, {SelectionEvents} from '@vanilla/index';
import {SelectionOptions} from '@vanilla/types';
import {defineComponent, PropType} from 'vue';
export * from '@vanilla/types';

export default defineComponent({
    props: {
        onBeforeStart: {type: Function, default: undefined},
        onStart: {type: Function, default: undefined},
        onMove: {type: Function, default: undefined},
        onStop: {type: Function, default: undefined},
        options: {
            type: Object as PropType<Omit<SelectionOptions, 'boundaries'>>,
            default: () => ({})
        }
    },

    setup(): {instance: SelectionArea | null} {
        return {
            instance: null
        };
    },

    mounted() {
        this.instance = new SelectionArea({
            boundaries: this.$refs.container as HTMLDivElement,
            ...this.options
        });

        const {onBeforeStart, onStart, onMove, onStop} = this;
        onBeforeStart && this.instance.on('beforestart', onBeforeStart as SelectionEvents['beforestart']);
        onStart && this.instance.on('start', onStart as SelectionEvents['start']);
        onMove && this.instance.on('move', onMove as SelectionEvents['move']);
        onStop && this.instance.on('stop', onStop as SelectionEvents['stop']);

        // this.instance.on('beforestart', args => {
        //     this.$emit('beforestart', args);
        //     return true;
        // });
        //
        // this.instance.on('start', args => this.$emit('start', args));
        // this.instance.on('move', args => this.$emit('move', args));
        // this.instance.on('stop', args => this.$emit('stop', args));
    },

    beforeUnmount() {
        this.instance?.destroy();
    }
});

</script>
