# Multi-Sensory Feedback

The `SensoryEngine` combines haptic, sound, and visual feedback into a single unified API. One method call triggers all three channels simultaneously, themed to match.

## Setup

```typescript
import { SensoryEngine } from '@hapticjs/core';

const engine = SensoryEngine.create({
  theme: 'gaming',
  sound: { volume: 0.5 },
  visual: { target: document.getElementById('app') },
});
```

### Options

```typescript
interface SensoryEngineOptions {
  haptic?: Partial<HapticConfig>;
  sound?: { enabled?: boolean; volume?: number; muted?: boolean };
  visual?: { enabled?: boolean; target?: HTMLElement; intensity?: number };
  theme?: string | ThemePreset;
}
```

## Semantic Methods

Each method triggers haptic + sound + visual feedback together:

```typescript
await engine.tap();        // Vibrate + click sound + pulse visual
await engine.success();    // Vibrate + ascending chime + green glow
await engine.error();      // Vibrate + buzzer sound + red flash
await engine.warning();    // Vibrate + chime + yellow flash
await engine.selection();  // Vibrate + tick sound + subtle pulse
await engine.toggle(true); // Vibrate + toggle sound + scale pulse
```

## Playing Patterns

```typescript
// HPL string -- haptic plays the pattern, sound/visual auto-mapped from theme
await engine.play('~~..##..@@');
```

## Switching Themes

```typescript
engine.setTheme('luxury');    // Gold glow, soft sounds, moderate haptics
engine.setTheme('minimal');   // No sound, subtle pulse, light haptics
engine.setTheme('gaming');    // Shake effects, loud sounds, max haptics
```

Theme changes update all three engines (haptic intensity, sound volume/mute, visual style) automatically.

## Accessing Individual Engines

```typescript
// Direct access to sub-engines
engine.haptic.play('@@--');
engine.sound.click();
engine.visual.shake();
engine.themes.listThemes();
```

| Accessor | Type | Description |
|----------|------|-------------|
| `engine.haptic` | `HapticEngine` | The underlying haptic engine |
| `engine.sound` | `SoundEngine` | Procedural sound engine |
| `engine.visual` | `VisualEngine` | CSS visual effects engine |
| `engine.themes` | `ThemeManager` | Theme management |

## Sound Engine

Procedurally generated UI sounds via Web Audio API -- no audio files needed.

```typescript
import { SoundEngine } from '@hapticjs/core';

const sound = new SoundEngine({ volume: 0.5 });

await sound.click();                   // Short click
await sound.click({ pitch: 'high' }); // High-pitched click
await sound.tick();                    // Ultra-short tick
await sound.pop();                     // Bubbly pop
await sound.whoosh();                  // Swipe sound
await sound.chime('C5');               // Musical chime
await sound.success();                 // Ascending two-tone
await sound.error();                   // Descending buzzer
await sound.tap();                     // Subtle tap
await sound.toggle(true);             // Ascending/descending
await sound.playTone(440, 100);        // Custom: 440Hz for 100ms

sound.setVolume(0.3);
sound.mute();
sound.unmute();
sound.dispose();
```

## Visual Engine

CSS-based visual feedback that works on desktop and iOS where vibration is unavailable.

```typescript
import { VisualEngine } from '@hapticjs/core';

const visual = new VisualEngine({ target: document.getElementById('app') });

visual.flash();
visual.flash({ color: 'red', opacity: 0.2 });
visual.shake();
visual.shake({ intensity: 5, duration: 300 });
visual.pulse();
visual.ripple(x, y);
visual.ripple(x, y, { color: 'blue', size: 150 });
visual.glow();
visual.glow({ color: 'gold', size: 20 });
visual.bounce();
visual.jello();
visual.rubber();
visual.highlight({ color: 'yellow' });

visual.setTarget(otherElement);
visual.dispose();
```

## Reconfiguring at Runtime

```typescript
engine.configure({
  haptic: { intensity: 0.5 },
  sound: { volume: 0.2 },
  theme: 'minimal',
});
```

## Cleanup

```typescript
engine.dispose(); // Releases haptic adapter, AudioContext, and CSS animations
```

## Related

- [Themes](/guide/themes) -- 8 built-in themes and custom themes
- [Semantic Effects](/guide/semantic-effects) -- Effect reference
- [Accessibility](/guide/accessibility) -- The `accessible` theme
