import type { HapticPattern } from '../types';

/** System-level haptic presets */
export const system = {
  /** Keyboard key press */
  keyPress: {
    name: 'system.keyPress',
    steps: [{ type: 'vibrate' as const, duration: 25, intensity: 0.5 }],
  },

  /** Scroll tick (detent-like) */
  scrollTick: {
    name: 'system.scrollTick',
    steps: [{ type: 'vibrate' as const, duration: 20, intensity: 0.4 }],
  },

  /** Scroll boundary reached */
  scrollBounce: {
    name: 'system.scrollBounce',
    steps: [
      { type: 'vibrate' as const, duration: 25, intensity: 0.6 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.4 },
    ],
  },

  /** Delete action */
  delete: {
    name: 'system.delete',
    steps: [
      { type: 'vibrate' as const, duration: 30, intensity: 0.5 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.8 },
    ],
  },

  /** Undo action */
  undo: {
    name: 'system.undo',
    steps: [
      { type: 'vibrate' as const, duration: 30, intensity: 0.5 },
      { type: 'pause' as const, duration: 80, intensity: 0 },
      { type: 'vibrate' as const, duration: 25, intensity: 0.4 },
    ],
  },

  /** Copy to clipboard */
  copy: {
    name: 'system.copy',
    steps: [{ type: 'vibrate' as const, duration: 30, intensity: 0.5 }],
  },

  /** Paste from clipboard */
  paste: {
    name: 'system.paste',
    steps: [
      { type: 'vibrate' as const, duration: 25, intensity: 0.4 },
      { type: 'pause' as const, duration: 30, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.6 },
    ],
  },
} satisfies Record<string, HapticPattern>;
