import type { HapticPattern } from '../types';

/** UI interaction presets */
export const ui = {
  /** Light button tap */
  tap: {
    name: 'ui.tap',
    steps: [{ type: 'vibrate' as const, duration: 10, intensity: 0.6 }],
  },

  /** Double tap */
  doubleTap: {
    name: 'ui.doubleTap',
    steps: [
      { type: 'vibrate' as const, duration: 10, intensity: 0.6 },
      { type: 'pause' as const, duration: 80, intensity: 0 },
      { type: 'vibrate' as const, duration: 10, intensity: 0.6 },
    ],
  },

  /** Long press acknowledgment */
  longPress: {
    name: 'ui.longPress',
    steps: [{ type: 'vibrate' as const, duration: 50, intensity: 0.8 }],
  },

  /** Toggle switch on */
  toggleOn: {
    name: 'ui.toggleOn',
    steps: [{ type: 'vibrate' as const, duration: 15, intensity: 0.6 }],
  },

  /** Toggle switch off */
  toggleOff: {
    name: 'ui.toggleOff',
    steps: [{ type: 'vibrate' as const, duration: 10, intensity: 0.3 }],
  },

  /** Slider snap to value */
  sliderSnap: {
    name: 'ui.sliderSnap',
    steps: [{ type: 'vibrate' as const, duration: 5, intensity: 0.4 }],
  },

  /** Selection changed */
  selection: {
    name: 'ui.selection',
    steps: [{ type: 'vibrate' as const, duration: 8, intensity: 0.4 }],
  },

  /** Pull to refresh threshold reached */
  pullToRefresh: {
    name: 'ui.pullToRefresh',
    steps: [
      { type: 'vibrate' as const, duration: 20, intensity: 0.5 },
      { type: 'pause' as const, duration: 40, intensity: 0 },
      { type: 'vibrate' as const, duration: 30, intensity: 0.7 },
    ],
  },

  /** Swipe action triggered */
  swipe: {
    name: 'ui.swipe',
    steps: [
      { type: 'vibrate' as const, duration: 12, intensity: 0.4 },
      { type: 'pause' as const, duration: 30, intensity: 0 },
      { type: 'vibrate' as const, duration: 8, intensity: 0.3 },
    ],
  },

  /** Context menu appearance */
  contextMenu: {
    name: 'ui.contextMenu',
    steps: [{ type: 'vibrate' as const, duration: 20, intensity: 0.7 }],
  },

  /** Drag start */
  dragStart: {
    name: 'ui.dragStart',
    steps: [{ type: 'vibrate' as const, duration: 12, intensity: 0.5 }],
  },

  /** Drag drop */
  drop: {
    name: 'ui.drop',
    steps: [
      { type: 'vibrate' as const, duration: 20, intensity: 0.8 },
      { type: 'pause' as const, duration: 30, intensity: 0 },
      { type: 'vibrate' as const, duration: 10, intensity: 0.4 },
    ],
  },
} satisfies Record<string, HapticPattern>;
