# Physics Patterns

Physics-based haptic patterns simulate real-world physical interactions. Each function generates a `HapticPattern` based on configurable physical parameters.

## Usage

```typescript
import { haptic, physics } from '@hapticjs/core';

haptic.play(physics.spring({ stiffness: 0.8, damping: 0.3 }));
haptic.play(physics.bounce({ height: 1.0, bounciness: 0.6 }));
```

You can also import individual functions:

```typescript
import { spring, bounce, friction, impact, gravity, elastic, wave, pendulum } from '@hapticjs/core';
```

## Spring

Bouncy oscillation that starts heavy and decays with configurable stiffness and damping.

```typescript
haptic.play(physics.spring({
  stiffness: 0.8,    // 0.5 - 1.0, higher = more oscillations
  damping: 0.3,      // 0.1 - 0.9, higher = faster decay
  duration: 500,     // Total duration in ms
}));
```

| Option | Type | Default | Range |
|--------|------|---------|-------|
| `stiffness` | `number` | 0.7 | 0.5 - 1.0 |
| `damping` | `number` | 0.3 | 0.1 - 0.9 |
| `duration` | `number` | 500 | ms |

## Bounce

Ball bouncing with decreasing height on each impact.

```typescript
haptic.play(physics.bounce({
  height: 1.0,       // 0.5 - 1.0, initial drop height
  bounciness: 0.6,   // 0.3 - 0.9, energy retained per bounce
  bounces: 5,        // Number of bounces
}));
```

| Option | Type | Default | Range |
|--------|------|---------|-------|
| `height` | `number` | 1.0 | 0.5 - 1.0 |
| `bounciness` | `number` | 0.6 | 0.3 - 0.9 |
| `bounces` | `number` | 5 | -- |

## Friction

Rough surface sliding sensation with irregular vibration.

```typescript
haptic.play(physics.friction({
  roughness: 0.7,    // 0.1 - 1.0, surface texture
  speed: 0.5,        // 0.1 - 1.0, sliding speed
  duration: 300,     // Total duration in ms
}));
```

| Option | Type | Default | Range |
|--------|------|---------|-------|
| `roughness` | `number` | 0.5 | 0.1 - 1.0 |
| `speed` | `number` | 0.5 | 0.1 - 1.0 |
| `duration` | `number` | 300 | ms |

## Impact

Collision with a surface -- sharp initial hit followed by decaying resonance.

```typescript
haptic.play(physics.impact({
  mass: 0.8,         // 0.1 - 1.0, object mass
  hardness: 0.9,     // 0.1 - 1.0, surface hardness
}));
```

| Option | Type | Default | Range |
|--------|------|---------|-------|
| `mass` | `number` | 0.5 | 0.1 - 1.0 |
| `hardness` | `number` | 0.7 | 0.1 - 1.0 |

## Gravity

Accelerating fall sensation with quadratically increasing intensity.

```typescript
haptic.play(physics.gravity({
  distance: 1.0,     // 0.3 - 1.0, fall distance
  duration: 400,     // Total duration in ms
}));
```

| Option | Type | Default | Range |
|--------|------|---------|-------|
| `distance` | `number` | 1.0 | 0.3 - 1.0 |
| `duration` | `number` | 400 | ms |

## Elastic

Rubber band stretch and snap-back.

```typescript
haptic.play(physics.elastic({
  stretch: 0.7,      // 0.3 - 1.0, how far the band stretches
  snapSpeed: 0.8,    // 0.3 - 1.0, how fast the snap-back is
}));
```

| Option | Type | Default | Range |
|--------|------|---------|-------|
| `stretch` | `number` | 0.7 | 0.3 - 1.0 |
| `snapSpeed` | `number` | 0.8 | 0.3 - 1.0 |

## Wave

Smooth sine-wave motion with configurable amplitude, frequency, and cycle count.

```typescript
haptic.play(physics.wave({
  amplitude: 0.7,    // 0.3 - 1.0, wave height
  frequency: 1.0,    // 0.5 - 2.0, wave speed
  cycles: 2,         // Number of full sine cycles
}));
```

| Option | Type | Default | Range |
|--------|------|---------|-------|
| `amplitude` | `number` | 0.7 | 0.3 - 1.0 |
| `frequency` | `number` | 1.0 | 0.5 - 2.0 |
| `cycles` | `number` | 2 | -- |

## Pendulum

Swinging motion where intensity peaks at the ends and is quiet in the middle. Energy decays per swing.

```typescript
haptic.play(physics.pendulum({
  energy: 0.8,       // 0.3 - 1.0, swing energy
  swings: 3,         // Number of swings
}));
```

| Option | Type | Default | Range |
|--------|------|---------|-------|
| `energy` | `number` | 0.8 | 0.3 - 1.0 |
| `swings` | `number` | 3 | -- |

## Return Type

All physics functions return a `HapticPattern` object:

```typescript
interface HapticPattern {
  name?: string;    // e.g. 'physics.spring'
  steps: HapticStep[];
  metadata?: Record<string, unknown>;
}
```

You can inspect or modify the steps before playing:

```typescript
const pattern = physics.spring({ stiffness: 0.9 });
console.log(pattern.steps.length); // Number of generated steps
haptic.play(pattern);
```

## Related

- [Presets](/guide/presets) -- Pre-built patterns
- [Composer API](/guide/composer) -- Manual pattern building
- [Emotions](/guide/emotions) -- Emotion-based patterns
