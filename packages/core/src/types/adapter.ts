import type { HapticStep } from './haptic-effect';

/** Capabilities a haptic adapter supports */
export interface AdapterCapabilities {
  /** Number of discrete intensity levels (1 = on/off only, 100+ = fine-grained) */
  maxIntensityLevels: number;
  /** Minimum pulse duration in ms */
  minDuration: number;
  /** Maximum continuous duration in ms */
  maxDuration: number;
  /** Whether the adapter can play multi-step patterns natively */
  supportsPattern: boolean;
  /** Whether the adapter can vary intensity (not just on/off) */
  supportsIntensity: boolean;
  /** Whether the adapter has dual motors (gamepad-style) */
  dualMotor: boolean;
}

/** Interface all haptic adapters must implement */
export interface HapticAdapter {
  readonly name: string;
  readonly supported: boolean;

  /** Get the capabilities of this adapter */
  capabilities(): AdapterCapabilities;

  /** Fire a single haptic pulse */
  pulse(intensity: number, duration: number): Promise<void>;

  /** Play a sequence of haptic steps */
  playSequence(steps: HapticStep[]): Promise<void>;

  /** Cancel any ongoing haptic effect */
  cancel(): void;

  /** Clean up resources */
  dispose(): void;
}
