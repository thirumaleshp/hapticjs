import type { HapticStep } from '@feelback/core';

const BLOCK_CHARS = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

/**
 * Render an ASCII timeline visualization of a haptic pattern.
 */
export function visualize(steps: HapticStep[]): string {
  if (steps.length === 0) return '  (empty pattern)';

  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
  const width = Math.min(60, Math.max(20, Math.floor(totalDuration / 10)));

  // Build intensity timeline
  const timeline: number[] = new Array(width).fill(0);
  let currentMs = 0;

  for (const step of steps) {
    const startCol = Math.floor((currentMs / totalDuration) * width);
    const endCol = Math.floor(((currentMs + step.duration) / totalDuration) * width);

    for (let col = startCol; col < endCol && col < width; col++) {
      if (step.type === 'vibrate') {
        timeline[col] = Math.max(timeline[col]!, step.intensity);
      }
    }

    currentMs += step.duration;
  }

  // Render bars
  const bars = timeline.map((intensity) => {
    const idx = Math.round(intensity * (BLOCK_CHARS.length - 1));
    return BLOCK_CHARS[idx]!;
  });

  // Build output
  const lines: string[] = [];
  lines.push(`  Timeline (${totalDuration}ms total):`);
  lines.push('');
  lines.push(`  ${bars.join('')}`);
  lines.push(`  ${'0'.padEnd(Math.floor(width / 2))}${Math.floor(totalDuration / 2)}ms${' '.repeat(Math.max(0, width - Math.floor(width / 2) - String(Math.floor(totalDuration / 2)).length - 2))}${totalDuration}ms`);

  // Step breakdown
  lines.push('');
  lines.push('  Steps:');
  for (const step of steps) {
    if (step.type === 'vibrate') {
      const bar = BLOCK_CHARS[Math.round(step.intensity * (BLOCK_CHARS.length - 1))]!;
      lines.push(`    ${bar.repeat(3)} vibrate ${step.duration}ms @ ${Math.round(step.intensity * 100)}%`);
    } else {
      lines.push(`    ... pause ${step.duration}ms`);
    }
  }

  return lines.join('\n');
}

/**
 * Render a compact one-line summary of a pattern.
 */
export function summarize(steps: HapticStep[]): string {
  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
  const vibrations = steps.filter((s) => s.type === 'vibrate');
  const maxIntensity = Math.max(...vibrations.map((s) => s.intensity), 0);
  const avgIntensity = vibrations.length > 0
    ? vibrations.reduce((sum, s) => sum + s.intensity, 0) / vibrations.length
    : 0;

  return `${totalDuration}ms | ${vibrations.length} pulses | avg ${Math.round(avgIntensity * 100)}% | peak ${Math.round(maxIntensity * 100)}%`;
}
