/** Scheduling utilities for timed haptic playback */

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeIntensity(intensity: number): number {
  return clamp(intensity, 0, 1);
}
