import type { HapticStep, EasingFunction } from '../types';

/**
 * Fluent builder for composing haptic patterns programmatically.
 *
 * Usage:
 *   const pattern = new PatternComposer()
 *     .tap(0.5)
 *     .pause(100)
 *     .ramp(0.2, 1.0, 300)
 *     .buzz(200)
 *     .build();
 */
export class PatternComposer {
  private steps: HapticStep[] = [];
  private _onPlay?: (steps: HapticStep[]) => Promise<void>;

  /** Register a play callback (used by HapticEngine) */
  onPlay(fn: (steps: HapticStep[]) => Promise<void>): this {
    this._onPlay = fn;
    return this;
  }

  /** Add a short tap vibration */
  tap(intensity = 0.6): this {
    this.steps.push({ type: 'vibrate', duration: 10, intensity });
    return this;
  }

  /** Add a vibration with specified duration and intensity */
  vibrate(duration: number, intensity = 1.0): this {
    this.steps.push({ type: 'vibrate', duration, intensity });
    return this;
  }

  /** Add a buzz (medium-length vibration) */
  buzz(duration = 100, intensity = 0.7): this {
    this.steps.push({ type: 'vibrate', duration, intensity });
    return this;
  }

  /** Add a pause */
  pause(duration = 50): this {
    this.steps.push({ type: 'pause', duration, intensity: 0 });
    return this;
  }

  /** Add an intensity ramp from start to end intensity over duration */
  ramp(
    startIntensity: number,
    endIntensity: number,
    duration: number,
    easing: EasingFunction = 'linear',
  ): this {
    const stepCount = Math.max(1, Math.floor(duration / 20));
    const stepDuration = duration / stepCount;

    for (let i = 0; i < stepCount; i++) {
      const t = i / (stepCount - 1 || 1);
      const easedT = applyEasing(t, easing);
      const intensity = startIntensity + (endIntensity - startIntensity) * easedT;
      this.steps.push({ type: 'vibrate', duration: stepDuration, intensity });
    }

    return this;
  }

  /** Add a pulse pattern (on-off-on-off) */
  pulse(count: number, onDuration = 50, offDuration = 50, intensity = 0.8): this {
    for (let i = 0; i < count; i++) {
      this.steps.push({ type: 'vibrate', duration: onDuration, intensity });
      if (i < count - 1) {
        this.steps.push({ type: 'pause', duration: offDuration, intensity: 0 });
      }
    }
    return this;
  }

  /** Repeat the entire current sequence N times */
  repeat(times: number): this {
    const original = [...this.steps];
    for (let i = 1; i < times; i++) {
      this.steps.push(...original.map((s) => ({ ...s })));
    }
    return this;
  }

  /** Build and return the step array */
  build(): HapticStep[] {
    return [...this.steps];
  }

  /** Build and immediately play the pattern */
  async play(): Promise<void> {
    if (this._onPlay) {
      await this._onPlay(this.steps);
    }
  }

  /** Reset the composer */
  clear(): this {
    this.steps = [];
    return this;
  }

  /** Get total duration in ms */
  get duration(): number {
    return this.steps.reduce((sum, s) => sum + s.duration, 0);
  }
}

function applyEasing(t: number, easing: EasingFunction): number {
  switch (easing) {
    case 'linear':
      return t;
    case 'ease-in':
      return t * t;
    case 'ease-out':
      return t * (2 - t);
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}
