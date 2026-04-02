import type { HapticStep } from '../types';

/** A middleware that intercepts and transforms haptic patterns before playback */
export type HapticMiddleware = {
  name: string;
  process: (steps: HapticStep[]) => HapticStep[];
};

/**
 * Manages a pipeline of middleware that transform haptic patterns.
 *
 * Usage:
 *   const manager = new MiddlewareManager();
 *   manager.use(intensityScaler(0.5));
 *   manager.use(durationScaler(2));
 *   const transformed = manager.process(steps);
 */
export class MiddlewareManager {
  private middleware: HapticMiddleware[] = [];

  /** Register a middleware */
  use(middleware: HapticMiddleware): void {
    this.middleware.push(middleware);
  }

  /** Remove a middleware by name */
  remove(name: string): void {
    this.middleware = this.middleware.filter((m) => m.name !== name);
  }

  /** Run all middleware in order */
  process(steps: HapticStep[]): HapticStep[] {
    let result = steps;
    for (const m of this.middleware) {
      result = m.process(result);
    }
    return result;
  }

  /** Remove all middleware */
  clear(): void {
    this.middleware = [];
  }

  /** List registered middleware names */
  list(): string[] {
    return this.middleware.map((m) => m.name);
  }
}

// ─── Built-in middleware factories ─────────────────────────

/** Multiplies all intensities by a scale factor, clamped to 0-1 */
export function intensityScaler(scale: number): HapticMiddleware {
  return {
    name: 'intensityScaler',
    process: (steps) =>
      steps.map((s) => ({
        ...s,
        intensity: Math.min(1, Math.max(0, s.intensity * scale)),
      })),
  };
}

/** Multiplies all durations by a scale factor, enforces minimum 20ms */
export function durationScaler(scale: number): HapticMiddleware {
  return {
    name: 'durationScaler',
    process: (steps) =>
      steps.map((s) => ({
        ...s,
        duration: Math.max(20, Math.round(s.duration * scale)),
      })),
  };
}

/** Clamps all intensities to [min, max] */
export function intensityClamper(min: number, max: number): HapticMiddleware {
  return {
    name: 'intensityClamper',
    process: (steps) =>
      steps.map((s) => ({
        ...s,
        intensity: Math.min(max, Math.max(min, s.intensity)),
      })),
  };
}

/** Repeats the entire pattern N times */
export function patternRepeater(times: number): HapticMiddleware {
  return {
    name: 'patternRepeater',
    process: (steps) => {
      const result: HapticStep[] = [];
      for (let i = 0; i < times; i++) {
        result.push(...steps.map((s) => ({ ...s })));
      }
      return result;
    },
  };
}

/** Reverses the step order */
export function reverser(): HapticMiddleware {
  return {
    name: 'reverser',
    process: (steps) => [...steps].reverse(),
  };
}

/** Increases all intensities by 30% and durations by 20% for accessibility */
export function accessibilityBooster(): HapticMiddleware {
  return {
    name: 'accessibilityBooster',
    process: (steps) =>
      steps.map((s) => ({
        ...s,
        intensity: Math.min(1, s.intensity * 1.3),
        duration: Math.max(20, Math.round(s.duration * 1.2)),
      })),
  };
}
