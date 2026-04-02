<div align="center">

# @hapticjs

**Universal Haptics Engine for JavaScript & TypeScript**

[![npm](https://img.shields.io/npm/v/@hapticjs/core?label=core&color=blue)](https://www.npmjs.com/org/hapticjs)
[![license](https://img.shields.io/badge/license-MIT-green)](https://github.com/thirumaleshp/hapticjs/blob/main/LICENSE)
![bundle size](https://img.shields.io/badge/bundle-<3KB-brightgreen)

</div>

---

**@hapticjs** is a tiny, zero-dependency haptics library with a beautiful API, a novel pattern language, and first-class framework integrations. One API across Web, React, Vue, Svelte, Gamepad, and React Native.

```bash
npm install @hapticjs/core
```

```typescript
import { haptic } from '@hapticjs/core';

haptic.tap();
haptic.success();
haptic.play('~~..##..@@');
```

That's it. Three lines to add haptic feedback to any web app.

---

## Why @hapticjs?

- **One API everywhere** — Web Vibration API, Gamepad rumble, React Native (coming soon)
- **Semantic effects** — `tap()`, `success()`, `error()` map to the best native equivalent
- **Haptic Pattern Language (HPL)** — Describe complex patterns as strings: `~~..##..@@`
- **43 built-in presets** — UI, notifications, gaming, accessibility, system
- **Framework integrations** — React hooks, Vue composables/directives, Svelte actions
- **Fluent composer** — Build patterns programmatically with a chainable API
- **Adaptive engine** — Auto-adjusts to device capabilities
- **Fallback system** — Visual/audio fallbacks when haptics aren't available
- **Tree-shakeable** — Import only what you need
- **Zero dependencies** — Core is <3KB gzipped
- **TypeScript-first** — Full type safety, dual ESM/CJS

---

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| [`@hapticjs/core`](packages/core) | Engine, HPL parser, presets, composer | `npm i @hapticjs/core` |
| [`@hapticjs/react`](packages/react) | Hooks, provider, components | `npm i @hapticjs/react` |
| [`@hapticjs/vue`](packages/vue) | Composables, directives | `npm i @hapticjs/vue` |
| [`@hapticjs/svelte`](packages/svelte) | Actions, stores | `npm i @hapticjs/svelte` |
| [`@hapticjs/gamepad`](packages/gamepad) | Gamepad haptics adapter | `npm i @hapticjs/gamepad` |
| [`@hapticjs/cli`](packages/cli) | CLI preview & validation | `npm i -g @hapticjs/cli` |

---

## Quick Start

### Vanilla JS / TypeScript

```typescript
import { haptic } from '@hapticjs/core';

// Semantic effects
haptic.tap();
haptic.doubleTap();
haptic.success();
haptic.warning();
haptic.error();
haptic.selection();
haptic.toggle(true);
haptic.impact('heavy');

// Play an HPL pattern string
haptic.play('~~..##..@@');

// Vibrate with duration & intensity
haptic.vibrate(200, 0.8);

// Fluent composer
haptic.compose()
  .tap(0.5)
  .pause(100)
  .buzz(200)
  .ramp(0.2, 1.0, 300)
  .play();
```

### React

```tsx
import { useHaptic, HapticProvider, HapticButton } from '@hapticjs/react';

// With a preset
function SubmitButton() {
  const { trigger, isSupported } = useHaptic('success');
  return <button onClick={trigger}>Submit</button>;
}

// Full API access
function App() {
  const haptic = useHaptic();

  return (
    <HapticProvider>
      <button onClick={() => haptic.tap()}>Tap</button>
      <button onClick={() => haptic.play('~~..##')}>Pattern</button>
      <HapticButton effect="success">Submit</HapticButton>
    </HapticProvider>
  );
}
```

### Vue

```vue
<script setup>
import { useHaptic } from '@hapticjs/vue';

const { trigger } = useHaptic('success');
const haptic = useHaptic();
</script>

<template>
  <!-- Composable -->
  <button @click="trigger">Submit</button>
  <button @click="haptic.tap()">Tap</button>

  <!-- Directive -->
  <button v-haptic="'tap'">Click me</button>
  <button v-haptic="'success'">Submit</button>
  <button v-haptic="'~~..##'">Pattern</button>
</template>
```

### Svelte

```svelte
<script>
  import { haptic, hapticHover, createHapticStore } from '@hapticjs/svelte';

  const store = createHapticStore();
</script>

<button use:haptic={'tap'}>Click me</button>
<button use:haptic={'success'}>Submit</button>
<button use:hapticHover={'selection'}>Hover me</button>

<button on:click={() => store.tap()}>Tap</button>
```

### Gamepad

```typescript
import { HapticEngine } from '@hapticjs/core';
import { GamepadHapticAdapter } from '@hapticjs/gamepad';

const adapter = new GamepadHapticAdapter({ gamepadIndex: 0 });
const engine = HapticEngine.create({ adapter });

engine.play('@@..@@..@@'); // Rumble!
```

---

## Haptic Pattern Language (HPL)

HPL lets you describe haptic patterns as simple strings:

| Character | Effect | Duration | Intensity |
|-----------|--------|----------|-----------|
| `~` | Light vibration | 50ms | 0.3 |
| `#` | Medium vibration | 50ms | 0.6 |
| `@` | Heavy vibration | 50ms | 1.0 |
| `.` | Pause | 50ms | — |
| `\|` | Sharp tap | 10ms | 1.0 |
| `-` | Sustain (extend previous) | 50ms | — |

### Groups & Repeats

```
[~.~.]x3       → Repeat group 3 times
[##..]x2[@@]   → Combine groups
~~--           → Light vibration sustained (200ms total)
```

### Examples

```typescript
haptic.play('|');              // Quick tap
haptic.play('~~..##..@@');     // Gentle → medium → heavy
haptic.play('[~.]x5');         // 5 quick pulses
haptic.play('@@--');           // Heavy sustained vibration
haptic.play('[|..]x3..@@');    // 3 taps then a boom
```

### CLI Preview

```bash
npx @hapticjs/cli preview "~~..##..@@"
# ▃▃░░▅▅░░█████

npx @hapticjs/cli validate "[~.]x3"
# ✓ Valid pattern — 6 steps, 300ms total

npx @hapticjs/cli list gaming
# Lists all gaming presets
```

---

## Presets

43 built-in presets across 5 categories:

### UI (12)
`tap` `doubleTap` `longPress` `toggleOn` `toggleOff` `sliderSnap` `selection` `pullToRefresh` `swipe` `contextMenu` `dragStart` `drop`

### Notifications (7)
`success` `warning` `error` `info` `messageReceived` `alarm` `reminder`

### Gaming (10)
`explosion` `collision` `heartbeat` `gunshot` `swordClash` `powerUp` `damage` `pickup` `levelComplete` `engineRumble`

### Accessibility (7)
`confirm` `deny` `boundary` `focusChange` `countTick` `landmark` `progressCheckpoint`

### System (7)
`keyPress` `scrollTick` `scrollBounce` `delete` `undo` `copy` `paste`

```typescript
import { presets } from '@hapticjs/core';

haptic.play(presets.gaming.explosion);
haptic.play(presets.ui.pullToRefresh);
```

---

## Composer API

Build complex patterns programmatically:

```typescript
const pattern = haptic.compose()
  .tap(0.5)                           // Light tap
  .pause(100)                         // Wait 100ms
  .vibrate(200, 0.8)                  // Vibrate 200ms at 80%
  .ramp(0.2, 1.0, 300)               // Ramp from 20% to 100% over 300ms
  .pulse(3, 50, 50, 0.6)             // 3 pulses
  .buzz(100)                          // Buzz 100ms
  .repeat(2)                          // Repeat everything twice
  .play();                            // Execute
```

---

## Configuration

```typescript
import { HapticEngine } from '@hapticjs/core';

const engine = HapticEngine.create({
  enabled: true,
  fallback: {
    enabled: true,
    visual: true,
    audio: false,
    visualStyle: 'flash',       // 'flash' | 'shake' | 'pulse'
    visualTarget: document.body,
  },
});

// Or configure later
engine.configure({ enabled: false });
```

---

## Platform Support

| Platform | API | Status |
|----------|-----|--------|
| Android Chrome | Vibration API | Full support |
| Android Firefox | Vibration API | Full support |
| iOS Safari | — | Visual/audio fallback |
| Desktop Chrome | — | Visual/audio fallback |
| Gamepad | GamepadHapticActuator | Dual-motor rumble |
| React Native | Coming soon | Planned |
| Node.js / SSR | NoopAdapter | Safe no-op |

---

## Contributing

```bash
# Clone & install
git clone https://github.com/thirumaleshp/Feelback.git
cd Feelback
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck
```

---

## License

MIT
