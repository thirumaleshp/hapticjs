import type { HapticAdapter, AdapterCapabilities, HapticStep, ImpactStyle, SemanticEffect } from '@hapticjs/core';

declare const require: (module: string) => any;

/**
 * Backing engine resolved at runtime.
 * We try react-native-haptic-feedback first, then expo-haptics,
 * then fall back to React Native's built-in Vibration API.
 */
type Backend = 'react-native-haptic-feedback' | 'expo-haptics' | 'vibration' | 'none';

/** Resolved module references — set once on first use */
let _backend: Backend | undefined;
let _rnHaptic: any;
let _expoHaptics: any;
let _vibration: any;

function resolveBackend(): Backend {
  if (_backend !== undefined) return _backend;

  // 1. react-native-haptic-feedback
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _rnHaptic = require('react-native-haptic-feedback');
    _backend = 'react-native-haptic-feedback';
    return _backend;
  } catch {
    // not available
  }

  // 2. expo-haptics
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _expoHaptics = require('expo-haptics');
    _backend = 'expo-haptics';
    return _backend;
  } catch {
    // not available
  }

  // 3. React Native Vibration
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RN = require('react-native');
    if (RN?.Vibration) {
      _vibration = RN.Vibration;
      _backend = 'vibration';
      return _backend;
    }
  } catch {
    // not available
  }

  _backend = 'none';
  return _backend;
}

/** Map ImpactStyle to react-native-haptic-feedback trigger types */
const IMPACT_TO_RN_HAPTIC: Record<ImpactStyle, string> = {
  light: 'impactLight',
  medium: 'impactMedium',
  heavy: 'impactHeavy',
  rigid: 'impactHeavy',
  soft: 'impactLight',
};

/** Map SemanticEffect to react-native-haptic-feedback trigger types */
const EFFECT_TO_RN_HAPTIC: Record<string, string> = {
  tap: 'impactLight',
  doubleTap: 'impactMedium',
  longPress: 'impactHeavy',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
  selection: 'selection',
  toggle: 'selection',
  light: 'impactLight',
  medium: 'impactMedium',
  heavy: 'impactHeavy',
  rigid: 'impactHeavy',
  soft: 'impactLight',
};

/** Map ImpactStyle to expo-haptics ImpactFeedbackStyle */
const IMPACT_TO_EXPO: Record<ImpactStyle, string> = {
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
  rigid: 'Heavy',
  soft: 'Light',
};

/** Map NotificationType to expo-haptics NotificationFeedbackType */
const NOTIFICATION_TO_EXPO: Record<string, string> = {
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

/**
 * React Native haptic adapter.
 *
 * Pure JS mapping layer that wraps existing native haptic packages:
 * - react-native-haptic-feedback (preferred)
 * - expo-haptics (fallback)
 * - React Native Vibration API (last resort)
 *
 * Does NOT ship any native code itself.
 */
export class ReactNativeHapticAdapter implements HapticAdapter {
  readonly name = 'react-native-haptic';
  readonly supported: boolean;

  private _cancelled = false;
  private _backend: Backend;

  constructor() {
    this._backend = resolveBackend();
    this.supported = this._backend !== 'none';
  }

  capabilities(): AdapterCapabilities {
    const hasNativeHaptics =
      this._backend === 'react-native-haptic-feedback' ||
      this._backend === 'expo-haptics';

    return {
      maxIntensityLevels: hasNativeHaptics ? 3 : 1,
      minDuration: hasNativeHaptics ? 1 : 10,
      maxDuration: 5000,
      supportsPattern: true,
      supportsIntensity: hasNativeHaptics,
      dualMotor: false,
    };
  }

  async pulse(intensity: number, _duration: number): Promise<void> {
    if (!this.supported) return;

    const style = this._intensityToImpactStyle(intensity);
    await this._triggerImpact(style);
  }

  async playSequence(steps: HapticStep[]): Promise<void> {
    if (!this.supported || steps.length === 0) return;

    this._cancelled = false;

    for (const step of steps) {
      if (this._cancelled) break;

      if (step.type === 'vibrate' && step.intensity > 0) {
        const style = this._intensityToImpactStyle(step.intensity);
        await this._triggerImpact(style);
        await this._delay(step.duration);
      } else {
        await this._delay(step.duration);
      }
    }
  }

  cancel(): void {
    this._cancelled = true;
    if (this._backend === 'vibration' && _vibration) {
      _vibration.cancel();
    }
  }

  dispose(): void {
    this.cancel();
  }

  /**
   * Trigger a semantic haptic effect by name.
   * This is a convenience method used by the hook layer.
   */
  async triggerEffect(effect: SemanticEffect): Promise<void> {
    if (!this.supported) return;

    switch (this._backend) {
      case 'react-native-haptic-feedback':
        this._triggerRNHaptic(effect);
        break;
      case 'expo-haptics':
        await this._triggerExpo(effect);
        break;
      case 'vibration':
        this._triggerVibration(effect);
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private _intensityToImpactStyle(intensity: number): ImpactStyle {
    if (intensity >= 0.75) return 'heavy';
    if (intensity >= 0.4) return 'medium';
    return 'light';
  }

  private async _triggerImpact(style: ImpactStyle): Promise<void> {
    switch (this._backend) {
      case 'react-native-haptic-feedback': {
        const type = IMPACT_TO_RN_HAPTIC[style];
        _rnHaptic.trigger(type);
        break;
      }
      case 'expo-haptics': {
        const feedbackStyle = IMPACT_TO_EXPO[style];
        await _expoHaptics.impactAsync(
          _expoHaptics.ImpactFeedbackStyle[feedbackStyle],
        );
        break;
      }
      case 'vibration': {
        const durationMap: Record<ImpactStyle, number> = {
          light: 20,
          medium: 40,
          heavy: 60,
          rigid: 50,
          soft: 15,
        };
        _vibration.vibrate(durationMap[style]);
        break;
      }
    }
  }

  private _triggerRNHaptic(effect: SemanticEffect): void {
    const type = EFFECT_TO_RN_HAPTIC[effect] ?? 'impactMedium';
    _rnHaptic.trigger(type);
  }

  private async _triggerExpo(effect: SemanticEffect): Promise<void> {
    // Notification effects
    if (effect === 'success' || effect === 'warning' || effect === 'error') {
      const type = NOTIFICATION_TO_EXPO[effect]!;
      await _expoHaptics.notificationAsync(
        _expoHaptics.NotificationFeedbackType[type],
      );
      return;
    }

    // Selection effect
    if (effect === 'selection' || effect === 'toggle') {
      await _expoHaptics.selectionAsync();
      return;
    }

    // Impact effects (tap, doubleTap, longPress, and ImpactStyle values)
    const impactMap: Record<string, ImpactStyle> = {
      tap: 'light',
      doubleTap: 'medium',
      longPress: 'heavy',
    };

    const style: ImpactStyle = impactMap[effect] ?? (effect as ImpactStyle);
    const feedbackStyle = IMPACT_TO_EXPO[style] ?? 'Medium';

    await _expoHaptics.impactAsync(
      _expoHaptics.ImpactFeedbackStyle[feedbackStyle],
    );
  }

  private _triggerVibration(effect: SemanticEffect): void {
    const durationMap: Record<string, number> = {
      tap: 20,
      doubleTap: 40,
      longPress: 80,
      success: 50,
      warning: 60,
      error: 100,
      selection: 10,
      toggle: 10,
      light: 20,
      medium: 40,
      heavy: 60,
      rigid: 50,
      soft: 15,
    };

    const duration = durationMap[effect] ?? 40;
    _vibration.vibrate(duration);
  }

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
