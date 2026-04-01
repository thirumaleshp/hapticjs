import type { Directive, DirectiveBinding } from 'vue';
import { HapticEngine } from '@hapticjs/core';
import type { SemanticEffect } from '@hapticjs/core';

type HapticDirectiveValue = SemanticEffect | string;

let sharedEngine: HapticEngine | null = null;

function getEngine(): HapticEngine {
  if (!sharedEngine) {
    sharedEngine = HapticEngine.create();
  }
  return sharedEngine;
}

async function playEffect(effect: string): Promise<void> {
  const engine = getEngine();
  if (effect in engine) {
    const method = engine[effect as keyof typeof engine];
    if (typeof method === 'function') {
      await (method as () => Promise<void>).call(engine);
      return;
    }
  }
  await engine.play(effect);
}

const handlerMap = new WeakMap<HTMLElement, () => void>();

/**
 * Vue directive for haptic feedback on click.
 *
 * Usage:
 *   <button v-haptic="'tap'">Click me</button>
 *   <button v-haptic="'success'">Submit</button>
 *   <button v-haptic="'~~..##'">Custom pattern</button>
 */
export const vHaptic: Directive<HTMLElement, HapticDirectiveValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<HapticDirectiveValue>) {
    const effect = binding.value || 'tap';
    const handler = () => playEffect(effect);
    handlerMap.set(el, handler);
    el.addEventListener('pointerdown', handler);
  },

  updated(el: HTMLElement, binding: DirectiveBinding<HapticDirectiveValue>) {
    // Remove old handler
    const oldHandler = handlerMap.get(el);
    if (oldHandler) {
      el.removeEventListener('pointerdown', oldHandler);
    }

    // Add new handler
    const effect = binding.value || 'tap';
    const handler = () => playEffect(effect);
    handlerMap.set(el, handler);
    el.addEventListener('pointerdown', handler);
  },

  unmounted(el: HTMLElement) {
    const handler = handlerMap.get(el);
    if (handler) {
      el.removeEventListener('pointerdown', handler);
      handlerMap.delete(el);
    }
  },
};
