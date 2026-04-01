import { parseHPL, compile, validateHPL } from '@hapticjs/core';
import { visualize } from '../utils/visualizer';

export function preview(pattern: string): string {
  const validation = validateHPL(pattern);
  if (!validation.valid) {
    return `Error: Invalid pattern\n${validation.errors.map((e) => `  - ${e}`).join('\n')}`;
  }

  try {
    const ast = parseHPL(pattern);
    const steps = compile(ast);
    return visualize(steps);
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}
