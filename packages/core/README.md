# @hapticjs/core

Universal Haptics Engine for JavaScript & TypeScript.

```bash
npm install @hapticjs/core
```

## Quick Start

```typescript
import { haptic } from '@hapticjs/core';

// Semantic effects
haptic.tap();
haptic.success();
haptic.error();

// Haptic Pattern Language
haptic.play('~~..##..@@');

// Fluent composer
haptic.compose()
  .tap(0.5)
  .pause(100)
  .buzz(200)
  .play();
```

## Haptic Pattern Language (HPL)

| Char | Effect | Duration | Intensity |
|------|--------|----------|-----------|
| `~` | Light vibration | 50ms | 0.3 |
| `#` | Medium vibration | 50ms | 0.6 |
| `@` | Heavy vibration | 50ms | 1.0 |
| `.` | Pause | 50ms | - |
| `\|` | Sharp tap | 10ms | 1.0 |
| `-` | Sustain | 50ms | - |

Groups & repeats: `[~.]x3` repeats 3 times.

## 43 Built-in Presets

```typescript
import { presets } from '@hapticjs/core';

haptic.play(presets.gaming.explosion);
haptic.play(presets.ui.pullToRefresh);
haptic.play(presets.notifications.success);
```

Categories: UI (12), Notifications (7), Gaming (10), Accessibility (7), System (7).

## Pattern Sharing

```typescript
import { exportPattern, importPattern, patternToDataURL } from '@hapticjs/core';

const exported = exportPattern('~~..##', { name: 'My Pattern' });
const url = patternToDataURL('~~..##', { name: 'My Pattern' });
```

## License

MIT
