<div align="center">

<img src="assets/logo.svg" alt="haptic.js" width="360" />

<br/>

**The universal haptics engine for JavaScript & TypeScript**

[![npm version](https://img.shields.io/npm/v/@hapticjs/core?style=flat-square&color=6366f1)](https://www.npmjs.com/package/@hapticjs/core)
[![CI](https://img.shields.io/github/actions/workflow/status/thirumaleshp/hapticjs/ci.yml?style=flat-square&label=CI)](https://github.com/thirumaleshp/hapticjs/actions)
[![license](https://img.shields.io/npm/l/@hapticjs/core?style=flat-square)](https://github.com/thirumaleshp/hapticjs/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@hapticjs/core?style=flat-square&label=size)](https://bundlephobia.com/package/@hapticjs/core)
[![downloads](https://img.shields.io/npm/dm/@hapticjs/core?style=flat-square)](https://www.npmjs.com/package/@hapticjs/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[**Playground**](https://thirumaleshp.github.io/hapticjs/) &bull; [**Documentation**](https://thirumaleshp.github.io/hapticjs/docs/) &bull; [**Gallery**](https://thirumaleshp.github.io/hapticjs/gallery/) &bull; [**Examples**](https://thirumaleshp.github.io/hapticjs/examples/)

</div>

---

**@hapticjs** is a tiny, zero-dependency haptics library with a beautiful API, a novel pattern language, and first-class framework integrations. One API across Web, React, Vue, Svelte, Angular, Gamepad, and React Native.

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

### CDN Usage

No build step required — use directly in the browser:

```html
<script src="https://unpkg.com/@hapticjs/core"></script>
<script>
  const haptic = new HapticJS.HapticEngine();
  haptic.tap();
  haptic.success();
  haptic.play('~~..##..@@');
</script>
```

---

## Why @hapticjs?

- **One API everywhere** -- Web Vibration API, Gamepad rumble, React Native, iOS audio
- **Semantic effects** -- `tap()`, `success()`, `error()` map to the best native equivalent
- **Haptic Pattern Language (HPL)** -- Describe complex patterns as strings: `~~..##..@@`
- **63+ built-in presets** -- UI, notifications, gaming, accessibility, system, emotions
- **Sound engine** -- Procedural audio feedback via Web Audio API
- **Visual effects** -- CSS-based flash, shake, ripple, glow, bounce, jello, rubber
- **Physics patterns** -- Spring, bounce, friction, wave, gravity, elastic, pendulum
- **Emotion presets** -- 12 feelings mapped to haptic patterns
- **Themes** -- 8 built-in multi-sensory themes (gaming, luxury, retro, and more)
- **Pattern recorder** -- Record tap rhythms and export as HPL
- **Framework integrations** -- React hooks, Vue composables/directives, Svelte actions, Angular, Web Components
- **Fluent composer** -- Build patterns programmatically with a chainable API
- **Adaptive engine** -- Auto-adjusts to device capabilities
- **Fallback system** -- Visual/audio fallbacks when haptics aren't available
- **A/B testing** -- Compare pattern variants with built-in export/import
- **Motion detection** -- Platform-aware adaptive intensity
- **Tree-shakeable** -- Import only what you need
- **Zero dependencies** -- Core is <3KB gzipped
- **TypeScript-first** -- Full type safety, dual ESM/CJS

---

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| [`@hapticjs/core`](packages/core) | Engine, HPL parser, presets, composer, sound, visual, physics, themes | `npm i @hapticjs/core` |
| [`@hapticjs/react`](packages/react) | Hooks, provider, components | `npm i @hapticjs/react` |
| [`@hapticjs/vue`](packages/vue) | Composables, directives | `npm i @hapticjs/vue` |
| [`@hapticjs/svelte`](packages/svelte) | Actions, stores | `npm i @hapticjs/svelte` |
| [`@hapticjs/angular`](packages/angular) | Directives, services | `npm i @hapticjs/angular` |
| [`@hapticjs/gamepad`](packages/gamepad) | Gamepad haptics adapter | `npm i @hapticjs/gamepad` |
| [`@hapticjs/react-native`](packages/react-native) | React Native adapter | `npm i @hapticjs/react-native` |
| [`@hapticjs/web-components`](packages/web-components) | Custom elements | `npm i @hapticjs/web-components` |
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
| `.` | Pause | 50ms | -- |
| `\|` | Sharp tap | 10ms | 1.0 |
| `-` | Sustain (extend previous) | 50ms | -- |

### Groups & Repeats

```
[~.~.]x3       -> Repeat group 3 times
[##..]x2[@@]   -> Combine groups
~~--           -> Light vibration sustained (200ms total)
```

### Examples

```typescript
haptic.play('|');              // Quick tap
haptic.play('~~..##..@@');     // Gentle -> medium -> heavy
haptic.play('[~.]x5');         // 5 quick pulses
haptic.play('@@--');           // Heavy sustained vibration
haptic.play('[|..]x3..@@');    // 3 taps then a boom
```

### CLI Preview

```bash
npx @hapticjs/cli preview "~~..##..@@"
# ▃▃░░▅▅░░█████

npx @hapticjs/cli validate "[~.]x3"
# ✓ Valid pattern -- 6 steps, 300ms total

npx @hapticjs/cli list gaming
# Lists all gaming presets
```

---

## Presets

55+ built-in presets across 6 categories:

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

### Emotions (12)
`excited` `calm` `tense` `happy` `sad` `angry` `surprised` `anxious` `confident` `playful` `romantic` `peaceful`

```typescript
import { presets, emotions } from '@hapticjs/core';

haptic.play(presets.gaming.explosion);
haptic.play(presets.ui.pullToRefresh);
haptic.play(emotions.excited);
```

---

## Multi-sensory Feedback

The `SensoryEngine` combines haptic, sound, and visual feedback into a single unified API. One call triggers all three channels simultaneously, themed to match.

```typescript
import { SensoryEngine } from '@hapticjs/core';

const engine = SensoryEngine.create({ theme: 'gaming' });

// Each call triggers haptic + sound + visual together
await engine.tap();       // Vibrate + click sound + pulse visual
await engine.success();   // Vibrate + ascending chime + green glow
await engine.error();     // Vibrate + buzzer + red flash
await engine.warning();   // Vibrate + chime + yellow flash
await engine.selection(); // Vibrate + tick sound + subtle pulse
await engine.toggle(true); // Vibrate + toggle sound + scale pulse

// Switch themes on the fly
engine.setTheme('luxury');   // Gold glow, soft sounds, moderate haptics
engine.setTheme('minimal');  // No sound, subtle pulse, light haptics

// Access individual engines
engine.sound.click();
engine.visual.shake();
engine.haptic.play('~~..##');
```

---

## Sound Engine

Procedurally generated UI sounds via Web Audio API. No audio files needed.

```typescript
import { SoundEngine } from '@hapticjs/core';

const sound = new SoundEngine({ volume: 0.5 });

await sound.click();                       // Short click
await sound.click({ pitch: 'high' });      // High-pitched click
await sound.tick();                        // Ultra-short tick
await sound.pop();                         // Bubbly pop
await sound.whoosh();                      // Swipe/swoosh sound
await sound.chime('C5');                   // Musical chime (C4, E4, G4, C5)
await sound.success();                     // Ascending two-tone
await sound.error();                       // Descending buzzer
await sound.tap();                         // Subtle tap
await sound.toggle(true);                  // Ascending for on, descending for off
await sound.playTone(440, 100);            // Custom tone: 440Hz for 100ms

sound.setVolume(0.3);
sound.mute();
sound.unmute();
sound.dispose();                           // Release AudioContext
```

---

## Visual Effects

CSS-based visual feedback that works everywhere -- including desktop and iOS where vibration is unavailable.

```typescript
import { VisualEngine } from '@hapticjs/core';

const visual = new VisualEngine({ target: document.getElementById('app') });

visual.flash();                              // Quick white screen flash
visual.flash({ color: 'red', opacity: 0.2 }); // Red flash
visual.shake();                              // CSS shake animation
visual.shake({ intensity: 5, duration: 300 }); // Stronger shake
visual.pulse();                              // Scale pulse
visual.ripple(x, y);                         // Material Design ripple at coordinates
visual.ripple(x, y, { color: 'blue', size: 150 }); // Custom ripple
visual.glow();                               // Box shadow glow
visual.glow({ color: 'gold', size: 20 });    // Custom glow
visual.bounce();                             // Bounce animation
visual.jello();                              // Jello/wobble effect
visual.rubber();                             // Rubber band scale
visual.highlight({ color: 'yellow' });       // Background color highlight

visual.setTarget(otherElement);              // Change target
visual.dispose();                            // Clean up
```

---

## Physics Patterns

Physics-based haptic patterns that simulate real-world physical interactions.

```typescript
import { physics, spring, bounce, wave } from '@hapticjs/core';

// Spring -- bouncy oscillation with configurable stiffness and damping
haptic.play(physics.spring({ stiffness: 0.8, damping: 0.3 }));

// Bounce -- ball bouncing with decreasing height
haptic.play(physics.bounce({ height: 1.0, bounciness: 0.6, bounces: 5 }));

// Friction -- rough surface sliding
haptic.play(physics.friction({ roughness: 0.7, speed: 0.5 }));

// Impact -- collision with resonance
haptic.play(physics.impact({ mass: 0.8, hardness: 0.9 }));

// Gravity -- accelerating fall sensation
haptic.play(physics.gravity({ distance: 1.0, duration: 400 }));

// Elastic -- rubber band stretch and snap
haptic.play(physics.elastic({ stretch: 0.7, snapSpeed: 0.8 }));

// Wave -- smooth sine-wave motion
haptic.play(physics.wave({ amplitude: 0.7, frequency: 1.0, cycles: 2 }));

// Pendulum -- swinging motion, intensity peaks at extremes
haptic.play(physics.pendulum({ energy: 0.8, swings: 3 }));
```

---

## Emotion Presets

12 emotion-based haptic patterns that convey feelings through vibration rhythms.

| Emotion | Description |
|---------|-------------|
| `excited` | Fast, energetic pulses building to a crescendo |
| `calm` | Slow, gentle wave with soft sustained vibrations |
| `tense` | Tight, irregular short heavy bursts |
| `happy` | Bouncy, playful ascending rhythm |
| `sad` | Slow, heavy, descending vibrations that fade |
| `angry` | Aggressive, chaotic rapid heavy hits |
| `surprised` | Sharp sudden hit, silence, then lighter hit |
| `anxious` | Fast irregular heartbeat with inconsistent spacing |
| `confident` | Strong, steady, measured even pulses |
| `playful` | Alternating light-heavy in bouncy rhythm |
| `romantic` | Gentle heartbeat rhythm, two soft pulses with long pauses |
| `peaceful` | Very subtle, barely-there ultra-light slow pulses |

```typescript
import { emotions } from '@hapticjs/core';

haptic.play(emotions.excited);
haptic.play(emotions.calm);
haptic.play(emotions.romantic);
```

---

## Pattern Recorder

Record tap rhythms in real time and convert them to HPL strings or haptic patterns.

```typescript
import { PatternRecorder } from '@hapticjs/core';

const recorder = new PatternRecorder();

// Start recording
recorder.start();

// Record taps (call these in response to user input)
recorder.tap();        // Default intensity (0.6)
recorder.tap(0.9);     // Heavy tap
recorder.tap(0.2);     // Light tap

// Stop and get results
recorder.stop();

// Convert to HPL string
const hpl = recorder.toHPL();   // e.g. '##..@@..~'

// Convert to haptic steps or pattern
const steps = recorder.toSteps();
const pattern = recorder.toPattern('my-rhythm');

// Quantize to grid for cleaner output
recorder.quantize(50);  // Snap to 50ms grid

// Live feedback during recording
recorder.onTap((tap, index) => {
  console.log(`Tap ${index}: intensity=${tap.intensity}`);
});

// Play back the recorded pattern
haptic.play(hpl);
```

---

## Themes

8 built-in multi-sensory themes that configure haptic intensity, sound, and visual style together.

| Theme | Haptic | Sound | Visual | Style |
|-------|--------|-------|--------|-------|
| `default` | 0.7 | On | On | Flash |
| `gaming` | 1.0 | On (loud) | On | Shake |
| `minimal` | 0.4 | Off | On | Pulse |
| `luxury` | 0.6 | On (soft) | On | Glow |
| `retro` | 0.9 | On | On | Flash |
| `nature` | 0.5 | On (soft) | On | Pulse |
| `silent` | 0.7 | Off | Off | -- |
| `accessible` | 1.0 | On (loud) | On | Flash |

```typescript
import { ThemeManager, themes } from '@hapticjs/core';

const tm = new ThemeManager();

// Apply a built-in theme
tm.setTheme('gaming');

// Get current theme settings
const theme = tm.getTheme();
console.log(theme.hapticIntensity); // 1.0
console.log(theme.colors.primary);  // '#a855f7'

// List all available themes
tm.listThemes(); // ['default', 'gaming', 'minimal', ...]

// Register a custom theme
tm.registerTheme({
  name: 'custom',
  hapticIntensity: 0.8,
  soundEnabled: true,
  soundVolume: 0.4,
  visualEnabled: true,
  visualStyle: 'ripple',
  colors: {
    primary: '#ff6b6b',
    success: '#51cf66',
    error: '#ff6b6b',
    warning: '#fcc419',
  },
});
tm.setTheme('custom');
```

---

## Pattern Sharing

Export and import haptic patterns as JSON for sharing between apps and users.

```typescript
import { exportPattern, importPattern, patternToDataURL, patternFromDataURL } from '@hapticjs/core';

// Export an HPL string or pattern to portable JSON
const exported = exportPattern('~~..##..@@', {
  name: 'My Pattern',
  author: 'Jane',
  tags: ['ui', 'notification'],
});

// Import from JSON
const pattern = importPattern(exported);
haptic.play(pattern);

// Share via data URL
const url = patternToDataURL('~~..##..@@', { name: 'Shared Pattern' });
const restored = patternFromDataURL(url);
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
| iOS Safari | iOS Audio Adapter | Audio haptic fallback |
| Desktop Chrome | -- | Visual/audio fallback |
| Gamepad | GamepadHapticActuator | Dual-motor rumble |
| React Native | React Native adapter | Native haptics |
| Node.js / SSR | NoopAdapter | Safe no-op |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding guidelines, and how to add presets or adapters.

```bash
# Clone & install
git clone https://github.com/thirumaleshp/hapticjs.git
cd hapticjs
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
