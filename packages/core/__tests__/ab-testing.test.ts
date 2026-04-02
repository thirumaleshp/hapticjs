import { describe, it, expect, beforeEach } from 'vitest';
import { HapticExperiment } from '../src/experiment';
import type { HapticStep } from '../src/types';

describe('HapticExperiment', () => {
  let experiment: HapticExperiment;

  beforeEach(() => {
    experiment = new HapticExperiment('checkout', {
      a: 'tap',
      b: 'success',
      c: '@@..##',
    });
  });

  it('has the correct name', () => {
    expect(experiment.name).toBe('checkout');
  });

  it('throws when created with no variants', () => {
    expect(() => new HapticExperiment('empty', {})).toThrow(
      'at least one variant',
    );
  });

  describe('assign', () => {
    it('returns a variant name', () => {
      const variant = experiment.assign('user-1');
      expect(['a', 'b', 'c']).toContain(variant);
    });

    it('returns consistent variant for the same userId', () => {
      const first = experiment.assign('user-42');
      const second = experiment.assign('user-42');
      expect(first).toBe(second);
    });

    it('can assign without a userId', () => {
      const variant = experiment.assign();
      expect(['a', 'b', 'c']).toContain(variant);
    });

    it('assigns different users (likely different variants with enough users)', () => {
      const variants = new Set<string>();
      for (let i = 0; i < 100; i++) {
        variants.add(experiment.assign(`user-${i}`));
      }
      // With 100 users and 3 variants, we should see at least 2 variants
      expect(variants.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getVariant', () => {
    it('returns the pattern for an assigned user', () => {
      experiment.assign('user-1');
      const pattern = experiment.getVariant('user-1');
      expect(pattern).toBeDefined();
      expect(['tap', 'success', '@@..##']).toContain(pattern);
    });

    it('returns undefined for unassigned user', () => {
      const pattern = experiment.getVariant('unknown');
      expect(pattern).toBeUndefined();
    });
  });

  describe('track', () => {
    it('records events for assigned users', () => {
      experiment.assign('user-1');
      experiment.track('user-1', 'click');
      experiment.track('user-1', 'conversion');

      const results = experiment.getResults();
      const variant = results[experiment.assign('user-1')];
      expect(variant.events['click']).toBe(1);
      expect(variant.events['conversion']).toBe(1);
    });

    it('ignores events for unassigned users', () => {
      experiment.track('ghost', 'click');
      const results = experiment.getResults();
      const totalEvents = Object.values(results).reduce(
        (sum, v) => sum + Object.values(v.events).reduce((s, c) => s + c, 0),
        0,
      );
      expect(totalEvents).toBe(0);
    });

    it('counts multiple events correctly', () => {
      experiment.assign('user-1');
      experiment.track('user-1', 'click');
      experiment.track('user-1', 'click');
      experiment.track('user-1', 'click');

      const results = experiment.getResults();
      const variant = results[experiment.assign('user-1')];
      expect(variant.events['click']).toBe(3);
    });
  });

  describe('getResults', () => {
    it('returns all variants with correct assignment counts', () => {
      experiment.assign('user-1');
      experiment.assign('user-2');
      experiment.assign('user-3');

      const results = experiment.getResults();
      expect(results.a).toBeDefined();
      expect(results.b).toBeDefined();
      expect(results.c).toBeDefined();

      const totalAssignments =
        results.a.assignments + results.b.assignments + results.c.assignments;
      expect(totalAssignments).toBe(3);
    });

    it('returns empty events for variants with no tracking', () => {
      const results = experiment.getResults();
      for (const variant of Object.values(results)) {
        expect(variant.events).toEqual({});
        expect(variant.assignments).toBe(0);
      }
    });
  });

  describe('reset', () => {
    it('clears all assignments and tracking data', () => {
      experiment.assign('user-1');
      experiment.assign('user-2');
      experiment.track('user-1', 'click');

      experiment.reset();

      const results = experiment.getResults();
      const totalAssignments = Object.values(results).reduce(
        (sum, v) => sum + v.assignments,
        0,
      );
      expect(totalAssignments).toBe(0);
    });

    it('allows re-assignment after reset', () => {
      const firstVariant = experiment.assign('user-1');
      experiment.reset();
      // After reset, the user may get a different or same variant
      const secondVariant = experiment.assign('user-1');
      expect(['a', 'b', 'c']).toContain(secondVariant);
    });
  });

  describe('with HapticStep[] variants', () => {
    it('works with step array variants', () => {
      const steps: HapticStep[] = [
        { type: 'vibrate', duration: 30, intensity: 0.5 },
      ];
      const exp = new HapticExperiment('test', {
        simple: steps,
        text: 'tap',
      });

      exp.assign('user-1');
      const pattern = exp.getVariant('user-1');
      expect(pattern).toBeDefined();
    });
  });
});
