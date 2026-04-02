import type { HapticStep, HapticPattern } from '../types/haptic-effect';

/** A single recorded tap event */
interface RecordedTap {
  /** Timestamp in ms relative to recording start */
  time: number;
  /** Intensity from 0.0 to 1.0 */
  intensity: number;
}

/** Callback invoked on each tap during recording */
type TapCallback = (tap: RecordedTap, index: number) => void;

/** Default tap duration in ms */
const DEFAULT_TAP_DURATION = 10;

/** Default grid size for quantization in ms */
const DEFAULT_GRID_MS = 50;

/** Default tap intensity */
const DEFAULT_INTENSITY = 0.6;

/**
 * Records tap rhythms and converts them to HPL pattern strings or HapticSteps.
 *
 * Usage:
 *   const recorder = new PatternRecorder();
 *   recorder.start();
 *   recorder.tap();        // user taps...
 *   recorder.tap(0.9);     // heavy tap
 *   recorder.stop();
 *   console.log(recorder.toHPL()); // '##..@@'
 */
export class PatternRecorder {
  private taps: RecordedTap[] = [];
  private recording = false;
  private startTime = 0;
  private stopTime = 0;
  private tapCallbacks: TapCallback[] = [];
  private nowFn: () => number;

  constructor(options?: { now?: () => number }) {
    this.nowFn = options?.now ?? (() => Date.now());
  }

  /** Whether the recorder is currently recording */
  get isRecording(): boolean {
    return this.recording;
  }

  /** Total duration of the recording in ms */
  get duration(): number {
    if (this.taps.length === 0) return 0;
    if (this.recording) {
      return this.nowFn() - this.startTime;
    }
    return this.stopTime - this.startTime;
  }

  /** Number of taps recorded */
  get tapCount(): number {
    return this.taps.length;
  }

  /** Begin recording. Records timestamps of tap events. */
  start(): void {
    this.taps = [];
    this.recording = true;
    this.startTime = this.nowFn();
    this.stopTime = 0;
  }

  /** Register a tap at current time. */
  tap(intensity: number = DEFAULT_INTENSITY): void {
    if (!this.recording) return;

    const now = this.nowFn();
    const time = now - this.startTime;
    const clamped = Math.max(0, Math.min(1, intensity));
    const recorded: RecordedTap = { time, intensity: clamped };

    this.taps.push(recorded);

    for (const cb of this.tapCallbacks) {
      cb(recorded, this.taps.length - 1);
    }
  }

  /** Stop recording, return the recorded taps. */
  stop(): RecordedTap[] {
    this.recording = false;
    this.stopTime = this.nowFn();
    return [...this.taps];
  }

  /** Register a callback for each tap (for visual feedback during recording). */
  onTap(callback: TapCallback): void {
    this.tapCallbacks.push(callback);
  }

  /** Reset the recorder. */
  clear(): void {
    this.taps = [];
    this.recording = false;
    this.startTime = 0;
    this.stopTime = 0;
  }

  /**
   * Snap taps to a grid for cleaner patterns.
   * @param gridMs Grid size in ms (default 50ms)
   */
  quantize(gridMs: number = DEFAULT_GRID_MS): void {
    this.taps = this.taps.map((tap) => ({
      ...tap,
      time: Math.round(tap.time / gridMs) * gridMs,
    }));
  }

  /**
   * Convert recorded taps to an HPL string.
   *
   * Maps gaps between taps to `.` characters (each 50ms),
   * and tap intensities to `~` (light), `#` (medium), `@` (heavy).
   */
  toHPL(): string {
    if (this.taps.length === 0) return '';

    const sorted = [...this.taps].sort((a, b) => a.time - b.time);
    let hpl = '';

    for (let i = 0; i < sorted.length; i++) {
      // Add gap pauses before this tap (skip for the first tap)
      if (i > 0) {
        const gap = sorted[i]!.time - sorted[i - 1]!.time;

        // Merge very short gaps (<25ms) as consecutive taps
        if (gap >= 25) {
          const pauses = Math.round(gap / DEFAULT_GRID_MS);
          hpl += '.'.repeat(pauses);
        }
      }

      // Map intensity to HPL character
      hpl += intensityToChar(sorted[i]!.intensity);
    }

    return hpl;
  }

  /** Convert recorded taps to HapticStep[]. */
  toSteps(): HapticStep[] {
    if (this.taps.length === 0) return [];

    const sorted = [...this.taps].sort((a, b) => a.time - b.time);
    const steps: HapticStep[] = [];

    for (let i = 0; i < sorted.length; i++) {
      // Add pause step for the gap before this tap
      if (i > 0) {
        const gap = sorted[i]!.time - sorted[i - 1]!.time;

        if (gap >= 25) {
          const quantized = Math.round(gap / DEFAULT_GRID_MS) * DEFAULT_GRID_MS;
          steps.push({ type: 'pause', duration: quantized, intensity: 0 });
        }
      }

      // Add vibrate step for the tap
      steps.push({
        type: 'vibrate',
        duration: DEFAULT_TAP_DURATION,
        intensity: sorted[i]!.intensity,
      });
    }

    return steps;
  }

  /** Convert recorded taps to a HapticPattern. */
  toPattern(name?: string): HapticPattern {
    return {
      name: name ?? 'recorded-pattern',
      steps: this.toSteps(),
    };
  }
}

/** Map intensity value to HPL character */
function intensityToChar(intensity: number): string {
  if (intensity < 0.35) return '~';
  if (intensity <= 0.7) return '#';
  return '@';
}
