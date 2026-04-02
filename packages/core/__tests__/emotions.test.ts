import { describe, it, expect } from 'vitest';
import { emotions } from '../src/presets/emotions';

const EMOTION_NAMES = [
  'excited',
  'calm',
  'tense',
  'happy',
  'sad',
  'angry',
  'surprised',
  'anxious',
  'confident',
  'playful',
  'romantic',
  'peaceful',
] as const;

describe('Emotion presets', () => {
  it('exports all 12 emotions', () => {
    expect(Object.keys(emotions)).toHaveLength(12);
    for (const name of EMOTION_NAMES) {
      expect(emotions[name]).toBeDefined();
    }
  });

  describe.each(EMOTION_NAMES)('%s', (name) => {
    it('has a valid name', () => {
      expect(emotions[name].name).toBe(`emotions.${name}`);
    });

    it('has non-empty steps', () => {
      expect(emotions[name].steps).toBeInstanceOf(Array);
      expect(emotions[name].steps.length).toBeGreaterThan(0);
    });

    it('all steps have valid structure', () => {
      for (const step of emotions[name].steps) {
        expect(step.type).toMatch(/^(vibrate|pause)$/);
        expect(step.duration).toBeGreaterThan(0);
        expect(step.intensity).toBeGreaterThanOrEqual(0);
        expect(step.intensity).toBeLessThanOrEqual(1);
      }
    });

    it('all durations are >= 25ms for Android compatibility', () => {
      for (const step of emotions[name].steps) {
        expect(step.duration).toBeGreaterThanOrEqual(25);
      }
    });
  });
});
