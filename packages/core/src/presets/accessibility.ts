import type { HapticPattern } from '../types';

/** Accessibility-focused haptic presets — rhythmic patterns for non-visual feedback */
export const accessibility = {
  /** Confirm action — clear double pulse */
  confirm: {
    name: 'accessibility.confirm',
    steps: [
      { type: 'vibrate' as const, duration: 30, intensity: 0.7 },
      { type: 'pause' as const, duration: 100, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.7 },
    ],
  },

  /** Deny/reject — long single buzz */
  deny: {
    name: 'accessibility.deny',
    steps: [
      { type: 'vibrate' as const, duration: 200, intensity: 0.8 },
    ],
  },

  /** Boundary reached (e.g., scroll limit, min/max value) */
  boundary: {
    name: 'accessibility.boundary',
    steps: [
      { type: 'vibrate' as const, duration: 15, intensity: 1.0 },
    ],
  },

  /** Focus change — subtle tick */
  focusChange: {
    name: 'accessibility.focusChange',
    steps: [
      { type: 'vibrate' as const, duration: 5, intensity: 0.3 },
    ],
  },

  /** Counting rhythm — one tick per count */
  countTick: {
    name: 'accessibility.countTick',
    steps: [
      { type: 'vibrate' as const, duration: 8, intensity: 0.5 },
    ],
  },

  /** Navigation landmark reached */
  landmark: {
    name: 'accessibility.landmark',
    steps: [
      { type: 'vibrate' as const, duration: 15, intensity: 0.6 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 15, intensity: 0.6 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 15, intensity: 0.6 },
    ],
  },

  /** Progress checkpoint — escalating feedback */
  progressCheckpoint: {
    name: 'accessibility.progressCheckpoint',
    steps: [
      { type: 'vibrate' as const, duration: 20, intensity: 0.4 },
      { type: 'pause' as const, duration: 60, intensity: 0 },
      { type: 'vibrate' as const, duration: 25, intensity: 0.7 },
    ],
  },
} satisfies Record<string, HapticPattern>;
