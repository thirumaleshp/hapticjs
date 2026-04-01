import type { HapticAdapter } from './adapter';

/** Visual fallback style when haptics are unavailable */
export type VisualFallbackStyle = 'flash' | 'shake' | 'pulse';

/** Fallback configuration for non-haptic feedback */
export interface FallbackConfig {
  type: 'none' | 'visual' | 'audio' | 'both';
  visual?: {
    /** Element to animate */
    element?: HTMLElement;
    /** CSS class to toggle */
    className?: string;
    /** Animation style */
    style?: VisualFallbackStyle;
  };
  audio?: {
    enabled: boolean;
    /** Volume from 0 to 1 */
    volume: number;
  };
}

/** Main configuration for the haptic engine */
export interface HapticConfig {
  /** Explicitly set an adapter (overrides auto-detection) */
  adapter?: HapticAdapter;
  /** Global intensity multiplier (0.0 to 1.0) */
  intensity: number;
  /** Whether haptics are enabled */
  enabled: boolean;
  /** Fallback when haptics are unavailable */
  fallback: FallbackConfig;
  /** Respect system haptic settings */
  respectSystemSettings: boolean;
}

/** Default configuration */
export const DEFAULT_CONFIG: HapticConfig = {
  intensity: 1.0,
  enabled: true,
  fallback: { type: 'none' },
  respectSystemSettings: true,
};
