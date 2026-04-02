# @hapticjs/vue

Vue composables and directives for the @hapticjs haptic engine.

```bash
npm install @hapticjs/vue @hapticjs/core
```

## Usage

### Directive

```vue
<template>
  <button v-haptic="'tap'">Click me</button>
  <button v-haptic="'success'">Submit</button>
  <button v-haptic="'~~..##'">Pattern</button>
</template>
```

### Composable

```vue
<script setup>
import { useHaptic } from '@hapticjs/vue';

const { trigger } = useHaptic('success');
const haptic = useHaptic();
</script>

<template>
  <button @click="trigger">Submit</button>
  <button @click="haptic.tap()">Tap</button>
</template>
```

### Plugin

```typescript
import { createApp } from 'vue';
import { HapticPlugin } from '@hapticjs/vue';

createApp(App).use(HapticPlugin).mount('#app');
```

## License

MIT
