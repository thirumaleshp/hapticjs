# Themes

The theme system configures haptic intensity, sound, and visual feedback as a unified preset. Themes ensure consistent multi-sensory feedback across your app.

## Built-in Themes

| Theme | Haptic | Sound | Visual | Style |
|-------|--------|-------|--------|-------|
| `default` | 0.7 | On (0.3) | On | Flash |
| `gaming` | 1.0 | On (0.8) | On | Shake |
| `minimal` | 0.4 | Off | On | Pulse |
| `luxury` | 0.6 | On (0.25) | On | Glow |
| `retro` | 0.9 | On (0.5) | On | Flash |
| `nature` | 0.5 | On (0.2) | On | Pulse |
| `silent` | 0.7 | Off | Off | -- |
| `accessible` | 1.0 | On (0.6) | On | Flash |

## Using ThemeManager

```typescript
import { ThemeManager, themes } from '@hapticjs/core';

const tm = new ThemeManager();

// Apply a built-in theme
tm.setTheme('gaming');

// Read current theme
const theme = tm.getTheme();
console.log(theme.hapticIntensity); // 1.0
console.log(theme.soundEnabled);    // true
console.log(theme.soundVolume);     // 0.8
console.log(theme.visualStyle);     // 'shake'
console.log(theme.colors.primary);  // '#a855f7'

// Current theme name
tm.current;         // 'gaming'

// List all available themes
tm.listThemes();    // ['default', 'gaming', 'minimal', ...]
```

## Custom Themes

Register a custom `ThemePreset`:

```typescript
import { ThemeManager } from '@hapticjs/core';
import type { ThemePreset } from '@hapticjs/core';

const tm = new ThemeManager();

const myTheme: ThemePreset = {
  name: 'neon',
  hapticIntensity: 0.8,
  soundEnabled: true,
  soundVolume: 0.4,
  visualEnabled: true,
  visualStyle: 'ripple',
  colors: {
    primary: '#ff6bff',
    success: '#39ff14',
    error: '#ff073a',
    warning: '#ffbe0b',
  },
};

tm.registerTheme(myTheme);
tm.setTheme('neon');
```

### ThemePreset Interface

```typescript
interface ThemePreset {
  name: string;
  hapticIntensity: number;        // 0.0 - 1.0
  soundEnabled: boolean;
  soundVolume: number;            // 0.0 - 1.0
  visualEnabled: boolean;
  visualStyle: 'flash' | 'ripple' | 'shake' | 'glow' | 'pulse';
  colors: {
    primary: string;
    success: string;
    error: string;
    warning: string;
  };
}
```

## Themes with SensoryEngine

Themes are most powerful when combined with the [SensoryEngine](/guide/multi-sensory):

```typescript
import { SensoryEngine } from '@hapticjs/core';

const engine = SensoryEngine.create({ theme: 'gaming' });

// All effects use gaming theme settings automatically
await engine.tap();       // Strong haptic + loud click + shake
await engine.success();   // Strong haptic + chime + neon green glow

// Switch themes dynamically
engine.setTheme('luxury');
await engine.tap();       // Moderate haptic + soft click + gold glow
```

## Visual Styles

Each theme specifies a `visualStyle` that determines the CSS effect:

| Style | Effect |
|-------|--------|
| `flash` | Quick screen color flash |
| `ripple` | Material Design ripple at center |
| `shake` | CSS shake animation |
| `glow` | Box shadow glow effect |
| `pulse` | Scale pulse animation |

## Related

- [Multi-Sensory Feedback](/guide/multi-sensory) -- Full SensoryEngine guide
- [Presets](/guide/presets) -- 55+ pattern presets
- [Accessibility](/guide/accessibility) -- The `accessible` theme
