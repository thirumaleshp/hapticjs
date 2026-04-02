# Rhythm Sync

`RhythmSync` synchronizes haptic feedback to a musical BPM. It provides beat detection via tap tempo, BPM control, and automatic haptic triggering on each beat.

## Basic Usage

```typescript
import { RhythmSync, HapticEngine } from '@hapticjs/core';

const rhythm = new RhythmSync({ bpm: 120, intensity: 0.7 });
const engine = HapticEngine.create();

// Auto-trigger haptic on each beat
rhythm.syncHaptic(engine, 'tap');

// Start the rhythm
rhythm.start();

// Stop when done
rhythm.stop();
```

## Options

```typescript
interface RhythmSyncOptions {
  bpm?: number;         // Beats per minute, 60-300 (default: 120)
  intensity?: number;   // Global intensity multiplier, 0-1 (default: 0.7)
  pattern?: string;     // HPL pattern string for each beat
}
```

## BPM Control

```typescript
const rhythm = new RhythmSync({ bpm: 120 });

// Change BPM at any time (clamped to 60-300)
rhythm.setBPM(140);

// Read current BPM
rhythm.bpm; // 140
```

## Tap Tempo

Detect BPM from user taps. Call `tapTempo()` repeatedly and it calculates the average BPM from the last 4-8 tap intervals.

```typescript
const rhythm = new RhythmSync();

// User taps a button in time with music
document.getElementById('tap-btn')?.addEventListener('click', () => {
  const estimatedBPM = rhythm.tapTempo();
  console.log(`BPM: ${estimatedBPM}`);
});
```

## Beat Callbacks

Register callbacks to execute on each beat:

```typescript
// Via start()
rhythm.start((beat) => {
  console.log(`Beat ${beat}`);
});

// Via onBeat()
rhythm.onBeat((beat) => {
  // Update UI on each beat
  updateVisualizer(beat);
});
```

## Syncing Haptics

Automatically trigger a haptic effect on each beat:

```typescript
// Default: calls engine.tap() on each beat
rhythm.syncHaptic(engine);

// Use a different semantic effect
rhythm.syncHaptic(engine, 'impact');
rhythm.syncHaptic(engine, 'selection');
```

The `syncHaptic` method calls the specified method on the engine with the configured intensity on each beat tick.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `bpm` | `number` | Current BPM |
| `isPlaying` | `boolean` | Whether the rhythm is active |
| `beatCount` | `number` | Total beats since start |
| `pattern` | `string` | Configured HPL pattern |

## Audio BPM Detection

Store an audio element reference for future sync capabilities:

```typescript
const audioEl = document.getElementById('music') as HTMLAudioElement;
rhythm.detectBPM(audioEl);
```

::: info
For reliable BPM detection, use `tapTempo()` to manually tap along with the audio. The `detectBPM()` method stores the audio element reference for future use.
:::

## Cleanup

```typescript
rhythm.dispose(); // Stops rhythm, clears callbacks and timestamps
```

## Example: Music Visualizer with Haptics

```typescript
import { RhythmSync, HapticEngine, SensoryEngine } from '@hapticjs/core';

const engine = SensoryEngine.create({ theme: 'gaming' });
const rhythm = new RhythmSync({ bpm: 128, intensity: 0.8 });

rhythm.syncHaptic(engine.haptic, 'tap');

rhythm.onBeat((beat) => {
  // Flash on every 4th beat (downbeat)
  if (beat % 4 === 1) {
    engine.visual.flash({ color: '#a855f7' });
    engine.sound.click({ pitch: 'low' });
  }
});

rhythm.start();
```

## Related

- [Semantic Effects](/guide/semantic-effects) -- Effects used with `syncHaptic`
- [Multi-Sensory](/guide/multi-sensory) -- Combining haptic, sound, and visual
- [Motion Detection](/guide/motion-detection) -- Physical gesture detection
