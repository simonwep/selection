<template>
  <div ref="container">
    <slot/>
  </div>
</template>

<script lang="ts" setup>
import SelectionArea, {SelectionEvents, SelectionOptions} from '@viselect/vanilla';
import {onBeforeUnmount, ref, watchEffect, shallowRef} from 'vue';

const props = defineProps<{
  options: Omit<SelectionOptions, 'boundaries'>;
  onBeforeStart?: SelectionEvents['beforestart'];
  onBeforeDrag?: SelectionEvents['beforedrag'];
  onStart?: SelectionEvents['start'];
  onMove?: SelectionEvents['move'];
  onStop?: SelectionEvents['stop'];
}>();

const container = ref<HTMLDivElement>();
const instance = shallowRef<SelectionArea | undefined>();

watchEffect(() => {
  if (container.value) {
    instance.value?.destroy();

    instance.value = new SelectionArea({
      boundaries: container.value,
      ...props.options
    });

    const {onBeforeStart, onBeforeDrag, onStart, onMove, onStop} = props;

    onBeforeStart && instance.value.on('beforestart', onBeforeStart);
    onBeforeDrag && instance.value.on('beforedrag', onBeforeDrag);
    onStart && instance.value.on('start', onStart as SelectionEvents['start']);
    onMove && instance.value.on('move', onMove as SelectionEvents['move']);
    onStop && instance.value.on('stop', onStop as SelectionEvents['stop']);
  }
});


onBeforeUnmount(() => {
  instance.value?.destroy();
});

defineExpose({
  selection: instance
})
</script>
