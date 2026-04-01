import type { HapticAdapter } from '../types';
import { NoopAdapter } from '../adapters/noop.adapter';
import { WebVibrationAdapter } from '../adapters/web-vibration.adapter';
import { IoSAudioAdapter } from '../adapters/ios-audio.adapter';
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

  // iOS fallback: use AudioContext to simulate haptic feedback
  if (platform.isIOS && platform.isWeb) {
    const iosAdapter = new IoSAudioAdapter();
    if (iosAdapter.supported) {
      return iosAdapter;
    }
  }

  // Fallback to no-op (SSR, Node, unsupported browsers)
  return new NoopAdapter();
}
