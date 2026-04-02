import type { HapticPattern } from '../types';

/** Emotion-based haptic presets */
export const emotions = {
  /** Excited — fast, energetic pulses building up */
  excited: {
    name: 'emotions.excited',
    steps: [
      { type: 'vibrate' as const, duration: 30, intensity: 0.5 },
      { type: 'pause' as const, duration: 30, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.6 },
      { type: 'pause' as const, duration: 25, intensity: 0 },
      { type: 'vibrate' as const, duration: 35, intensity: 0.7 },
      { type: 'pause' as const, duration: 25, intensity: 0 },
      { type: 'vibrate' as const, duration: 35, intensity: 0.8 },
      { type: 'pause' as const, duration: 25, intensity: 0 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.9 },
      { type: 'vibrate' as const, duration: 50, intensity: 1.0 },
    ],
  },

  /** Calm — slow, gentle wave with soft sustained vibrations */
  calm: {
    name: 'emotions.calm',
    steps: [
      { type: 'vibrate' as const, duration: 80, intensity: 0.2 },
      { type: 'pause' as const, duration: 200, intensity: 0 },
      { type: 'vibrate' as const, duration: 100, intensity: 0.25 },
      { type: 'pause' as const, duration: 250, intensity: 0 },
      { type: 'vibrate' as const, duration: 80, intensity: 0.2 },
      { type: 'pause' as const, duration: 200, intensity: 0 },
      { type: 'vibrate' as const, duration: 100, intensity: 0.15 },
    ],
  },

  /** Tense — tight, irregular short heavy bursts */
  tense: {
    name: 'emotions.tense',
    steps: [
      { type: 'vibrate' as const, duration: 35, intensity: 0.8 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.9 },
      { type: 'pause' as const, duration: 30, intensity: 0 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.85 },
      { type: 'pause' as const, duration: 35, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.9 },
      { type: 'pause' as const, duration: 45, intensity: 0 },
      { type: 'vibrate' as const, duration: 35, intensity: 0.8 },
    ],
  },

  /** Happy — bouncy, playful ascending rhythm */
  happy: {
    name: 'emotions.happy',
    steps: [
      { type: 'vibrate' as const, duration: 30, intensity: 0.4 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 35, intensity: 0.5 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 35, intensity: 0.6 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.7 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 45, intensity: 0.8 },
    ],
  },

  /** Sad — slow, heavy, descending vibrations that fade */
  sad: {
    name: 'emotions.sad',
    steps: [
      { type: 'vibrate' as const, duration: 100, intensity: 0.8 },
      { type: 'pause' as const, duration: 120, intensity: 0 },
      { type: 'vibrate' as const, duration: 90, intensity: 0.6 },
      { type: 'pause' as const, duration: 140, intensity: 0 },
      { type: 'vibrate' as const, duration: 80, intensity: 0.4 },
      { type: 'pause' as const, duration: 160, intensity: 0 },
      { type: 'vibrate' as const, duration: 70, intensity: 0.25 },
    ],
  },

  /** Angry — aggressive, chaotic heavy rapid hits */
  angry: {
    name: 'emotions.angry',
    steps: [
      { type: 'vibrate' as const, duration: 40, intensity: 1.0 },
      { type: 'pause' as const, duration: 25, intensity: 0 },
      { type: 'vibrate' as const, duration: 35, intensity: 0.9 },
      { type: 'pause' as const, duration: 25, intensity: 0 },
      { type: 'vibrate' as const, duration: 45, intensity: 1.0 },
      { type: 'pause' as const, duration: 30, intensity: 0 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.95 },
      { type: 'vibrate' as const, duration: 50, intensity: 1.0 },
      { type: 'pause' as const, duration: 25, intensity: 0 },
      { type: 'vibrate' as const, duration: 45, intensity: 0.9 },
    ],
  },

  /** Surprised — sharp sudden hit, silence, then lighter hit */
  surprised: {
    name: 'emotions.surprised',
    steps: [
      { type: 'vibrate' as const, duration: 40, intensity: 1.0 },
      { type: 'pause' as const, duration: 200, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.4 },
    ],
  },

  /** Anxious — fast irregular heartbeat with inconsistent spacing */
  anxious: {
    name: 'emotions.anxious',
    steps: [
      { type: 'vibrate' as const, duration: 30, intensity: 0.7 },
      { type: 'pause' as const, duration: 60, intensity: 0 },
      { type: 'vibrate' as const, duration: 35, intensity: 0.8 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 25, intensity: 0.6 },
      { type: 'pause' as const, duration: 80, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.75 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 35, intensity: 0.85 },
      { type: 'pause' as const, duration: 35, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.7 },
    ],
  },

  /** Confident — strong, steady, measured even pulses */
  confident: {
    name: 'emotions.confident',
    steps: [
      { type: 'vibrate' as const, duration: 50, intensity: 0.8 },
      { type: 'pause' as const, duration: 80, intensity: 0 },
      { type: 'vibrate' as const, duration: 50, intensity: 0.8 },
      { type: 'pause' as const, duration: 80, intensity: 0 },
      { type: 'vibrate' as const, duration: 50, intensity: 0.8 },
      { type: 'pause' as const, duration: 80, intensity: 0 },
      { type: 'vibrate' as const, duration: 50, intensity: 0.8 },
    ],
  },

  /** Playful — alternating light-heavy in bouncy rhythm */
  playful: {
    name: 'emotions.playful',
    steps: [
      { type: 'vibrate' as const, duration: 25, intensity: 0.3 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.7 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 25, intensity: 0.35 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.75 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 25, intensity: 0.3 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 45, intensity: 0.8 },
    ],
  },

  /** Romantic — gentle heartbeat rhythm, two soft pulses, long pause, repeat */
  romantic: {
    name: 'emotions.romantic',
    steps: [
      { type: 'vibrate' as const, duration: 35, intensity: 0.4 },
      { type: 'pause' as const, duration: 60, intensity: 0 },
      { type: 'vibrate' as const, duration: 45, intensity: 0.5 },
      { type: 'pause' as const, duration: 300, intensity: 0 },
      { type: 'vibrate' as const, duration: 35, intensity: 0.4 },
      { type: 'pause' as const, duration: 60, intensity: 0 },
      { type: 'vibrate' as const, duration: 45, intensity: 0.5 },
      { type: 'pause' as const, duration: 300, intensity: 0 },
      { type: 'vibrate' as const, duration: 35, intensity: 0.4 },
      { type: 'pause' as const, duration: 60, intensity: 0 },
      { type: 'vibrate' as const, duration: 45, intensity: 0.5 },
    ],
  },

  /** Peaceful — very subtle, barely-there ultra-light slow pulses */
  peaceful: {
    name: 'emotions.peaceful',
    steps: [
      { type: 'vibrate' as const, duration: 60, intensity: 0.1 },
      { type: 'pause' as const, duration: 300, intensity: 0 },
      { type: 'vibrate' as const, duration: 70, intensity: 0.12 },
      { type: 'pause' as const, duration: 350, intensity: 0 },
      { type: 'vibrate' as const, duration: 60, intensity: 0.1 },
      { type: 'pause' as const, duration: 300, intensity: 0 },
      { type: 'vibrate' as const, duration: 70, intensity: 0.08 },
    ],
  },
} satisfies Record<string, HapticPattern>;
