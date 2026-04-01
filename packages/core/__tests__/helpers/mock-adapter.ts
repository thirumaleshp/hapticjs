import type { HapticAdapter, AdapterCapabilities, HapticStep } from '../../src/types';

/** Mock adapter that records all haptic calls for test assertions */
export class MockAdapter implements HapticAdapter {
  readonly name = 'mock';
  readonly supported = true;

  history: HapticStep[] = [];
  pulseHistory: Array<{ intensity: number; duration: number }> = [];
  cancelCount = 0;
  disposed = false;

  private _capabilities: AdapterCapabilities;

  constructor(capabilities?: Partial<AdapterCapabilities>) {
    this._capabilities = {
      maxIntensityLevels: 100,
      minDuration: 1,
      maxDuration: 10000,
      supportsPattern: true,
      supportsIntensity: true,
      dualMotor: false,
      ...capabilities,
    };
  }

  capabilities(): AdapterCapabilities {
    return this._capabilities;
  }

  async pulse(intensity: number, duration: number): Promise<void> {
    this.pulseHistory.push({ intensity, duration });
  }

  async playSequence(steps: HapticStep[]): Promise<void> {
    this.history.push(...steps);
  }

  cancel(): void {
    this.cancelCount++;
  }

  dispose(): void {
    this.disposed = true;
  }

  reset(): void {
    this.history = [];
    this.pulseHistory = [];
    this.cancelCount = 0;
    this.disposed = false;
  }
}
