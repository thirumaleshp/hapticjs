# Middleware

The middleware system lets you intercept and transform haptic patterns before they are played. Middleware functions run in a pipeline, each receiving the output of the previous one.

## MiddlewareManager

```typescript
import { MiddlewareManager, intensityScaler, durationScaler } from '@hapticjs/core';

const manager = new MiddlewareManager();

// Register middleware
manager.use(intensityScaler(0.5));
manager.use(durationScaler(1.5));

// Process steps through the pipeline
const transformed = manager.process(steps);
```

### Methods

| Method | Description |
|--------|-------------|
| `use(middleware)` | Register a middleware |
| `remove(name)` | Remove a middleware by name |
| `process(steps)` | Run all middleware in order, return transformed steps |
| `clear()` | Remove all middleware |
| `list()` | List registered middleware names |

## Built-in Middleware

### `intensityScaler(scale)`

Multiplies all step intensities by a scale factor, clamped to 0-1.

```typescript
import { intensityScaler } from '@hapticjs/core';

// Halve all intensities
manager.use(intensityScaler(0.5));

// Double all intensities (clamped to 1.0 max)
manager.use(intensityScaler(2.0));
```

### `durationScaler(scale)`

Multiplies all step durations by a scale factor. Enforces a minimum of 20ms.

```typescript
import { durationScaler } from '@hapticjs/core';

// Slow everything down by 50%
manager.use(durationScaler(1.5));

// Speed everything up
manager.use(durationScaler(0.5));
```

### `intensityClamper(min, max)`

Clamps all step intensities to a `[min, max]` range.

```typescript
import { intensityClamper } from '@hapticjs/core';

// Keep intensities between 0.2 and 0.8
manager.use(intensityClamper(0.2, 0.8));
```

### `patternRepeater(times)`

Repeats the entire step sequence N times.

```typescript
import { patternRepeater } from '@hapticjs/core';

// Play the pattern 3 times in a row
manager.use(patternRepeater(3));
```

### `reverser()`

Reverses the step order.

```typescript
import { reverser } from '@hapticjs/core';

manager.use(reverser());
```

### `accessibilityBooster()`

Increases all intensities by 30% and durations by 20% for accessibility. Useful for users who need stronger, longer haptic feedback.

```typescript
import { accessibilityBooster } from '@hapticjs/core';

manager.use(accessibilityBooster());
```

## Custom Middleware

A middleware is an object with a `name` and a `process` function:

```typescript
import type { HapticMiddleware, HapticStep } from '@hapticjs/core';

const myMiddleware: HapticMiddleware = {
  name: 'my-custom-middleware',
  process: (steps: HapticStep[]): HapticStep[] => {
    return steps.map(s => ({
      ...s,
      // Double the duration of vibrate steps only
      duration: s.type === 'vibrate' ? s.duration * 2 : s.duration,
    }));
  },
};

manager.use(myMiddleware);
```

### HapticMiddleware Interface

```typescript
type HapticMiddleware = {
  name: string;
  process: (steps: HapticStep[]) => HapticStep[];
};
```

## Pipeline Order

Middleware runs in the order it is registered. Earlier middleware output feeds into later middleware:

```typescript
manager.use(intensityScaler(0.5));   // First: halve intensity
manager.use(intensityClamper(0.1, 0.8)); // Then: clamp result
manager.use(patternRepeater(2));     // Finally: repeat the clamped pattern
```

::: warning
Order matters. Placing `reverser()` before `patternRepeater()` produces a different result than the opposite order.
:::

## Related

- [Intensity Profiles](/guide/profiles) -- User preference profiles that generate middleware
- [Accessibility](/guide/accessibility) -- The `accessibilityBooster` middleware
- [API Reference](/api/core) -- Full HapticEngine API
