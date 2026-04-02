# Presets

@hapticjs ships with 55+ built-in preset patterns organized into 6 categories. All presets are tree-shakeable -- import only the categories you need.

## Using Presets

```typescript
import { haptic, presets, emotions } from '@hapticjs/core';

// Play any preset via the presets object
haptic.play(presets.ui.tap);
haptic.play(presets.gaming.explosion);
haptic.play(presets.notifications.success);

// Emotions are available at the top level too
haptic.play(emotions.excited);
```

## UI Presets (12)

Common interface interactions:

```typescript
import { presets } from '@hapticjs/core';

haptic.play(presets.ui.tap);
haptic.play(presets.ui.doubleTap);
haptic.play(presets.ui.longPress);
haptic.play(presets.ui.toggleOn);
haptic.play(presets.ui.toggleOff);
haptic.play(presets.ui.sliderSnap);
haptic.play(presets.ui.selection);
haptic.play(presets.ui.pullToRefresh);
haptic.play(presets.ui.swipe);
haptic.play(presets.ui.contextMenu);
haptic.play(presets.ui.dragStart);
haptic.play(presets.ui.drop);
```

| Preset | Description |
|--------|-------------|
| `tap` | Quick single tap |
| `doubleTap` | Two quick taps |
| `longPress` | Sustained press |
| `toggleOn` | Toggle switch on |
| `toggleOff` | Toggle switch off |
| `sliderSnap` | Slider snapping to position |
| `selection` | Subtle selection tick |
| `pullToRefresh` | Building then release |
| `swipe` | Quick swipe gesture |
| `contextMenu` | Long-press context menu |
| `dragStart` | Beginning a drag |
| `drop` | Dropping a dragged item |

## Notification Presets (7)

Alerts and notification feedback:

```typescript
import { presets } from '@hapticjs/core';

haptic.play(presets.notifications.success);
haptic.play(presets.notifications.warning);
haptic.play(presets.notifications.error);
haptic.play(presets.notifications.info);
haptic.play(presets.notifications.messageReceived);
haptic.play(presets.notifications.alarm);
haptic.play(presets.notifications.reminder);
```

## Gaming Presets (10)

Game-specific feedback patterns:

```typescript
import { presets } from '@hapticjs/core';

haptic.play(presets.gaming.explosion);
haptic.play(presets.gaming.collision);
haptic.play(presets.gaming.heartbeat);
haptic.play(presets.gaming.gunshot);
haptic.play(presets.gaming.swordClash);
haptic.play(presets.gaming.powerUp);
haptic.play(presets.gaming.damage);
haptic.play(presets.gaming.pickup);
haptic.play(presets.gaming.levelComplete);
haptic.play(presets.gaming.engineRumble);
```

## Accessibility Presets (7)

Haptic cues for assistive interactions:

```typescript
import { presets } from '@hapticjs/core';

haptic.play(presets.accessibility.confirm);
haptic.play(presets.accessibility.deny);
haptic.play(presets.accessibility.boundary);
haptic.play(presets.accessibility.focusChange);
haptic.play(presets.accessibility.countTick);
haptic.play(presets.accessibility.landmark);
haptic.play(presets.accessibility.progressCheckpoint);
```

## System Presets (7)

OS-level interaction patterns:

```typescript
import { presets } from '@hapticjs/core';

haptic.play(presets.system.keyPress);
haptic.play(presets.system.scrollTick);
haptic.play(presets.system.scrollBounce);
haptic.play(presets.system.delete);
haptic.play(presets.system.undo);
haptic.play(presets.system.copy);
haptic.play(presets.system.paste);
```

## Emotion Presets (12)

See the dedicated [Emotions guide](/guide/emotions) for details.

```typescript
import { emotions } from '@hapticjs/core';

haptic.play(emotions.excited);
haptic.play(emotions.calm);
haptic.play(emotions.happy);
```

::: tip Tree-Shaking
Import specific categories to keep your bundle small:

```typescript
// Only imports UI presets
import { ui } from '@hapticjs/core';
haptic.play(ui.tap);
```
:::

## Related

- [Emotions](/guide/emotions) -- Detailed emotion preset guide
- [HPL Pattern Language](/guide/hpl) -- Write your own patterns
- [Physics Patterns](/guide/physics) -- Physics-simulated haptics
