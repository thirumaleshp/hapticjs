# Svelte

`@hapticjs/svelte` provides Svelte actions and a store for haptic feedback.

## Installation

::: code-group

```bash [npm]
npm install @hapticjs/core @hapticjs/svelte
```

```bash [pnpm]
pnpm add @hapticjs/core @hapticjs/svelte
```

:::

## Actions

### `haptic` Action

Add haptic feedback to any element on click:

```svelte
<script>
  import { haptic } from '@hapticjs/svelte';
</script>

<button use:haptic={'tap'}>Click me</button>
<button use:haptic={'success'}>Submit</button>
<button use:haptic={'error'}>Delete</button>
<button use:haptic={'~~..##'}>Pattern</button>
```

### `hapticHover` Action

Trigger haptic feedback on hover:

```svelte
<script>
  import { hapticHover } from '@hapticjs/svelte';
</script>

<button use:hapticHover={'selection'}>Hover me</button>
<div use:hapticHover={'tap'}>Hoverable area</div>
```

## Haptic Store

Create a reactive store with full haptic engine access:

```svelte
<script>
  import { createHapticStore } from '@hapticjs/svelte';

  const store = createHapticStore();
</script>

<button on:click={() => store.tap()}>Tap</button>
<button on:click={() => store.success()}>Success</button>
<button on:click={() => store.play('~~..##..@@')}>Pattern</button>
<button on:click={() => store.impact('heavy')}>Heavy</button>
```

### Store Type

```typescript
interface HapticStore {
  tap(intensity?: number): Promise<void>;
  doubleTap(intensity?: number): Promise<void>;
  longPress(intensity?: number): Promise<void>;
  success(): Promise<void>;
  warning(): Promise<void>;
  error(): Promise<void>;
  selection(): Promise<void>;
  toggle(on: boolean): Promise<void>;
  impact(style?: ImpactStyle): Promise<void>;
  vibrate(duration: number, intensity?: number): Promise<void>;
  play(pattern: string | HapticPattern | HapticStep[]): Promise<void>;
  isSupported: boolean;
}
```

## Example: Interactive List

```svelte
<script>
  import { haptic, hapticHover } from '@hapticjs/svelte';
  import { createHapticStore } from '@hapticjs/svelte';

  const store = createHapticStore();

  let items = ['Apple', 'Banana', 'Cherry'];

  function removeItem(index) {
    items = items.filter((_, i) => i !== index);
    store.error();
  }

  function addItem() {
    items = [...items, `Item ${items.length + 1}`];
    store.success();
  }
</script>

{#each items as item, i}
  <div use:hapticHover={'selection'}>
    {item}
    <button use:haptic={'error'} on:click={() => removeItem(i)}>Remove</button>
  </div>
{/each}

<button use:haptic={'success'} on:click={addItem}>Add Item</button>
```

## Related

- [Getting Started](/guide/getting-started) -- Core setup
- [React](/frameworks/react) -- React integration
- [Vue](/frameworks/vue) -- Vue integration
