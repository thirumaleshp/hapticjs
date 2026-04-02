# Vue

`@hapticjs/vue` provides Vue composables, a directive, and a plugin for haptic feedback.

## Installation

::: code-group

```bash [npm]
npm install @hapticjs/core @hapticjs/vue
```

```bash [pnpm]
pnpm add @hapticjs/core @hapticjs/vue
```

:::

## Plugin Setup

Register the plugin to provide a shared engine to all components:

```typescript
import { createApp } from 'vue';
import { FeelbackPlugin } from '@hapticjs/vue';

const app = createApp(App);
app.use(FeelbackPlugin, {
  // Optional configuration
  intensity: 0.8,
});
app.mount('#app');
```

## useHaptic Composable

```vue
<script setup>
import { useHaptic } from '@hapticjs/vue';

// With a preset effect
const { trigger } = useHaptic('success');

// Full API access
const haptic = useHaptic();
</script>

<template>
  <button @click="trigger">Submit</button>
  <button @click="haptic.tap()">Tap</button>
  <button @click="haptic.play('~~..##')">Pattern</button>
</template>
```

## v-haptic Directive

The `v-haptic` directive adds haptic feedback to any element on click:

```vue
<template>
  <!-- Semantic effects -->
  <button v-haptic="'tap'">Click me</button>
  <button v-haptic="'success'">Submit</button>
  <button v-haptic="'error'">Delete</button>

  <!-- HPL patterns -->
  <button v-haptic="'~~..##'">Pattern</button>
  <button v-haptic="'@@--'">Heavy</button>
</template>
```

The directive accepts a semantic effect name or an HPL pattern string.

## useHapticGesture

Bind haptic feedback to gesture events:

```vue
<script setup>
import { useHapticGesture } from '@hapticjs/vue';

const gestureRef = useHapticGesture({
  onTap: 'tap',
  onLongPress: 'longPress',
});
</script>

<template>
  <div ref="gestureRef">Gesture target</div>
</template>
```

## Reactive Haptics

Use Vue's reactivity to trigger haptics based on state:

```vue
<script setup>
import { ref, watch } from 'vue';
import { useHaptic } from '@hapticjs/vue';

const haptic = useHaptic();
const count = ref(0);

watch(count, (newVal, oldVal) => {
  if (newVal > oldVal) {
    haptic.tap();
  }
});

function increment() {
  count.value++;
}
</script>

<template>
  <button @click="increment">Count: {{ count }}</button>
</template>
```

## Example: Form with Haptic Feedback

```vue
<script setup>
import { ref } from 'vue';
import { useHaptic } from '@hapticjs/vue';

const haptic = useHaptic();
const email = ref('');
const submitted = ref(false);

async function onSubmit() {
  if (!email.value.includes('@')) {
    haptic.error();
    return;
  }

  submitted.value = true;
  haptic.success();
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <input v-model="email" v-haptic="'selection'" placeholder="Email" />
    <button type="submit" v-haptic="'tap'">Submit</button>
  </form>
</template>
```

## Related

- [Getting Started](/guide/getting-started) -- Core setup
- [React](/frameworks/react) -- React integration
- [Svelte](/frameworks/svelte) -- Svelte integration
