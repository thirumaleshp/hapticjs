# HapticEngine API Reference

The main entry point for haptic feedback. Orchestrates adapters, patterns, and fallbacks.

## Creating an Engine

```typescript
import { HapticEngine } from '@hapticjs/core';

// Auto-detect adapter
const engine = HapticEngine.create();

// With configuration
const engine = HapticEngine.create({
  enabled: true,
  intensity: 0.8,
  adapter: myCustomAdapter,
  fallback: { type: 'visual', visual: { style: 'flash' } },
  respectSystemSettings: true,
});
```

### `HapticEngine.create(config?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `Partial<HapticConfig>` | Optional configuration |

Returns a new `HapticEngine` instance.

## Singleton

A pre-configured singleton is available for quick use:

```typescript
import { haptic } from '@hapticjs/core';

haptic.tap();
haptic.success();
```

---

## Semantic Methods

### `tap(intensity?): Promise<void>`

Light tap feedback. 30ms vibration at the specified intensity.

| Parameter | Type | Default |
|-----------|------|---------|
| `intensity` | `number` | `0.6` |

### `doubleTap(intensity?): Promise<void>`

Two quick taps with an 80ms pause between them.

| Parameter | Type | Default |
|-----------|------|---------|
| `intensity` | `number` | `0.6` |

### `longPress(intensity?): Promise<void>`

Sustained press feedback. 50ms vibration.

| Parameter | Type | Default |
|-----------|------|---------|
| `intensity` | `number` | `0.8` |

### `success(): Promise<void>`

Two-step ascending pattern: 30ms at 0.5, pause, 40ms at 0.8.

### `warning(): Promise<void>`

Three even pulses: 40ms at 0.7 each, with 50ms pauses.

### `error(): Promise<void>`

Two heavy pulses: 80ms at 1.0, 100ms pause, 80ms at 1.0.

### `selection(): Promise<void>`

Subtle selection tick: 25ms at 0.5.

### `toggle(on): Promise<void>`

| Parameter | Type | Description |
|-----------|------|-------------|
| `on` | `boolean` | Toggle state |

On: 30ms at 0.6. Off: 25ms at 0.4.

### `impact(style?): Promise<void>`

Matches iOS `UIImpactFeedbackGenerator` styles.

| Parameter | Type | Default |
|-----------|------|---------|
| `style` | `ImpactStyle` | `'medium'` |

Styles: `'light'` | `'medium'` | `'heavy'` | `'rigid'` | `'soft'`

---

## Parametric Methods

### `vibrate(duration, intensity?): Promise<void>`

| Parameter | Type | Default |
|-----------|------|---------|
| `duration` | `number` | -- |
| `intensity` | `number` | `1.0` |

### `play(pattern): Promise<void>`

Play a haptic pattern. Accepts multiple input types:

| Parameter | Type | Description |
|-----------|------|-------------|
| `pattern` | `string` | HPL pattern string (e.g., `'~~..##..@@'`) |
| `pattern` | `HapticPattern` | Pattern object with `steps` array |
| `pattern` | `HapticStep[]` | Raw step array |

---

## Composer

### `compose(): PatternComposer`

Creates a new `PatternComposer` linked to this engine. See the [Composer guide](/guide/composer).

```typescript
await engine.compose()
  .tap(0.5)
  .pause(100)
  .buzz(200)
  .play();
```

---

## Configuration

### `configure(config): void`

Update engine configuration at runtime.

| Parameter | Type |
|-----------|------|
| `config` | `Partial<HapticConfig>` |

```typescript
engine.configure({ enabled: false });
engine.configure({ intensity: 0.5 });
```

---

## Properties

### `isSupported: boolean`

Whether haptics are supported on the current device.

### `adapterName: string`

Name of the active adapter (e.g., `'web-vibration'`, `'ios-audio'`, `'noop'`).

---

## Lifecycle

### `cancel(): void`

Cancel any ongoing haptic effect.

### `dispose(): void`

Clean up resources. Call when the engine is no longer needed.

---

## Related Classes

### SensoryEngine

Higher-level engine combining haptic + sound + visual. See [Multi-Sensory guide](/guide/multi-sensory).

```typescript
const sensory = SensoryEngine.create({ theme: 'gaming' });
```

### AdaptiveEngine

Internal engine that adjusts patterns to device capabilities. Used automatically by `HapticEngine`.

### FallbackManager

Manages visual/audio fallback when haptics are unavailable. Configured via `HapticConfig.fallback`.

### detectAdapter()

Auto-detects the best available adapter for the current platform:

```typescript
import { detectAdapter } from '@hapticjs/core';

const adapter = detectAdapter();
// Returns WebVibrationAdapter, IoSAudioAdapter, or NoopAdapter
```

---

## Built-in Adapters

| Adapter | Platform | Import |
|---------|----------|--------|
| `WebVibrationAdapter` | Android browsers | `@hapticjs/core` |
| `IoSAudioAdapter` | iOS Safari | `@hapticjs/core` |
| `NoopAdapter` | SSR / unsupported | `@hapticjs/core` |
| `GamepadHapticAdapter` | Gamepads | `@hapticjs/gamepad` |

```typescript
import { WebVibrationAdapter, NoopAdapter } from '@hapticjs/core';
import { GamepadHapticAdapter } from '@hapticjs/gamepad';
```

---

## HPL Functions

### `parseHPL(input): HPLNode`

Parse an HPL string into an AST.

### `compile(ast): HapticStep[]`

Compile an HPL AST into steps.

### `tokenize(input): HPLToken[]`

Tokenize an HPL string into tokens.

### `validateHPL(input): ValidationResult`

Validate an HPL string and return step count and duration.

### `optimizeSteps(steps): HapticStep[]`

Merge adjacent steps of the same type.

---

## Pattern Sharing

### `exportPattern(input, options?): HapticPatternExport`

Export a pattern to a portable JSON object.

### `importPattern(data): HapticPattern`

Import a pattern from JSON or a `HapticPatternExport` object.

### `patternToJSON(input, options?): string`

Serialize a pattern to pretty-printed JSON.

### `patternFromJSON(json): HapticPattern`

Parse a JSON string into a `HapticPattern`.

### `patternToDataURL(input, options?): string`

Encode a pattern as a `data:application/haptic+json;base64,...` URL.

### `patternFromDataURL(url): HapticPattern`

Decode a data URL back to a `HapticPattern`.

---

## Other Exports

| Export | Type | Description |
|--------|------|-------------|
| `PatternComposer` | class | Fluent pattern builder |
| `PatternRecorder` | class | Tap rhythm recorder |
| `MiddlewareManager` | class | Middleware pipeline |
| `ProfileManager` | class | Intensity profile management |
| `ThemeManager` | class | Multi-sensory theme management |
| `SoundEngine` | class | Procedural audio engine |
| `VisualEngine` | class | CSS visual effects engine |
| `RhythmSync` | class | BPM sync for haptics |
| `MotionDetector` | class | Device motion detection |
| `HapticA11y` | class | Accessibility auto-haptics |
| `HapticExperiment` | class | A/B testing for patterns |
| `physics` | object | Physics pattern generators |
| `presets` | object | 55+ built-in presets |
| `profiles` | object | Built-in intensity profiles |
| `themes` | object | Built-in theme presets |
| `emotions` | object | Emotion preset patterns |
| `detectPlatform()` | function | Platform detection utility |
