import { presets } from '@feelback/core';
import { summarize } from '../utils/visualizer';

export function list(category?: string): string {
  const lines: string[] = [];

  const categories = category
    ? { [category]: (presets as Record<string, Record<string, { name: string; steps: Array<{ type: string; duration: number; intensity: number }> }>>)[category] }
    : presets;

  for (const [catName, catPresets] of Object.entries(categories)) {
    if (!catPresets) {
      lines.push(`Unknown category: ${catName}`);
      lines.push(`Available: ${Object.keys(presets).join(', ')}`);
      continue;
    }

    lines.push(`\n  ${catName.toUpperCase()}`);
    lines.push(`  ${'─'.repeat(40)}`);

    for (const [name, preset] of Object.entries(catPresets as Record<string, { name: string; steps: Array<{ type: 'vibrate' | 'pause'; duration: number; intensity: number }> }>)) {
      lines.push(`  ${name.padEnd(20)} ${summarize(preset.steps)}`);
    }
  }

  return lines.join('\n');
}
