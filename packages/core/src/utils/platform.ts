/** Platform detection utilities */

export interface PlatformInfo {
  isWeb: boolean;
  isNode: boolean;
  isReactNative: boolean;
  hasVibrationAPI: boolean;
  hasGamepadAPI: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
}

export function detectPlatform(): PlatformInfo {
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const isNode =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as Record<string, unknown>).process === 'object' &&
    typeof ((globalThis as Record<string, unknown>).process as Record<string, unknown>)?.versions === 'object';
  const isReactNative =
    typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

  const hasVibrationAPI = isWeb && 'vibrate' in navigator;
  const hasGamepadAPI = isWeb && 'getGamepads' in navigator;

  const ua = isWeb ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (isWeb && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid;

  return {
    isWeb,
    isNode,
    isReactNative,
    hasVibrationAPI,
    hasGamepadAPI,
    isIOS,
    isAndroid,
    isMobile,
  };
}
