import type { HapticAdapter, AdapterCapabilities, HapticStep } from '../types';
import { delay } from '../utils/scheduling';

/**
 * Web Vibration API adapter.
 * Uses navigator.vibrate() — supported on Android browsers.
 * Intensity is simulated via PWM (rapid on/off) since the API only supports on/off.
 */
export class WebVibrationAdapter implements HapticAdapter {
  readonly name = 'web-vibration';
  readonly supported: boolean;

  private _cancelled = false;

  constructor() {
    this.supported =
      typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  capabilities(): AdapterCapabilities {
    return {
      maxIntensityLevels: 1, // on/off only
      minDuration: 10,
      maxDuration: 10000,
      supportsPattern: true,
      supportsIntensity: false,
      dualMotor: false,
    };
  }

  async pulse(_intensity: number, duration: number): Promise<void> {
    if (!this.supported) return;
    navigator.vibrate(duration);
  }

  async playSequence(steps: HapticStep[]): Promise<void> {
    if (!this.supported || steps.length === 0) return;

    this._cancelled = false;

    // Convert to Vibration API pattern: [vibrate, pause, vibrate, pause, ...]
    const pattern = this._toVibrationPattern(steps);

    // If it's a simple pattern, use native pattern support
    if (this._canUseNativePattern(steps)) {
      navigator.vibrate(pattern);
      return;
    }

    // For complex patterns (intensity variation), play step by step
    for (const step of steps) {
      if (this._cancelled) break;

      if (step.type === 'vibrate') {
        if (step.intensity > 0.1) {
          // Simulate intensity via PWM for lower intensities
          if (step.intensity < 0.5) {
            await this._pwmVibrate(step.duration, step.intensity);
          } else {
            navigator.vibrate(step.duration);
            await delay(step.duration);
          }
        } else {
          await delay(step.duration);
        }
      } else {
        await delay(step.duration);
      }
    }
  }

  cancel(): void {
    this._cancelled = true;
    if (this.supported) {
      navigator.vibrate(0);
    }
  }

  dispose(): void {
    this.cancel();
  }

  /** Convert steps to Vibration API pattern array */
  private _toVibrationPattern(steps: HapticStep[]): number[] {
    const pattern: number[] = [];
    for (const step of steps) {
      pattern.push(step.duration);
    }
    return pattern;
  }

  /** Check if all steps can be played with native pattern (no intensity variation) */
  private _canUseNativePattern(steps: HapticStep[]): boolean {
    return steps.every(
      (s) =>
        (s.type === 'pause') ||
        (s.type === 'vibrate' && s.intensity >= 0.5)
    );
  }

  /** Simulate lower intensity via pulse-width modulation */
  private async _pwmVibrate(duration: number, intensity: number): Promise<void> {
    const cycleTime = 20; // ms per PWM cycle
    const onTime = Math.round(cycleTime * intensity);
    const offTime = cycleTime - onTime;
    const cycles = Math.floor(duration / cycleTime);

    const pattern: number[] = [];
    for (let i = 0; i < cycles; i++) {
      pattern.push(onTime, offTime);
    }

    if (pattern.length > 0) {
      navigator.vibrate(pattern);
      await delay(duration);
    }
  }
}
