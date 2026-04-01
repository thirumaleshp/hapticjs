import type { HapticPattern } from '../types';

/** Notification feedback presets */
export const notifications = {
  /** Success — two ascending pulses */
  success: {
    name: 'notifications.success',
    steps: [
      { type: 'vibrate' as const, duration: 30, intensity: 0.5 },
      { type: 'pause' as const, duration: 60, intensity: 0 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.8 },
    ],
  },

  /** Warning — three even pulses */
  warning: {
    name: 'notifications.warning',
    steps: [
      { type: 'vibrate' as const, duration: 40, intensity: 0.7 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.7 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 40, intensity: 0.7 },
    ],
  },

  /** Error — two heavy pulses */
  error: {
    name: 'notifications.error',
    steps: [
      { type: 'vibrate' as const, duration: 80, intensity: 1.0 },
      { type: 'pause' as const, duration: 100, intensity: 0 },
      { type: 'vibrate' as const, duration: 80, intensity: 1.0 },
    ],
  },

  /** Info — soft single pulse */
  info: {
    name: 'notifications.info',
    steps: [
      { type: 'vibrate' as const, duration: 20, intensity: 0.4 },
    ],
  },

  /** Message received */
  messageReceived: {
    name: 'notifications.messageReceived',
    steps: [
      { type: 'vibrate' as const, duration: 15, intensity: 0.5 },
      { type: 'pause' as const, duration: 100, intensity: 0 },
      { type: 'vibrate' as const, duration: 15, intensity: 0.5 },
    ],
  },

  /** Alarm — urgent repeating pattern */
  alarm: {
    name: 'notifications.alarm',
    steps: [
      { type: 'vibrate' as const, duration: 100, intensity: 1.0 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 100, intensity: 1.0 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 100, intensity: 1.0 },
      { type: 'pause' as const, duration: 200, intensity: 0 },
      { type: 'vibrate' as const, duration: 100, intensity: 1.0 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 100, intensity: 1.0 },
      { type: 'pause' as const, duration: 50, intensity: 0 },
      { type: 'vibrate' as const, duration: 100, intensity: 1.0 },
    ],
  },

  /** Reminder — gentle nudge */
  reminder: {
    name: 'notifications.reminder',
    steps: [
      { type: 'vibrate' as const, duration: 25, intensity: 0.5 },
      { type: 'pause' as const, duration: 150, intensity: 0 },
      { type: 'vibrate' as const, duration: 25, intensity: 0.5 },
    ],
  },
} satisfies Record<string, HapticPattern>;
