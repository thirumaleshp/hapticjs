import type { HapticPattern } from '../types';

/** Gaming haptic presets */
export const gaming = {
  /** Explosion — heavy descending */
  explosion: {
    name: 'gaming.explosion',
    steps: [
      { type: 'vibrate' as const, duration: 100, intensity: 1.0 },
      { type: 'vibrate' as const, duration: 80, intensity: 0.8 },
      { type: 'vibrate' as const, duration: 60, intensity: 0.5 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.3 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.1 },
    ],
  },

  /** Collision — sharp impact */
  collision: {
    name: 'gaming.collision',
    steps: [
      { type: 'vibrate' as const, duration: 30, intensity: 1.0 },
      { type: 'pause' as const, duration: 20, intensity: 0 },
      { type: 'vibrate' as const, duration: 15, intensity: 0.5 },
    ],
  },

  /** Heartbeat — rhythmic pulse */
  heartbeat: {
    name: 'gaming.heartbeat',
    steps: [
      { type: 'vibrate' as const, duration: 20, intensity: 0.8 },
      { type: 'pause' as const, duration: 80, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 1.0 },
      { type: 'pause' as const, duration: 400, intensity: 0 },
    ],
  },

  /** Gunshot — sharp burst */
  gunshot: {
    name: 'gaming.gunshot',
    steps: [
      { type: 'vibrate' as const, duration: 15, intensity: 1.0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.4 },
    ],
  },

  /** Sword clash — metallic ring */
  swordClash: {
    name: 'gaming.swordClash',
    steps: [
      { type: 'vibrate' as const, duration: 10, intensity: 1.0 },
      { type: 'pause' as const, duration: 10, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.6 },
      { type: 'vibrate' as const, duration: 50, intensity: 0.3 },
    ],
  },

  /** Power up — ascending intensity */
  powerUp: {
    name: 'gaming.powerUp',
    steps: [
      { type: 'vibrate' as const, duration: 40, intensity: 0.2 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.4 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.6 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.8 },
      { type: 'vibrate' as const, duration: 60, intensity: 1.0 },
    ],
  },

  /** Damage taken — heavy stutter */
  damage: {
    name: 'gaming.damage',
    steps: [
      { type: 'vibrate' as const, duration: 40, intensity: 0.9 },
      { type: 'pause' as const, duration: 20, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.6 },
      { type: 'pause' as const, duration: 20, intensity: 0 },
      { type: 'vibrate' as const, duration: 20, intensity: 0.3 },
    ],
  },

  /** Item pickup — light cheerful */
  pickup: {
    name: 'gaming.pickup',
    steps: [
      { type: 'vibrate' as const, duration: 10, intensity: 0.3 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 15, intensity: 0.6 },
    ],
  },

  /** Level complete — celebratory */
  levelComplete: {
    name: 'gaming.levelComplete',
    steps: [
      { type: 'vibrate' as const, duration: 20, intensity: 0.5 },
      { type: 'pause' as const, duration: 60, intensity: 0 },
      { type: 'vibrate' as const, duration: 20, intensity: 0.5 },
      { type: 'pause' as const, duration: 60, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.7 },
      { type: 'pause' as const, duration: 60, intensity: 0 },
      { type: 'vibrate' as const, duration: 50, intensity: 1.0 },
    ],
  },

  /** Engine rumble — continuous vibration */
  engineRumble: {
    name: 'gaming.engineRumble',
    steps: [
      { type: 'vibrate' as const, duration: 30, intensity: 0.4 },
      { type: 'pause' as const, duration: 10, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.5 },
      { type: 'pause' as const, duration: 10, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.4 },
      { type: 'pause' as const, duration: 10, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.5 },
    ],
  },
} satisfies Record<string, HapticPattern>;
