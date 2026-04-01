import { validateHPL, parseHPL, compile } from '@hapticjs/core';
import { summarize } from '../utils/visualizer';

export function validate(pattern: string): string {
  const result = validateHPL(pattern);

  if (!result.valid) {
    const lines = ['Invalid pattern:', ...result.errors.map((e) => `  - ${e}`)];
    return lines.join('\n');
  }

  try {
    const ast = parseHPL(pattern);
    const steps = compile(ast);
    return `Valid pattern: ${summarize(steps)}`;
  } catch (err) {
    return `Parse error: ${err instanceof Error ? err.message : String(err)}`;
  }
}
