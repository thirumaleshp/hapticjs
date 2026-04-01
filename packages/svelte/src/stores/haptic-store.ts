import { HapticEngine } from '@vibejs/core';
import type { HapticConfig, HapticPattern, HapticStep } from '@vibejs/core';

export interface HapticStore {
  engine: HapticEngine;
  isSupported: boolean;
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
}

/**
 * Create a haptic store for Svelte.
 *
 * Usage:
 *   const haptic = createHapticStore();
 *   haptic.tap();
 *   haptic.play('~~..##');
 *
 * Or in a Svelte component:
 *   <script>
 *     import { createHapticStore } from '@vibejs/svelte';
 *     const haptic = createHapticStore();
 *   </script>
 *   <button on:click={() => haptic.tap()}>Click</button>
 */
export function createHapticStore(config?: Partial<HapticConfig>): HapticStore {
  const engine = HapticEngine.create(config);

  return {
    engine,
    isSupported: engine.isSupported,
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
  };
}
