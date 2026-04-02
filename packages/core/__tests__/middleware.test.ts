import { describe, it, expect, beforeEach } from 'vitest';
import {
  MiddlewareManager,
  intensityScaler,
  durationScaler,
  intensityClamper,
  patternRepeater,
  reverser,
  accessibilityBooster,
} from '../src/middleware';
import type { HapticStep } from '../src/types';

const makeSteps = (): HapticStep[] => [
  { type: 'vibrate', duration: 30, intensity: 0.5 },
  { type: 'pause', duration: 60, intensity: 0 },
  { type: 'vibrate', duration: 40, intensity: 0.8 },
];

describe('Middleware', () => {
  describe('intensityScaler', () => {
    it('scales intensities by the given factor', () => {
      const mw = intensityScaler(0.5);
      const result = mw.process(makeSteps());
      expect(result[0].intensity).toBeCloseTo(0.25);
      expect(result[1].intensity).toBe(0);
      expect(result[2].intensity).toBeCloseTo(0.4);
    });

    it('clamps intensity to 0-1', () => {
      const mw = intensityScaler(3);
      const result = mw.process(makeSteps());
      expect(result[0].intensity).toBe(1);
      expect(result[2].intensity).toBe(1);
    });

    it('does not go below 0', () => {
      const mw = intensityScaler(-1);
      const result = mw.process(makeSteps());
      expect(result[0].intensity).toBe(0);
    });
  });

  describe('durationScaler', () => {
    it('scales durations by the given factor', () => {
      const mw = durationScaler(2);
      const result = mw.process(makeSteps());
      expect(result[0].duration).toBe(60);
      expect(result[1].duration).toBe(120);
      expect(result[2].duration).toBe(80);
    });

    it('enforces minimum 20ms', () => {
      const mw = durationScaler(0.1);
      const result = mw.process(makeSteps());
      expect(result[0].duration).toBe(20);
      expect(result[2].duration).toBe(20);
    });
  });

  describe('intensityClamper', () => {
    it('clamps intensities to the given range', () => {
      const mw = intensityClamper(0.3, 0.6);
      const result = mw.process(makeSteps());
      expect(result[0].intensity).toBe(0.5);
      expect(result[1].intensity).toBe(0.3);
      expect(result[2].intensity).toBe(0.6);
    });
  });

  describe('patternRepeater', () => {
    it('repeats the pattern N times', () => {
      const mw = patternRepeater(3);
      const steps = [{ type: 'vibrate' as const, duration: 30, intensity: 0.5 }];
      const result = mw.process(steps);
      expect(result.length).toBe(3);
      expect(result[0]).toEqual(steps[0]);
      expect(result[1]).toEqual(steps[0]);
      expect(result[2]).toEqual(steps[0]);
    });

    it('does not share references between repeated steps', () => {
      const mw = patternRepeater(2);
      const steps = [{ type: 'vibrate' as const, duration: 30, intensity: 0.5 }];
      const result = mw.process(steps);
      result[0].intensity = 1.0;
      expect(result[1].intensity).toBe(0.5);
    });
  });

  describe('reverser', () => {
    it('reverses the step order', () => {
      const mw = reverser();
      const steps = makeSteps();
      const result = mw.process(steps);
      expect(result[0].duration).toBe(40);
      expect(result[1].duration).toBe(60);
      expect(result[2].duration).toBe(30);
    });

    it('does not mutate the original array', () => {
      const mw = reverser();
      const steps = makeSteps();
      mw.process(steps);
      expect(steps[0].duration).toBe(30);
    });
  });

  describe('accessibilityBooster', () => {
    it('increases intensities by 30%', () => {
      const mw = accessibilityBooster();
      const result = mw.process(makeSteps());
      expect(result[0].intensity).toBeCloseTo(0.65);
      expect(result[2].intensity).toBe(1); // 0.8 * 1.3 = 1.04 clamped to 1
    });

    it('increases durations by 20%', () => {
      const mw = accessibilityBooster();
      const result = mw.process(makeSteps());
      expect(result[0].duration).toBe(36); // 30 * 1.2
      expect(result[1].duration).toBe(72); // 60 * 1.2
      expect(result[2].duration).toBe(48); // 40 * 1.2
    });
  });

  describe('MiddlewareManager', () => {
    let manager: MiddlewareManager;

    beforeEach(() => {
      manager = new MiddlewareManager();
    });

    it('chains middleware in order', () => {
      manager.use(intensityScaler(0.5));
      manager.use(intensityClamper(0.3, 1.0));

      const steps: HapticStep[] = [
        { type: 'vibrate', duration: 30, intensity: 0.4 },
      ];

      const result = manager.process(steps);
      // 0.4 * 0.5 = 0.2, then clamped to 0.3
      expect(result[0].intensity).toBeCloseTo(0.3);
    });

    it('list() returns registered middleware names', () => {
      manager.use(intensityScaler(1));
      manager.use(reverser());
      expect(manager.list()).toEqual(['intensityScaler', 'reverser']);
    });

    it('remove() removes middleware by name', () => {
      manager.use(intensityScaler(0.5));
      manager.use(reverser());
      manager.remove('intensityScaler');
      expect(manager.list()).toEqual(['reverser']);
    });

    it('clear() removes all middleware', () => {
      manager.use(intensityScaler(1));
      manager.use(reverser());
      manager.clear();
      expect(manager.list()).toEqual([]);
    });

    it('process() returns steps unchanged when no middleware registered', () => {
      const steps = makeSteps();
      const result = manager.process(steps);
      expect(result).toEqual(steps);
    });
  });
});
