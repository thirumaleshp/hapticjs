# @hapticjs/svelte

Svelte actions and stores for the @hapticjs haptic engine.

```bash
npm install @hapticjs/svelte @hapticjs/core
```

## Usage

### Actions

```svelte
<script>
  import { haptic, hapticHover } from '@hapticjs/svelte';
</script>

<button use:haptic={'tap'}>Click me</button>
<button use:haptic={'success'}>Submit</button>
<button use:hapticHover={'selection'}>Hover me</button>
```

### Store

```svelte
<script>
  import { createHapticStore } from '@hapticjs/svelte';

  const store = createHapticStore();
</script>

<button on:click={() => store.tap()}>Tap</button>
<button on:click={() => store.success()}>Success</button>
<button on:click={() => store.play('~~..##')}>Pattern</button>
```

## License

MIT
