# Motion Detection

`MotionDetector` detects device motion events -- shake, tilt, rotation, and flip -- as input to trigger haptic feedback. It uses `DeviceMotionEvent` and `DeviceOrientationEvent` when available and handles SSR gracefully.

## Setup

```typescript
import { MotionDetector, HapticEngine } from '@hapticjs/core';

const motion = new MotionDetector({
  shakeThreshold: 15,    // Acceleration magnitude threshold (default: 15)
  tiltThreshold: 10,     // Tilt angle change in degrees (default: 10)
});

const engine = HapticEngine.create();
```

## Requesting Permission

On iOS 13+, motion events require explicit user permission:

```typescript
const granted = await motion.requestPermission();
if (granted) {
  motion.start();
}
```

::: warning
`requestPermission()` must be called from a user gesture (e.g., button click) on iOS. Calling it on page load will be rejected by the browser.
:::

## Shake Detection

```typescript
motion.onShake((intensity) => {
  // intensity is 0-1 based on acceleration magnitude
  engine.impact('heavy');
  console.log(`Shake intensity: ${intensity}`);
});

motion.start();
```

## Tilt Detection

```typescript
motion.onTilt((direction) => {
  // direction.x: -1 to 1 (left/right tilt)
  // direction.y: -1 to 1 (forward/back tilt)
  engine.selection();
  console.log(`Tilt: x=${direction.x}, y=${direction.y}`);
});
```

## Rotation Detection

```typescript
motion.onRotation((angle) => {
  // angle in degrees (0-360, from DeviceOrientationEvent.alpha)
  engine.tap(0.3);
});
```

## Flip Detection

Detects when the device is flipped face-down or face-up:

```typescript
motion.onFlip(() => {
  engine.toggle(true);
  console.log('Device flipped!');
});
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isSupported` | `boolean` | Whether DeviceMotion API is available |
| `isListening` | `boolean` | Whether currently listening for events |

## Options

```typescript
interface MotionDetectorOptions {
  shakeThreshold?: number;   // default: 15
  tiltThreshold?: number;    // default: 10
}
```

The shake threshold is the acceleration magnitude (in m/s^2 minus gravity) that triggers a shake event. The tilt threshold is the minimum angle change in degrees.

## Lifecycle

```typescript
// Start listening
motion.start();

// Stop listening (preserves callbacks)
motion.stop();

// Full cleanup (stop + clear callbacks)
motion.dispose();
```

## Example: Shake to Undo

```typescript
import { MotionDetector, HapticEngine } from '@hapticjs/core';

const motion = new MotionDetector({ shakeThreshold: 20 });
const engine = HapticEngine.create();

motion.onShake((intensity) => {
  if (intensity > 0.5) {
    engine.warning();
    showUndoDialog();
  }
});

// Request permission (must be called from user gesture on iOS)
document.getElementById('enable-motion')?.addEventListener('click', async () => {
  const granted = await motion.requestPermission();
  if (granted) {
    motion.start();
  }
});
```

## Related

- [Semantic Effects](/guide/semantic-effects) -- Effects to trigger on motion
- [Rhythm Sync](/guide/rhythm-sync) -- Beat-synced haptics
- [Accessibility](/guide/accessibility) -- Motion sensitivity considerations
