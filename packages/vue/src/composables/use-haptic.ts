import { inject } from 'vue';
import { HapticEngine } from '@hapticjs/core';
import type { HapticPattern, HapticStep, SemanticEffect } from '@hapticjs/core';
import { HAPTIC_ENGINE_KEY } from '../plugin';

export interface UseHapticReturn {
  trigger: () => Promise<void>;
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
  play: (pattern: string | HapticPattern | HapticStep[]) => Promise<void>;
  vibrate: (duration: number, intensity?: number) => Promise<void>;
  isSupported: boolean;
}

/**
 * Vue composable for haptic feedback.
 *
 * With preset:
 *   const { trigger, isSupported } = useHaptic('success');
 *
 * Without preset (full API):
 *   const haptic = useHaptic();
 *   haptic.tap();
 *   haptic.play('~~..##');
 */
export function useHaptic(): UseHapticActions;
export function useHaptic(effect: SemanticEffect | string): UseHapticReturn;
export function useHaptic(effect?: SemanticEffect | string): UseHapticReturn | UseHapticActions {
  const engine = inject(HAPTIC_ENGINE_KEY, () => HapticEngine.create(), true);

  if (effect !== undefined) {
    const trigger = async () => {
      if (effect in engine) {
        const method = engine[effect as keyof typeof engine];
        if (typeof method === 'function') {
          await (method as () => Promise<void>).call(engine);
          return;
        }
      }
      await engine.play(effect);
    };

    return {
      trigger,
      isSupported: engine.isSupported,
    };
  }

  return {
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
  };
}
