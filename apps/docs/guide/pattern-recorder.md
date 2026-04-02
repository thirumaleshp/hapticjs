# Pattern Recorder

`PatternRecorder` records tap rhythms in real time and converts them to HPL strings, `HapticStep[]` arrays, or `HapticPattern` objects.

## Basic Usage

```typescript
import { PatternRecorder, haptic } from '@hapticjs/core';

const recorder = new PatternRecorder();

// Start recording
recorder.start();

// Record taps (call in response to user input)
recorder.tap();          // Default intensity (0.6)
recorder.tap(0.9);       // Heavy tap
recorder.tap(0.2);       // Light tap

// Stop recording
recorder.stop();

// Convert to HPL
const hpl = recorder.toHPL();   // e.g. '##..@@..~'

// Play it back
haptic.play(hpl);
```

## Recording Taps

Call `tap()` each time the user taps. The recorder captures the timestamp and intensity.

```typescript
recorder.start();

// Wire up to user input
document.getElementById('tap-pad')?.addEventListener('pointerdown', (e) => {
  // Map pressure to intensity if available
  const intensity = e.pressure > 0 ? e.pressure : 0.6;
  recorder.tap(intensity);
});
```

Intensity values are clamped to 0.0 - 1.0. The default is 0.6.

## Output Formats

### HPL String

```typescript
const hpl = recorder.toHPL();
// Maps: < 0.35 intensity -> '~', 0.35-0.7 -> '#', > 0.7 -> '@'
// Gaps between taps become '.' characters (each 50ms)
```

### HapticStep Array

```typescript
const steps = recorder.toSteps();
// Returns HapticStep[] with vibrate and pause steps
```

### HapticPattern

```typescript
const pattern = recorder.toPattern('my-rhythm');
// Returns { name: 'my-rhythm', steps: HapticStep[] }

haptic.play(pattern);
```

## Quantization

Snap tap timestamps to a grid for cleaner patterns:

```typescript
recorder.stop();
recorder.quantize(50);   // Snap to 50ms grid
recorder.quantize(100);  // Snap to 100ms grid

const hpl = recorder.toHPL(); // Cleaner pattern
```

## Live Feedback

Register a callback to get notified on each tap during recording:

```typescript
recorder.onTap((tap, index) => {
  console.log(`Tap ${index}: time=${tap.time}ms, intensity=${tap.intensity}`);
  // Provide visual feedback during recording
  updateRecordingUI(tap);
});
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isRecording` | `boolean` | Whether currently recording |
| `duration` | `number` | Total recording duration in ms |
| `tapCount` | `number` | Number of taps recorded |

## Methods

| Method | Description |
|--------|-------------|
| `start()` | Begin recording |
| `tap(intensity?)` | Record a tap (default intensity: 0.6) |
| `stop()` | Stop recording, returns `RecordedTap[]` |
| `toHPL()` | Convert to HPL string |
| `toSteps()` | Convert to `HapticStep[]` |
| `toPattern(name?)` | Convert to `HapticPattern` |
| `quantize(gridMs?)` | Snap timestamps to grid (default: 50ms) |
| `onTap(callback)` | Register tap callback |
| `clear()` | Reset the recorder |

## Sharing Recorded Patterns

Combine with the pattern sharing API:

```typescript
import { PatternRecorder, exportPattern, patternToDataURL } from '@hapticjs/core';

const recorder = new PatternRecorder();
recorder.start();
// ... user taps ...
recorder.stop();

const hpl = recorder.toHPL();

// Export as JSON
const exported = exportPattern(hpl, {
  name: 'User Rhythm',
  author: 'Jane',
  tags: ['custom', 'recorded'],
});

// Share as data URL
const url = patternToDataURL(hpl, { name: 'User Rhythm' });
```

## Example: Record and Playback UI

```typescript
import { PatternRecorder, haptic } from '@hapticjs/core';

const recorder = new PatternRecorder();
let lastHPL = '';

const recordBtn = document.getElementById('record');
const playBtn = document.getElementById('play');
const tapBtn = document.getElementById('tap');

recordBtn?.addEventListener('click', () => {
  if (recorder.isRecording) {
    recorder.stop();
    recorder.quantize(50);
    lastHPL = recorder.toHPL();
    recordBtn.textContent = 'Record';
  } else {
    recorder.start();
    recordBtn.textContent = 'Stop';
  }
});

tapBtn?.addEventListener('pointerdown', () => {
  if (recorder.isRecording) {
    recorder.tap();
    haptic.tap(); // Immediate feedback while recording
  }
});

playBtn?.addEventListener('click', () => {
  if (lastHPL) {
    haptic.play(lastHPL);
  }
});
```

## Related

- [HPL Pattern Language](/guide/hpl) -- HPL syntax reference
- [Composer API](/guide/composer) -- Programmatic pattern building
- [A/B Testing](/guide/ab-testing) -- Test recorded patterns against each other
