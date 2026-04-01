import { useCallback, useRef } from 'react';
import type { SemanticEffect } from '@hapticjs/core';
import { useHapticEngine } from '../context/haptic-provider';

export interface HapticGestureConfig {
  /** Effect to play on tap/click */
  onTap?: SemanticEffect | string;
  /** Effect to play on long press (>500ms) */
  onLongPress?: SemanticEffect | string;
  /** Effect to play on pointer enter (hover) */
  onHover?: SemanticEffect | string;
  /** Long press threshold in ms */
  longPressThreshold?: number;
}

/**
 * Hook that binds haptic feedback to pointer/touch gestures.
 *
 * Usage:
 *   const gestureProps = useHapticGesture({
 *     onTap: 'tap',
 *     onLongPress: 'heavy',
 *   });
 *   <div {...gestureProps}>Press me</div>
 */
export function useHapticGesture(config: HapticGestureConfig) {
  const engine = useHapticEngine();
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const threshold = config.longPressThreshold ?? 500;

  const playEffect = useCallback(
    async (effect: SemanticEffect | string) => {
      if (effect in engine) {
        const method = engine[effect as keyof typeof engine];
        if (typeof method === 'function') {
          await (method as () => Promise<void>).call(engine);
          return;
        }
      }
      await engine.play(effect);
    },
    [engine],
  );

  const onPointerDown = useCallback(() => {
    isLongPress.current = false;

    if (config.onLongPress) {
      pressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        if (config.onLongPress) {
          playEffect(config.onLongPress);
        }
      }, threshold);
    }
  }, [config.onLongPress, threshold, playEffect]);

  const onPointerUp = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    if (!isLongPress.current && config.onTap) {
      playEffect(config.onTap);
    }
  }, [config.onTap, playEffect]);

  const onPointerCancel = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const onPointerEnter = useCallback(() => {
    if (config.onHover) {
      playEffect(config.onHover);
    }
  }, [config.onHover, playEffect]);

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    ...(config.onHover ? { onPointerEnter } : {}),
  };
}
