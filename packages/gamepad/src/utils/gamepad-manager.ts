/** Manages gamepad connection state and provides access to connected gamepads */
export class GamepadManager {
  private _onConnect?: (gamepad: Gamepad) => void;
  private _onDisconnect?: (gamepad: Gamepad) => void;
  private _listening = false;

  /** Start listening for gamepad connections */
  listen(): void {
    if (this._listening || typeof window === 'undefined') return;
    this._listening = true;

    window.addEventListener('gamepadconnected', this._handleConnect);
    window.addEventListener('gamepaddisconnected', this._handleDisconnect);
  }

  /** Stop listening */
  unlisten(): void {
    if (!this._listening || typeof window === 'undefined') return;
    this._listening = false;

    window.removeEventListener('gamepadconnected', this._handleConnect);
    window.removeEventListener('gamepaddisconnected', this._handleDisconnect);
  }

  /** Get all currently connected gamepads */
  getGamepads(): Gamepad[] {
    if (typeof navigator === 'undefined' || !('getGamepads' in navigator)) {
      return [];
    }
    return Array.from(navigator.getGamepads()).filter(
      (gp): gp is Gamepad => gp !== null
    );
  }

  /** Get the first connected gamepad, or null */
  getFirstGamepad(): Gamepad | null {
    const gamepads = this.getGamepads();
    return gamepads[0] ?? null;
  }

  /** Set connection callback */
  onConnect(fn: (gamepad: Gamepad) => void): void {
    this._onConnect = fn;
  }

  /** Set disconnection callback */
  onDisconnect(fn: (gamepad: Gamepad) => void): void {
    this._onDisconnect = fn;
  }

  /** Check if any gamepad with haptic support is connected */
  hasHapticGamepad(): boolean {
    return this.getGamepads().some(
      (gp) => gp.vibrationActuator != null
    );
  }

  dispose(): void {
    this.unlisten();
    this._onConnect = undefined;
    this._onDisconnect = undefined;
  }

  private _handleConnect = (e: GamepadEvent) => {
    this._onConnect?.(e.gamepad);
  };

  private _handleDisconnect = (e: GamepadEvent) => {
    this._onDisconnect?.(e.gamepad);
  };
}
