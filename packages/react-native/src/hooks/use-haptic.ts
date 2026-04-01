import { useCallback, useMemo, useRef } from 'react';
import type { HapticStep, SemanticEffect } from '@hapticjs/core';
import { ReactNativeHapticAdapter } from '../adapters/react-native-haptic.adapter';

export interface UseHapticReturn {
  /** Trigger the specified effect */
  trigger: () => Promise<void>;
  /** Whether haptics are supported on this device */
  isSupported: boolean;
}

export interface UseHapticActions {
  tap: (intensity?: number) => Promise<void>;
  doubleTap: (intensity?: number) => Promise<void>;
  longPress: (intensity?: number) => Promise<void>;
  success: () => Promise<void>;
  warning: () => Promise<void>;
  error: () => Promise<void>;
  selection: () => Promise<void>;
  toggle: (on: boolean) => Promise<void>;
  play: (steps: HapticStep[]) => Promise<void>;
  vibrate: (duration: number, intensity?: number) => Promise<void>;
  isSupported: boolean;
}

/**
 * React Native hook for haptic feedback.
 *
 * With a preset:
 *   const { trigger, isSupported } = useHaptic('success');
 *   <Pressable onPress={trigger}>...</Pressable>
 *
 * Without preset (full API):
 *   const haptic = useHaptic();
 *   haptic.tap();
 *   haptic.success();
 */
export function useHaptic(): UseHapticActions;
export function useHaptic(effect: SemanticEffect | string): UseHapticReturn;
export function useHaptic(effect?: SemanticEffect | string): UseHapticReturn | UseHapticActions {
  const adapterRef = useRef<ReactNativeHapticAdapter>(null);
  if (!adapterRef.current) {
    adapterRef.current = new ReactNativeHapticAdapter();
  }
  const adapter = adapterRef.current;

  const trigger = useCallback(async () => {
    if (!effect) return;
    await adapter.triggerEffect(effect as SemanticEffect);
  }, [adapter, effect]);

  const actions = useMemo<UseHapticActions>(
    () => ({
      tap: (intensity?: number) =>
        adapter.triggerEffect('tap').then(() =>
          intensity !== undefined ? adapter.pulse(intensity, 20) : undefined,
        ),
      doubleTap: (intensity?: number) =>
        adapter.triggerEffect('doubleTap').then(() =>
          intensity !== undefined ? adapter.pulse(intensity, 40) : undefined,
        ),
      longPress: (intensity?: number) =>
        adapter.triggerEffect('longPress').then(() =>
          intensity !== undefined ? adapter.pulse(intensity, 80) : undefined,
        ),
      success: () => adapter.triggerEffect('success'),
      warning: () => adapter.triggerEffect('warning'),
      error: () => adapter.triggerEffect('error'),
      selection: () => adapter.triggerEffect('selection'),
      toggle: (_on: boolean) => adapter.triggerEffect('toggle'),
      play: (steps: HapticStep[]) => adapter.playSequence(steps),
      vibrate: (duration: number, intensity?: number) =>
        adapter.pulse(intensity ?? 1, duration),
      isSupported: adapter.supported,
    }),
    [adapter],
  );

  if (effect === undefined) {
    return actions;
  }

  return {
    trigger,
    isSupported: adapter.supported,
  };
}
