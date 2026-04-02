import type { GamepadHapticAdapter } from '../adapters/gamepad-haptic.adapter';

/**
 * SpatialHaptics — directional haptic feedback for dual-motor controllers.
 *
 * Provides left/right motor control, sweeps, pulses, impacts,
 * and engine RPM simulation for immersive spatial feedback.
 */
export class SpatialHaptics {
  private adapter: GamepadHapticAdapter;

  constructor(adapter: GamepadHapticAdapter) {
    this.adapter = adapter;
  }

  // ─── Directional ─────────────────────────────────────────

  /** Vibrate left motor only (weak/high-frequency motor) */
  async left(intensity = 0.7, duration = 50): Promise<void> {
    duration = Math.max(25, duration);
    await this._playDualRumble(intensity, 0, duration);
  }

  /** Vibrate right motor only (strong/low-frequency motor) */
  async right(intensity = 0.7, duration = 50): Promise<void> {
    duration = Math.max(25, duration);
    await this._playDualRumble(0, intensity, duration);
  }

  /**
   * Sweep vibration from one side to the other.
   * Plays first side then second side with slight overlap.
   */
  async sweep(
    direction: 'left-to-right' | 'right-to-left',
    duration = 200,
  ): Promise<void> {
    duration = Math.max(50, duration);
    const halfDuration = Math.max(25, Math.floor(duration / 2));

    if (direction === 'left-to-right') {
      await this._playDualRumble(0.8, 0, halfDuration);
      await this._delay(Math.max(25, halfDuration - 25));
      await this._playDualRumble(0, 0.8, halfDuration);
    } else {
      await this._playDualRumble(0, 0.8, halfDuration);
      await this._delay(Math.max(25, halfDuration - 25));
      await this._playDualRumble(0.8, 0, halfDuration);
    }
  }

  /** Pulsing haptic on specified side */
  async pulse(
    side: 'left' | 'right' | 'both' = 'both',
    count = 3,
    interval = 100,
  ): Promise<void> {
    interval = Math.max(50, interval);
    const pulseDuration = Math.max(25, Math.floor(interval * 0.4));

    for (let i = 0; i < count; i++) {
      if (side === 'left') {
        await this._playDualRumble(0.7, 0, pulseDuration);
      } else if (side === 'right') {
        await this._playDualRumble(0, 0.7, pulseDuration);
      } else {
        await this._playDualRumble(0.7, 0.7, pulseDuration);
      }

      if (i < count - 1) {
        await this._delay(interval - pulseDuration);
      }
    }
  }

  // ─── Rumble ──────────────────────────────────────────────

  /** Sustained left rumble */
  async rumbleLeft(duration = 300, intensity = 0.6): Promise<void> {
    duration = Math.max(25, duration);
    await this._playDualRumble(intensity, 0, duration);
  }

  /** Sustained right rumble */
  async rumbleRight(duration = 300, intensity = 0.6): Promise<void> {
    duration = Math.max(25, duration);
    await this._playDualRumble(0, intensity, duration);
  }

  // ─── Impact ──────────────────────────────────────────────

  /**
   * Directional impact feedback.
   * Center hits both motors simultaneously.
   */
  async impact(
    direction: 'left' | 'right' | 'center',
    force = 0.9,
  ): Promise<void> {
    const impactDuration = 50;

    if (direction === 'left') {
      await this._playDualRumble(force, force * 0.2, impactDuration);
    } else if (direction === 'right') {
      await this._playDualRumble(force * 0.2, force, impactDuration);
    } else {
      await this._playDualRumble(force, force, impactDuration);
    }
  }

  // ─── Simulation ──────────────────────────────────────────

  /**
   * Engine RPM simulation.
   * Low RPM = slow weak pulses, high RPM = fast strong pulses.
   * RPM range: 0-8000.
   */
  async engine(rpm: number): Promise<void> {
    const normalizedRPM = Math.min(8000, Math.max(0, rpm));
    const rpmFactor = normalizedRPM / 8000;

    // Map RPM to motor intensities
    const weakMag = Math.min(1, 0.2 + rpmFactor * 0.5);
    const strongMag = Math.min(1, rpmFactor * 0.9);

    // Map RPM to pulse duration (shorter at high RPM)
    const pulseDuration = Math.max(25, Math.floor(150 - rpmFactor * 120));

    await this._playDualRumble(weakMag, strongMag, pulseDuration);
  }

  // ─── Internal ────────────────────────────────────────────

  /**
   * Play a dual-rumble effect with explicit weak/strong magnitudes.
   * Uses the adapter's pulse method internally, but crafts the sequence
   * to target specific motors via the gamepad vibrationActuator API.
   */
  private async _playDualRumble(
    weakMagnitude: number,
    strongMagnitude: number,
    duration: number,
  ): Promise<void> {
    // Use the adapter's playSequence with a custom motor mapping
    // by directly accessing the adapter's internal gamepad
    const manager = this.adapter.getManager();
    const gamepad = manager.getFirstGamepad();
    if (!gamepad?.vibrationActuator) return;

    await gamepad.vibrationActuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration: Math.max(25, duration),
      weakMagnitude: Math.min(1, Math.max(0, weakMagnitude)),
      strongMagnitude: Math.min(1, Math.max(0, strongMagnitude)),
    });
  }

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
