# Semantic Effects

Semantic effects map to common user interactions. They produce platform-appropriate haptic feedback with a single method call.

## Available Effects

```typescript
import { haptic } from '@hapticjs/core';

// Touch feedback
haptic.tap();               // Light tap (30ms, 0.6 intensity)
haptic.doubleTap();          // Two quick taps
haptic.longPress();          // Sustained press (50ms, 0.8 intensity)

// Notifications
haptic.success();            // Two-step ascending: light then strong
haptic.warning();            // Three even pulses
haptic.error();              // Two heavy pulses

// Selection
haptic.selection();          // Subtle tick (25ms, 0.5 intensity)
haptic.toggle(true);         // On: slightly stronger, Off: lighter
haptic.toggle(false);

// Impact styles (matches iOS UIImpactFeedbackGenerator)
haptic.impact('light');      // 25ms, 0.4 intensity
haptic.impact('medium');     // 35ms, 0.7 intensity
haptic.impact('heavy');      // 50ms, 1.0 intensity
haptic.impact('rigid');      // 30ms, 0.9 intensity
haptic.impact('soft');       // 35ms, 0.5 intensity
```

## Customizing Intensity

Most semantic effects accept an intensity parameter:

```typescript
haptic.tap(0.3);             // Light tap
haptic.tap(0.9);             // Heavy tap
haptic.longPress(0.5);       // Gentle press
```

## Parametric Vibration

For precise control, use `vibrate()`:

```typescript
// Vibrate for 200ms at 80% intensity
haptic.vibrate(200, 0.8);

// Quick burst at full intensity
haptic.vibrate(50, 1.0);
```

## Impact Styles

The `impact()` method mirrors iOS `UIImpactFeedbackGenerator` styles:

| Style | Duration | Intensity | Best For |
|-------|----------|-----------|----------|
| `light` | 25ms | 0.4 | Subtle UI taps |
| `medium` | 35ms | 0.7 | Standard buttons |
| `heavy` | 50ms | 1.0 | Significant actions |
| `rigid` | 30ms | 0.9 | Stiff mechanical feel |
| `soft` | 35ms | 0.5 | Cushioned, organic feel |

```typescript
import type { ImpactStyle } from '@hapticjs/core';

const style: ImpactStyle = 'heavy';
haptic.impact(style);
```

## Checking Support

```typescript
// Does the current device support haptics?
haptic.isSupported;   // boolean

// Which adapter is active?
haptic.adapterName;   // 'web-vibration' | 'ios-audio' | 'noop' | etc.
```

## Cancellation and Cleanup

```typescript
// Cancel any ongoing haptic effect
haptic.cancel();

// Release resources (call on unmount/cleanup)
haptic.dispose();
```

::: tip
All semantic methods return `Promise<void>`, so you can `await` them if needed. However, in most cases you do not need to wait for completion.
:::

## Related

- [Presets](/guide/presets) -- 55+ pre-built patterns organized by category
- [HPL Pattern Language](/guide/hpl) -- Describe custom patterns as strings
- [Composer API](/guide/composer) -- Build patterns programmatically
