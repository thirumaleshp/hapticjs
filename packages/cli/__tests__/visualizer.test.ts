import { describe, it, expect } from 'vitest';
import { visualize, summarize } from '../src/utils/visualizer';
import type { HapticStep } from '@vibejs/core';

describe('Visualizer', () => {
  it('handles empty pattern', () => {
    expect(visualize([])).toContain('empty');
  });

  it('renders single vibration', () => {
    const steps: HapticStep[] = [
      { type: 'vibrate', duration: 100, intensity: 1.0 },
    ];
    const result = visualize(steps);
    expect(result).toContain('100ms');
    expect(result).toContain('█');
  });

  it('renders pattern with pause', () => {
    const steps: HapticStep[] = [
      { type: 'vibrate', duration: 50, intensity: 0.5 },
      { type: 'pause', duration: 50, intensity: 0 },
      { type: 'vibrate', duration: 50, intensity: 1.0 },
    ];
    const result = visualize(steps);
    expect(result).toContain('150ms');
    expect(result).toContain('Steps:');
  });

  it('shows step breakdown', () => {
    const steps: HapticStep[] = [
      { type: 'vibrate', duration: 50, intensity: 0.5 },
      { type: 'pause', duration: 30, intensity: 0 },
    ];
    const result = visualize(steps);
    expect(result).toContain('vibrate');
    expect(result).toContain('pause');
  });
});

describe('Summarize', () => {
  it('summarizes a pattern', () => {
    const steps: HapticStep[] = [
      { type: 'vibrate', duration: 50, intensity: 0.5 },
      { type: 'pause', duration: 30, intensity: 0 },
      { type: 'vibrate', duration: 50, intensity: 1.0 },
    ];
    const result = summarize(steps);
    expect(result).toContain('130ms');
    expect(result).toContain('2 pulses');
    expect(result).toContain('peak 100%');
  });

  it('handles no vibrations', () => {
    const steps: HapticStep[] = [
      { type: 'pause', duration: 100, intensity: 0 },
    ];
    const result = summarize(steps);
    expect(result).toContain('0 pulses');
  });
});
