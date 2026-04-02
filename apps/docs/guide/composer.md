# Composer API

The `PatternComposer` provides a fluent, chainable API for building haptic patterns programmatically. It is useful when you need more precision than HPL strings offer.

## Basic Usage

```typescript
import { haptic } from '@hapticjs/core';

// Build and play in one chain
await haptic.compose()
  .tap(0.5)
  .pause(100)
  .buzz(200)
  .ramp(0.2, 1.0, 300)
  .play();
```

## Methods

### `tap(intensity?)`

Add a short tap vibration (10ms).

```typescript
composer.tap();      // Default 0.6 intensity
composer.tap(0.3);   // Light tap
composer.tap(0.9);   // Heavy tap
```

### `vibrate(duration, intensity?)`

Add a vibration with specified duration and intensity.

```typescript
composer.vibrate(200, 0.8);  // 200ms at 80%
composer.vibrate(100);       // 100ms at 100%
```

### `buzz(duration?, intensity?)`

Add a medium-length vibration. Defaults to 100ms at 0.7 intensity.

```typescript
composer.buzz();             // 100ms, 0.7
composer.buzz(200, 0.5);     // 200ms, 0.5
```

### `pause(duration?)`

Add a silent pause. Defaults to 50ms.

```typescript
composer.pause();        // 50ms pause
composer.pause(200);     // 200ms pause
```

### `ramp(startIntensity, endIntensity, duration, easing?)`

Create a smooth intensity ramp. Generates multiple steps internally for a smooth transition.

```typescript
// Fade in
composer.ramp(0.0, 1.0, 300);

// Fade out with easing
composer.ramp(1.0, 0.0, 300, 'ease-out');
```

Available easing functions: `'linear'` | `'ease-in'` | `'ease-out'` | `'ease-in-out'`

### `pulse(count, onDuration?, offDuration?, intensity?)`

Add a repeating on-off pulse pattern.

```typescript
composer.pulse(3);                    // 3 pulses, 50ms on/off, 0.8 intensity
composer.pulse(5, 30, 30, 0.6);      // 5 fast, light pulses
```

### `repeat(times)`

Repeat the entire current sequence N times.

```typescript
composer.tap().pause(50).repeat(4);  // Tap-pause repeated 4 times
```

### `build()`

Return the steps as a `HapticStep[]` array without playing:

```typescript
const steps = haptic.compose()
  .tap()
  .pause(50)
  .buzz()
  .build();

// Use steps later
haptic.play(steps);
```

### `play()`

Build and immediately play the pattern:

```typescript
await haptic.compose()
  .tap(0.5)
  .pause(100)
  .vibrate(200, 0.8)
  .play();
```

### `clear()`

Reset the composer for reuse:

```typescript
const composer = haptic.compose();
composer.tap().play();
composer.clear();
composer.buzz().play();
```

### `duration`

Get the total duration of the current pattern in milliseconds:

```typescript
const composer = haptic.compose().tap().pause(100).buzz(200);
console.log(composer.duration); // 310
```

## Standalone Usage

You can also use `PatternComposer` directly:

```typescript
import { PatternComposer, HapticEngine } from '@hapticjs/core';

const engine = HapticEngine.create();
const steps = new PatternComposer()
  .tap(0.5)
  .pause(100)
  .ramp(0.2, 1.0, 300)
  .build();

engine.play(steps);
```

## Complex Pattern Example

```typescript
// Notification pattern: attention pulse, then confirmation
await haptic.compose()
  .pulse(2, 40, 40, 0.5)     // Two attention pulses
  .pause(150)                  // Brief pause
  .ramp(0.3, 0.9, 200)        // Building confirmation
  .vibrate(50, 0.9)           // Strong final hit
  .play();
```

## Related

- [HPL Pattern Language](/guide/hpl) -- String-based patterns
- [Presets](/guide/presets) -- 55+ ready-made patterns
- [Physics Patterns](/guide/physics) -- Physics-based pattern generation
