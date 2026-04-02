import type { HapticAdapter, AdapterCapabilities, HapticStep } from '../types';

/**
 * Web Vibration API adapter.
 * Uses navigator.vibrate() — supported on Android browsers.
 * Android Vibration API is on/off only — no intensity control.
 * We ignore intensity and just vibrate for the requested duration.
 */
export class WebVibrationAdapter implements HapticAdapter {
  readonly name = 'web-vibration';
  readonly supported: boolean;

  constructor() {
    this.supported =
      typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  capabilities(): AdapterCapabilities {
    return {
      maxIntensityLevels: 1,
      minDuration: 20,
      maxDuration: 10000,
      supportsPattern: true,
      supportsIntensity: false,
      dualMotor: false,
    };
  }

  async pulse(_intensity: number, duration: number): Promise<void> {
    if (!this.supported) return;
    navigator.vibrate(Math.max(duration, 20));
  }

  async playSequence(steps: HapticStep[]): Promise<void> {
    if (!this.supported || steps.length === 0) return;

    // Build native vibration pattern: [vibrate, pause, vibrate, pause, ...]
    // Merge consecutive vibrate steps and enforce minimum durations
    const pattern: number[] = [];
    let lastType: 'vibrate' | 'pause' | null = null;

    for (const step of steps) {
      if (step.type === 'vibrate' && step.intensity > 0.05) {
        const dur = Math.max(step.duration, 20);
        if (lastType === 'vibrate') {
          // Merge consecutive vibrations
          pattern[pattern.length - 1]! += dur;
        } else {
          pattern.push(dur);
        }
        lastType = 'vibrate';
      } else {
        const dur = Math.max(step.duration, 10);
        if (lastType === 'pause') {
          pattern[pattern.length - 1]! += dur;
        } else {
          pattern.push(dur);
        }
        lastType = 'pause';
      }
    }

    if (pattern.length > 0) {
      // If pattern starts with a pause, the first value is a wait
      // navigator.vibrate expects [vibrate, pause, vibrate, pause, ...]
      // If first step was a pause, prepend a 0ms vibrate
      if (steps[0]?.type === 'pause' || (steps[0]?.type === 'vibrate' && steps[0]?.intensity <= 0.05)) {
        pattern.unshift(0);
      }

      navigator.vibrate(pattern);
    }
  }

  cancel(): void {
    if (this.supported) {
      navigator.vibrate(0);
    }
  }

  dispose(): void {
    this.cancel();
  }
}
