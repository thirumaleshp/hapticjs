import { inject, onUnmounted } from 'vue';
import { HapticEngine } from '@hapticjs/core';
import type { SemanticEffect } from '@hapticjs/core';
import { HAPTIC_ENGINE_KEY } from '../plugin';

export interface HapticGestureConfig {
  onTap?: SemanticEffect | string;
  onLongPress?: SemanticEffect | string;
  onHover?: SemanticEffect | string;
  longPressThreshold?: number;
}

/**
 * Vue composable that returns event handlers for haptic gestures.
 *
 * Usage in template:
 *   <div v-on="gestureHandlers">Press me</div>
 */
export function useHapticGesture(config: HapticGestureConfig) {
  const engine = inject(HAPTIC_ENGINE_KEY, () => HapticEngine.create(), true);
  const threshold = config.longPressThreshold ?? 500;
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let isLongPress = false;

  const playEffect = async (effect: SemanticEffect | string) => {
    if (effect in engine) {
      const method = engine[effect as keyof typeof engine];
      if (typeof method === 'function') {
        await (method as () => Promise<void>).call(engine);
        return;
      }
    }
    await engine.play(effect);
  };

  const onPointerdown = () => {
    isLongPress = false;
    if (config.onLongPress) {
      pressTimer = setTimeout(() => {
        isLongPress = true;
        if (config.onLongPress) playEffect(config.onLongPress);
      }, threshold);
    }
  };

  const onPointerup = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    if (!isLongPress && config.onTap) {
      playEffect(config.onTap);
    }
  };

  const onPointercancel = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  const handlers: Record<string, () => void> = {
    pointerdown: onPointerdown,
    pointerup: onPointerup,
    pointercancel: onPointercancel,
  };

  if (config.onHover) {
    handlers.pointerenter = () => {
      if (config.onHover) playEffect(config.onHover);
    };
  }

  onUnmounted(() => {
    if (pressTimer) clearTimeout(pressTimer);
  });

  return handlers;
}
