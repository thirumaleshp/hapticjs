import type { HapticPattern } from '../types';

/** System-level haptic presets */
export const system = {
  /** Keyboard key press */
  keyPress: {
    name: 'system.keyPress',
    steps: [{ type: 'vibrate' as const, duration: 5, intensity: 0.3 }],
  },

  /** Scroll tick (detent-like) */
  scrollTick: {
    name: 'system.scrollTick',
    steps: [{ type: 'vibrate' as const, duration: 3, intensity: 0.2 }],
  },

  /** Scroll boundary reached */
  scrollBounce: {
    name: 'system.scrollBounce',
    steps: [
      { type: 'vibrate' as const, duration: 10, intensity: 0.5 },
      { type: 'vibrate' as const, duration: 20, intensity: 0.3 },
    ],
  },

  /** Delete action */
  delete: {
    name: 'system.delete',
    steps: [
      { type: 'vibrate' as const, duration: 15, intensity: 0.5 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 25, intensity: 0.8 },
    ],
  },

  /** Undo action */
  undo: {
    name: 'system.undo',
    steps: [
      { type: 'vibrate' as const, duration: 20, intensity: 0.5 },
      { type: 'pause' as const, duration: 80, intensity: 0 },
      { type: 'vibrate' as const, duration: 10, intensity: 0.3 },
    ],
  },

  /** Copy to clipboard */
  copy: {
    name: 'system.copy',
    steps: [{ type: 'vibrate' as const, duration: 12, intensity: 0.4 }],
  },

  /** Paste from clipboard */
  paste: {
    name: 'system.paste',
    steps: [
      { type: 'vibrate' as const, duration: 8, intensity: 0.3 },
      { type: 'pause' as const, duration: 30, intensity: 0 },
      { type: 'vibrate' as const, duration: 12, intensity: 0.5 },
    ],
  },
} satisfies Record<string, HapticPattern>;
