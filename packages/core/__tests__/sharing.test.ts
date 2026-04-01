import { describe, it, expect } from 'vitest';
import type { HapticStep } from '../src/types/haptic-effect';
import type { HapticPatternExport } from '../src/patterns/sharing';
import {
  exportPattern,
  importPattern,
  patternToJSON,
  patternFromJSON,
  patternToDataURL,
  patternFromDataURL,
} from '../src/patterns/sharing';

const sampleSteps: HapticStep[] = [
  { type: 'vibrate', duration: 50, intensity: 0.3 },
  { type: 'pause', duration: 50, intensity: 0 },
  { type: 'vibrate', duration: 50, intensity: 1.0 },
];

describe('exportPattern', () => {
  it('exports from HapticStep[]', () => {
    const result = exportPattern(sampleSteps, { name: 'Test' });

    expect(result.version).toBe(1);
    expect(result.name).toBe('Test');
    expect(result.steps).toEqual(sampleSteps);
    expect(result.metadata?.duration).toBe(150);
  });

  it('exports from HPL string', () => {
    const result = exportPattern('~.@', { name: 'HPL Pattern' });

    expect(result.version).toBe(1);
    expect(result.name).toBe('HPL Pattern');
    expect(result.hpl).toBe('~.@');
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0]).toMatchObject({ type: 'vibrate', intensity: 0.3 });
    expect(result.steps[1]).toMatchObject({ type: 'pause' });
    expect(result.steps[2]).toMatchObject({ type: 'vibrate', intensity: 1.0 });
  });

  it('exports from HapticPattern', () => {
    const result = exportPattern(
      { name: 'My Pattern', steps: sampleSteps },
      { description: 'A test', author: 'tester', tags: ['demo'] },
    );

    expect(result.name).toBe('My Pattern');
    expect(result.description).toBe('A test');
    expect(result.metadata?.author).toBe('tester');
    expect(result.metadata?.tags).toEqual(['demo']);
    expect(result.metadata?.createdAt).toBeDefined();
  });

  it('uses "Untitled Pattern" as default name', () => {
    const result = exportPattern(sampleSteps);
    expect(result.name).toBe('Untitled Pattern');
  });

  it('options name overrides pattern name', () => {
    const result = exportPattern(
      { name: 'Original', steps: sampleSteps },
      { name: 'Override' },
    );
    expect(result.name).toBe('Override');
  });
});

describe('importPattern', () => {
  it('imports a valid HapticPatternExport object', () => {
    const exported = exportPattern(sampleSteps, { name: 'Import Test' });
    const pattern = importPattern(exported);

    expect(pattern.name).toBe('Import Test');
    expect(pattern.steps).toEqual(sampleSteps);
  });

  it('imports from a JSON string', () => {
    const json = JSON.stringify({
      version: 1,
      name: 'JSON Import',
      steps: sampleSteps,
    });
    const pattern = importPattern(json);

    expect(pattern.name).toBe('JSON Import');
    expect(pattern.steps).toEqual(sampleSteps);
  });

  it('throws on missing version', () => {
    expect(() =>
      importPattern({ name: 'Bad', steps: [] } as unknown as HapticPatternExport),
    ).toThrow('Unsupported pattern version');
  });

  it('throws on wrong version', () => {
    expect(() =>
      importPattern({ version: 2, name: 'Bad', steps: [] } as unknown as HapticPatternExport),
    ).toThrow('Unsupported pattern version: 2');
  });

  it('throws on missing name', () => {
    expect(() =>
      importPattern({ version: 1, steps: [] } as unknown as HapticPatternExport),
    ).toThrow('"name" must be a non-empty string');
  });

  it('throws on missing steps', () => {
    expect(() =>
      importPattern({ version: 1, name: 'Bad' } as unknown as HapticPatternExport),
    ).toThrow('"steps" must be an array');
  });

  it('throws on invalid step type', () => {
    expect(() =>
      importPattern({
        version: 1,
        name: 'Bad',
        steps: [{ type: 'buzz', duration: 50, intensity: 0.5 }],
      } as unknown as HapticPatternExport),
    ).toThrow('Invalid step at index 0');
  });

  it('throws on invalid step intensity', () => {
    expect(() =>
      importPattern({
        version: 1,
        name: 'Bad',
        steps: [{ type: 'vibrate', duration: 50, intensity: 2.0 }],
      } as unknown as HapticPatternExport),
    ).toThrow('Invalid step at index 0');
  });

  it('throws on non-object input', () => {
    expect(() => importPattern(42 as unknown as HapticPatternExport)).toThrow(
      'expected an object',
    );
  });
});

describe('round-trip: export → import', () => {
  it('preserves steps through round-trip', () => {
    const exported = exportPattern(sampleSteps, { name: 'Round Trip' });
    const pattern = importPattern(exported);

    expect(pattern.steps).toEqual(sampleSteps);
  });

  it('preserves HPL-compiled steps through round-trip', () => {
    const exported = exportPattern('~~..@@', { name: 'HPL RT' });
    const pattern = importPattern(exported);

    expect(pattern.steps).toHaveLength(6);
    expect(pattern.steps[0]).toMatchObject({ type: 'vibrate', intensity: 0.3 });
    expect(pattern.steps[4]).toMatchObject({ type: 'vibrate', intensity: 1.0 });
  });
});

describe('patternToJSON / patternFromJSON', () => {
  it('round-trips through JSON string', () => {
    const json = patternToJSON(sampleSteps, { name: 'JSON RT' });
    expect(typeof json).toBe('string');

    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.name).toBe('JSON RT');

    const pattern = patternFromJSON(json);
    expect(pattern.steps).toEqual(sampleSteps);
  });

  it('produces pretty-printed JSON', () => {
    const json = patternToJSON(sampleSteps, { name: 'Pretty' });
    expect(json).toContain('\n');
    expect(json).toContain('  ');
  });
});

describe('patternToDataURL / patternFromDataURL', () => {
  it('round-trips through data URL', () => {
    const url = patternToDataURL(sampleSteps, { name: 'Data URL RT' });

    expect(url).toMatch(/^data:application\/haptic\+json;base64,/);

    const pattern = patternFromDataURL(url);
    expect(pattern.name).toBe('Data URL RT');
    expect(pattern.steps).toEqual(sampleSteps);
  });

  it('round-trips HPL patterns through data URL', () => {
    const url = patternToDataURL('#..@', { name: 'HPL Data URL' });
    const pattern = patternFromDataURL(url);

    expect(pattern.steps).toHaveLength(4);
    expect(pattern.steps[0]).toMatchObject({ type: 'vibrate', intensity: 0.6 });
  });

  it('throws on invalid data URL prefix', () => {
    expect(() => patternFromDataURL('data:text/plain;base64,abc')).toThrow(
      'Invalid haptic data URL',
    );
  });

  it('throws on completely invalid URL', () => {
    expect(() => patternFromDataURL('https://example.com')).toThrow(
      'Invalid haptic data URL',
    );
  });
});
