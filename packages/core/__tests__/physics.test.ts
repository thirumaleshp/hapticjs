import { describe, it, expect } from 'vitest';
import {
  spring,
  bounce,
  friction,
  impact,
  gravity,
  elastic,
  wave,
  pendulum,
  physics,
} from '../src/physics';

const physicsFunctions = {
  spring,
  bounce,
  friction,
  impact,
  gravity,
  elastic,
  wave,
  pendulum,
};

describe('Physics patterns', () => {
  it('exports all functions via physics object', () => {
    expect(physics.spring).toBe(spring);
    expect(physics.bounce).toBe(bounce);
    expect(physics.friction).toBe(friction);
    expect(physics.impact).toBe(impact);
    expect(physics.gravity).toBe(gravity);
    expect(physics.elastic).toBe(elastic);
    expect(physics.wave).toBe(wave);
    expect(physics.pendulum).toBe(pendulum);
  });

  describe.each(Object.entries(physicsFunctions))('%s', (name, fn) => {
    it('returns a valid HapticPattern with default options', () => {
      const pattern = fn();
      expect(pattern.name).toBe(`physics.${name}`);
      expect(pattern.steps).toBeInstanceOf(Array);
      expect(pattern.steps.length).toBeGreaterThan(0);
    });

    it('has steps with valid durations (>0) and intensities (0-1)', () => {
      const pattern = fn();
      for (const step of pattern.steps) {
        expect(step.type).toMatch(/^(vibrate|pause)$/);
        expect(step.duration).toBeGreaterThan(0);
        expect(step.intensity).toBeGreaterThanOrEqual(0);
        expect(step.intensity).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('spring options', () => {
    it('higher stiffness produces more steps', () => {
      const low = spring({ stiffness: 0.5 });
      const high = spring({ stiffness: 1.0 });
      expect(high.steps.length).toBeGreaterThanOrEqual(low.steps.length);
    });

    it('respects custom duration', () => {
      const pattern = spring({ duration: 1000 });
      const totalDuration = pattern.steps.reduce((sum, s) => sum + s.duration, 0);
      // Total should be roughly near the requested duration
      expect(totalDuration).toBeGreaterThan(500);
    });
  });

  describe('bounce options', () => {
    it('more bounces produce more steps', () => {
      const few = bounce({ bounces: 3 });
      const many = bounce({ bounces: 8 });
      expect(many.steps.length).toBeGreaterThan(few.steps.length);
    });

    it('first bounce is the strongest', () => {
      const pattern = bounce();
      const vibrateSteps = pattern.steps.filter((s) => s.type === 'vibrate');
      expect(vibrateSteps[0].intensity).toBeGreaterThan(
        vibrateSteps[vibrateSteps.length - 1].intensity,
      );
    });
  });

  describe('friction options', () => {
    it('higher speed produces more pulses', () => {
      const slow = friction({ speed: 0.1 });
      const fast = friction({ speed: 1.0 });
      expect(fast.steps.length).toBeGreaterThan(slow.steps.length);
    });
  });

  describe('impact options', () => {
    it('higher hardness produces more resonance steps', () => {
      const soft = impact({ hardness: 0.1 });
      const hard = impact({ hardness: 1.0 });
      expect(hard.steps.length).toBeGreaterThan(soft.steps.length);
    });

    it('first step is the strongest', () => {
      const pattern = impact();
      const vibrateSteps = pattern.steps.filter((s) => s.type === 'vibrate');
      expect(vibrateSteps[0].intensity).toBeGreaterThan(vibrateSteps[1].intensity);
    });
  });

  describe('gravity options', () => {
    it('intensity increases over time', () => {
      const pattern = gravity();
      const intensities = pattern.steps.map((s) => s.intensity);
      // Last should be higher than first
      expect(intensities[intensities.length - 1]).toBeGreaterThan(intensities[0]);
    });
  });

  describe('elastic options', () => {
    it('snap step has high intensity', () => {
      const pattern = elastic();
      const vibrateSteps = pattern.steps.filter((s) => s.type === 'vibrate');
      // The snap (second to last or near end) should be strong
      const maxIntensity = Math.max(...vibrateSteps.map((s) => s.intensity));
      expect(maxIntensity).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('wave options', () => {
    it('more cycles produce more steps', () => {
      const one = wave({ cycles: 1 });
      const three = wave({ cycles: 3 });
      expect(three.steps.length).toBeGreaterThan(one.steps.length);
    });
  });

  describe('pendulum options', () => {
    it('more swings produce more steps', () => {
      const few = pendulum({ swings: 2 });
      const many = pendulum({ swings: 5 });
      expect(many.steps.length).toBeGreaterThan(few.steps.length);
    });
  });
});
