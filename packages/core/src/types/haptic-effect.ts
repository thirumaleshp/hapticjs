/** A single step in a haptic sequence */
export interface HapticStep {
  type: 'vibrate' | 'pause';
  /** Duration in milliseconds */
  duration: number;
  /** Intensity from 0.0 to 1.0 (0 = off, 1 = max) */
  intensity: number;
  /** Optional easing for intensity ramps */
  easing?: EasingFunction;
}

/** A complete haptic pattern — a named sequence of steps */
export interface HapticPattern {
  name?: string;
  steps: HapticStep[];
  metadata?: Record<string, unknown>;
}

/** Easing function type for smooth transitions */
export type EasingFunction = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

/** Semantic impact styles matching iOS UIImpactFeedbackGenerator */
export type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

/** Semantic notification types */
export type NotificationType = 'success' | 'warning' | 'error';

/** All built-in semantic effect names */
export type SemanticEffect =
  | 'tap'
  | 'doubleTap'
  | 'longPress'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'
  | 'toggle'
  | ImpactStyle;
