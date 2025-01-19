# Integrating Viselect into _anything_ 

As mentioned in the [quickstart](./quickstart.md), Viselect is a framework-agnostic library.
This means that you can use it with any framework or library you want.

This page should help you to integrate Viselect into your project, no matter if you're using Vue, React, Preact, Angular, or any other framework.
Don't worry, there aren't many differences between the integrations, and after you're done you can enjoy all core features of Viselect!

## Lifecycle

Generally, viselect is instantiated once and should be re-created once the options need to change.
Don't worry, instantiating and destroying the selection area is a lightweight operation and won't cause any major performance issues.

Example based on vue and react:

::: code-group

```vue [App.vue]
<template>
  <div ref="container">
    <!-- ...elements -->
  </div>
</template>

<script lang="ts" setup>
import {shallowRef, useTemplateRef, watch} from 'vue';
import SelectionArea, { SelectionEvent } from '@viselect/vanilla';

// Refs to the container and the instance
const container = useTemplateRef('container');
const instance = shallowRef<SelectionArea | undefined>();

// Event handlers
const beforeStart = (evt: SelectionEvent) => console.log('beforestart', evt);
const beforeDrag = (evt: SelectionEvent) => console.log('beforedrag', evt);
const start = (evt: SelectionEvent) => console.log('start', evt);
const move = (evt: SelectionEvent) => console.log('move', evt);
const stop = (evt: SelectionEvent) => console.log('stop', evt);

// Watch container and mount the instance
watch(container, (element) => {
  if (element) {
    instance.value?.destroy();
    instance.value = new SelectionArea({
      boundaries: element,
      // ...your options
    });

    // attach events...
    instance.value.on('beforestart', beforeStart);
    instance.value.on('beforedrag', beforeDrag);
    instance.value.on('start', start);
    instance.value.on('move', move);
    instance.value.on('stop', stop);
  }
});
</script>
```

```tsx [App.tsx]
import React, { useEffect, useRef } from 'react';
import SelectionArea, { SelectionEvent } from '@viselect/vanilla';

export const App = () => {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<SelectionArea | undefined>();

  // Event handlers
  const beforeStart = (evt: SelectionEvent) => console.log('beforestart', evt);
  const beforeDrag = (evt: SelectionEvent) => console.log('beforedrag', evt);
  const start = (evt: SelectionEvent) => console.log('start', evt);
  const move = (evt: SelectionEvent) => console.log('move', evt);
  const stop = (evt: SelectionEvent) => console.log('stop', evt);

  // Mount the instance and attach events
  useEffect(() => {
    if (container.current) {
      instance.current?.destroy();
      instance.current = new SelectionArea({
        boundaries: container.current,
        // ...your options
      });

      // attach events...
      instance.current.on('beforestart', beforeStart);
      instance.current.on('beforedrag', beforeDrag);
      instance.current.on('start', start);
      instance.current.on('move', move);
      instance.current.on('stop', stop);
    }

    return () => instance.current?.destroy();
  }, []);

  return (
    <div ref={container}>
      {/* ...elements */}
    </div>
  );
}
```

:::

