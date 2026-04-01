import type { HapticAdapter, AdapterCapabilities, HapticStep } from '@vibejs/core';
import { GamepadManager } from '../utils/gamepad-manager';
import { defaultMotorMapping } from '../utils/dual-motor';
import type { MotorMappingFn } from '../utils/dual-motor';

export interface GamepadAdapterOptions {
  /** Which gamepad index to use (default: first connected) */
  gamepadIndex?: number;
  /** Custom motor mapping function */
  motorMapping?: MotorMappingFn;
  /** Auto-listen for gamepad connections (default: true) */
  autoListen?: boolean;
}

/**
 * Gamepad haptics adapter using the GamepadHapticActuator API.
 * Supports dual-motor (weak/strong) vibration on modern controllers.
 */
export class GamepadHapticAdapter implements HapticAdapter {
  readonly name = 'gamepad';
  private manager: GamepadManager;
  private motorMapping: MotorMappingFn;
  private gamepadIndex?: number;
  private _cancelled = false;

  constructor(options: GamepadAdapterOptions = {}) {
    this.manager = new GamepadManager();
    this.motorMapping = options.motorMapping ?? defaultMotorMapping;
    this.gamepadIndex = options.gamepadIndex;

    if (options.autoListen !== false) {
      this.manager.listen();
    }
  }

  get supported(): boolean {
    return this.manager.hasHapticGamepad();
  }

  capabilities(): AdapterCapabilities {
    return {
      maxIntensityLevels: 100,
      minDuration: 1,
      maxDuration: 5000,
      supportsPattern: false,
      supportsIntensity: true,
      dualMotor: true,
    };
  }

  async pulse(intensity: number, duration: number): Promise<void> {
    const gamepad = this._getGamepad();
    if (!gamepad?.vibrationActuator) return;

    const { weakMagnitude, strongMagnitude } = this.motorMapping(intensity);

    await gamepad.vibrationActuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration,
      weakMagnitude,
      strongMagnitude,
    });
  }

  async playSequence(steps: HapticStep[]): Promise<void> {
    this._cancelled = false;

    for (const step of steps) {
      if (this._cancelled) break;

      if (step.type === 'vibrate' && step.intensity > 0) {
        await this.pulse(step.intensity, step.duration);
        await this._delay(step.duration);
      } else {
        await this._delay(step.duration);
      }
    }
  }

  cancel(): void {
    this._cancelled = true;
    const gamepad = this._getGamepad();
    if (gamepad?.vibrationActuator) {
      gamepad.vibrationActuator.reset();
    }
  }

  dispose(): void {
    this.cancel();
    this.manager.dispose();
  }

  /** Get the gamepad manager for advanced usage */
  getManager(): GamepadManager {
    return this.manager;
  }

  private _getGamepad(): Gamepad | null {
    if (this.gamepadIndex !== undefined) {
      const gamepads = this.manager.getGamepads();
      return gamepads.find((gp) => gp.index === this.gamepadIndex) ?? null;
    }
    return this.manager.getFirstGamepad();
  }

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
