import { describe, it, expect } from 'vitest';
import { GamepadManager } from '../src/utils/gamepad-manager';

describe('GamepadManager', () => {
  it('returns empty gamepads when none connected', () => {
    const manager = new GamepadManager();
    const gamepads = manager.getGamepads();
    expect(gamepads).toEqual([]);
  });

  it('getFirstGamepad returns null when none connected', () => {
    const manager = new GamepadManager();
    expect(manager.getFirstGamepad()).toBeNull();
  });

  it('hasHapticGamepad returns false when none connected', () => {
    const manager = new GamepadManager();
    expect(manager.hasHapticGamepad()).toBe(false);
  });

  it('dispose does not throw', () => {
    const manager = new GamepadManager();
    manager.listen();
    expect(() => manager.dispose()).not.toThrow();
  });
});
