# Emotion Presets

@hapticjs includes 12 emotion-based haptic patterns that convey feelings through vibration rhythms. Each pattern is carefully tuned to evoke a specific emotional response.

## Usage

```typescript
import { haptic, emotions } from '@hapticjs/core';

haptic.play(emotions.excited);
haptic.play(emotions.calm);
haptic.play(emotions.romantic);
```

Or access via the presets object:

```typescript
import { presets } from '@hapticjs/core';

haptic.play(presets.emotions.happy);
```

## All Emotions

| Emotion | Pattern Description |
|---------|---------------------|
| `excited` | Fast, energetic pulses building to a crescendo |
| `calm` | Slow, gentle wave with soft sustained vibrations |
| `tense` | Tight, irregular short heavy bursts |
| `happy` | Bouncy, playful ascending rhythm |
| `sad` | Slow, heavy, descending vibrations that fade |
| `angry` | Aggressive, chaotic rapid heavy hits |
| `surprised` | Sharp sudden hit, silence, then lighter hit |
| `anxious` | Fast irregular heartbeat with inconsistent spacing |
| `confident` | Strong, steady, measured even pulses |
| `playful` | Alternating light-heavy in bouncy rhythm |
| `romantic` | Gentle heartbeat rhythm, two soft pulses with long pauses |
| `peaceful` | Very subtle, barely-there ultra-light slow pulses |

## Example: Dynamic Emotion Feedback

```typescript
import { haptic, emotions } from '@hapticjs/core';

type Mood = keyof typeof emotions;

function reactToMood(mood: Mood) {
  haptic.play(emotions[mood]);
}

// In a mood-tracking app
reactToMood('happy');
reactToMood('calm');
```

## Combining with SensoryEngine

Pair emotion haptics with themed sound and visuals:

```typescript
import { SensoryEngine, emotions } from '@hapticjs/core';

const engine = SensoryEngine.create({ theme: 'nature' });

// Play emotion with multi-sensory feedback
await engine.play(emotions.peaceful);
```

::: info
Emotion presets are HPL-based pattern strings. You can pass them to `haptic.play()`, `engine.play()`, or any function that accepts pattern input.
:::

## Related

- [Presets](/guide/presets) -- All 55+ preset categories
- [Physics Patterns](/guide/physics) -- Physics-based haptics
- [Themes](/guide/themes) -- Multi-sensory theme system
