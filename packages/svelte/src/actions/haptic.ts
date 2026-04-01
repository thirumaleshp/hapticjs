import { HapticEngine } from '@hapticjs/core';
import type { SemanticEffect } from '@hapticjs/core';

type HapticActionParam = SemanticEffect | string;

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

/**
 * Svelte action for haptic feedback on interaction.
 *
 * Usage:
 *   <button use:haptic={'tap'}>Click me</button>
 *   <button use:haptic={'success'}>Submit</button>
 *   <button use:haptic={'~~..##'}>Custom pattern</button>
 */
export function haptic(node: HTMLElement, param: HapticActionParam = 'tap') {
  let currentEffect = param;

  const handler = () => {
    playEffect(currentEffect);
  };

  node.addEventListener('pointerdown', handler);

  return {
    update(newParam: HapticActionParam) {
      currentEffect = newParam;
    },
    destroy() {
      node.removeEventListener('pointerdown', handler);
    },
  };
}

/**
 * Svelte action for haptic feedback on hover.
 *
 * Usage:
 *   <div use:hapticHover={'selection'}>Hover me</div>
 */
export function hapticHover(node: HTMLElement, param: HapticActionParam = 'selection') {
  let currentEffect = param;

  const handler = () => {
    playEffect(currentEffect);
  };

  node.addEventListener('pointerenter', handler);

  return {
    update(newParam: HapticActionParam) {
      currentEffect = newParam;
    },
    destroy() {
      node.removeEventListener('pointerenter', handler);
    },
  };
}
