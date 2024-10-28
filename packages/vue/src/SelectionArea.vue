<template>
  <div ref="container">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import SelectionArea, {SelectionEvent, PartialSelectionOptions} from '@viselect/vanilla';
import {onBeforeUnmount, ref, watchEffect, shallowRef} from 'vue';

const emit = defineEmits<{
  (e: 'before-start', v: SelectionEvent): void;
  (e: 'before-drag', v: SelectionEvent): void;
  (e: 'start', v: SelectionEvent): void;
  (e: 'move', v: SelectionEvent): void;
  (e: 'stop', v: SelectionEvent): void;
  (e: 'init', v: SelectionArea): void;
}>();

const props = defineProps<{
  options: Omit<PartialSelectionOptions, 'boundaries'>;
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

    instance.value.on('beforestart', evt => emit('before-start', evt));
    instance.value.on('beforedrag', evt => emit('before-drag', evt));
    instance.value.on('start', evt => emit('start', evt));
    instance.value.on('move', evt => emit('move', evt));
    instance.value.on('stop', evt => emit('stop', evt));

    emit('init', instance.value);
  }
});


onBeforeUnmount(() => {
  instance.value?.destroy();
});

defineExpose({
  selection: instance
});
</script>
