import type { HapticAdapter } from '../types';
import { NoopAdapter } from '../adapters/noop.adapter';
import { WebVibrationAdapter } from '../adapters/web-vibration.adapter';
import { detectPlatform } from '../utils/platform';

/**
 * Auto-detect the best available haptic adapter for the current platform.
 */
export function detectAdapter(): HapticAdapter {
  const platform = detectPlatform();

  // Web browser with Vibration API support
  if (platform.hasVibrationAPI) {
    return new WebVibrationAdapter();
  }

  // Fallback to no-op (SSR, Node, unsupported browsers, iOS)
  return new NoopAdapter();
}
