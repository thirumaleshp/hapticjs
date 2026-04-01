import { useCallback, useMemo } from 'react';
import type { HapticPattern, HapticStep, SemanticEffect } from '@hapticjs/core';
import { useHapticEngine } from '../context/haptic-provider';

export interface UseHapticReturn {
  /** Trigger the specified effect */
  trigger: () => Promise<void>;
  /** Whether haptics are supported on this device */
  isSupported: boolean;
  /** The underlying engine instance */
  engine: ReturnType<typeof useHapticEngine>;
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
  play: (pattern: string | HapticPattern | HapticStep[]) => Promise<void>;
  vibrate: (duration: number, intensity?: number) => Promise<void>;
  isSupported: boolean;
}

/**
 * React hook for haptic feedback.
 *
 * With a preset:
 *   const { trigger, isSupported } = useHaptic('success');
 *   <button onClick={trigger}>Yay!</button>
 *
 * Without preset (full API):
 *   const haptic = useHaptic();
 *   haptic.tap();
 *   haptic.play('~~..##');
 */
export function useHaptic(): UseHapticActions;
export function useHaptic(effect: SemanticEffect | string): UseHapticReturn;
export function useHaptic(effect?: SemanticEffect | string): UseHapticReturn | UseHapticActions {
  const engine = useHapticEngine();

  const trigger = useCallback(async () => {
    if (!effect) return;

    // Check if it's a semantic effect
    if (effect in engine) {
      const method = engine[effect as keyof typeof engine];
      if (typeof method === 'function') {
        await (method as () => Promise<void>).call(engine);
        return;
      }
    }

    // Try as HPL pattern
    await engine.play(effect);
  }, [engine, effect]);

  const actions = useMemo<UseHapticActions>(
    () => ({
      tap: (intensity?: number) => engine.tap(intensity),
      doubleTap: (intensity?: number) => engine.doubleTap(intensity),
      longPress: (intensity?: number) => engine.longPress(intensity),
      success: () => engine.success(),
      warning: () => engine.warning(),
      error: () => engine.error(),
      selection: () => engine.selection(),
      toggle: (on: boolean) => engine.toggle(on),
      play: (pattern: string | HapticPattern | HapticStep[]) => engine.play(pattern),
      vibrate: (duration: number, intensity?: number) => engine.vibrate(duration, intensity),
      isSupported: engine.isSupported,
    }),
    [engine],
  );

  if (effect === undefined) {
    return actions;
  }

  return {
    trigger,
    isSupported: engine.isSupported,
    engine,
  };
}
