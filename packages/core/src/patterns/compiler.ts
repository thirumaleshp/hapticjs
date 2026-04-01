import type { HapticStep } from '../types/haptic-effect';
import type { HPLNode, HPLSequenceNode } from '../types/pattern';

/**
 * Compiles an HPL AST into a flat array of HapticSteps.
 * Handles group expansion, sustain merging, and repeat unrolling.
 */
export function compile(ast: HPLSequenceNode): HapticStep[] {
  const raw = compileNode(ast);
  return mergeSustains(raw);
}

function compileNode(node: HPLNode): HapticStep[] {
  switch (node.type) {
    case 'vibrate':
      return [{ type: 'vibrate', duration: node.duration, intensity: node.intensity }];

    case 'pause':
      return [{ type: 'pause', duration: node.duration, intensity: 0 }];

    case 'tap':
      return [{ type: 'vibrate', duration: node.duration, intensity: node.intensity }];

    case 'sustain':
      // Sustain is a marker — it extends the previous step during merge
      return [{ type: 'vibrate', duration: node.extension, intensity: -1 }]; // sentinel

    case 'group': {
      const groupSteps = node.children.flatMap(compileNode);
      const result: HapticStep[] = [];
      for (let i = 0; i < node.repeat; i++) {
        result.push(...groupSteps.map((s) => ({ ...s })));
      }
      return result;
    }

    case 'sequence':
      return node.children.flatMap(compileNode);
  }
}

/**
 * Merge sustain markers (-) into the preceding step.
 * A sustain with intensity=-1 extends the previous vibrate's duration.
 */
function mergeSustains(steps: HapticStep[]): HapticStep[] {
  const result: HapticStep[] = [];

  for (const step of steps) {
    if (step.intensity === -1 && result.length > 0) {
      // Sustain — extend previous step
      const prev = result[result.length - 1]!;
      prev.duration += step.duration;
    } else {
      result.push({ ...step });
    }
  }

  return result;
}

/**
 * Optimize a step sequence by merging adjacent same-type steps.
 */
export function optimizeSteps(steps: HapticStep[]): HapticStep[] {
  if (steps.length === 0) return [];

  const result: HapticStep[] = [{ ...steps[0]! }];

  for (let i = 1; i < steps.length; i++) {
    const current = steps[i]!;
    const prev = result[result.length - 1]!;

    // Merge adjacent pauses
    if (current.type === 'pause' && prev.type === 'pause') {
      prev.duration += current.duration;
      continue;
    }

    // Merge adjacent vibrates with same intensity
    if (
      current.type === 'vibrate' &&
      prev.type === 'vibrate' &&
      Math.abs(current.intensity - prev.intensity) < 0.01
    ) {
      prev.duration += current.duration;
      continue;
    }

    result.push({ ...current });
  }

  return result;
}
