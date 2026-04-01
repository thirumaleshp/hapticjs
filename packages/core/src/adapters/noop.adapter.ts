import type { HapticAdapter, AdapterCapabilities, HapticStep } from '../types';

/**
 * No-op adapter — used in SSR, Node, or when no haptic hardware is available.
 * Silently accepts all calls without doing anything.
 */
export class NoopAdapter implements HapticAdapter {
  readonly name = 'noop';
  readonly supported = false;

  capabilities(): AdapterCapabilities {
    return {
      maxIntensityLevels: 0,
      minDuration: 0,
      maxDuration: 0,
      supportsPattern: false,
      supportsIntensity: false,
      dualMotor: false,
    };
  }

  async pulse(_intensity: number, _duration: number): Promise<void> {
    // No-op
  }

  async playSequence(_steps: HapticStep[]): Promise<void> {
    // No-op
  }

  cancel(): void {
    // No-op
  }

  dispose(): void {
    // No-op
  }
}
