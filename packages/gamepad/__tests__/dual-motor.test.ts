import { describe, it, expect } from 'vitest';
import {
  defaultMotorMapping,
  equalMotorMapping,
  heavyMotorMapping,
} from '../src/utils/dual-motor';

describe('Motor Mappings', () => {
  describe('defaultMotorMapping', () => {
    it('maps zero intensity to zero', () => {
      const result = defaultMotorMapping(0);
      expect(result.weakMagnitude).toBe(0);
      expect(result.strongMagnitude).toBe(0);
    });

    it('maps full intensity to both motors', () => {
      const result = defaultMotorMapping(1.0);
      expect(result.weakMagnitude).toBe(1.0); // clamped
      expect(result.strongMagnitude).toBe(0.7);
    });

    it('light intensity favors weak motor', () => {
      const result = defaultMotorMapping(0.2);
      expect(result.weakMagnitude).toBeGreaterThan(result.strongMagnitude);
    });
  });

  describe('equalMotorMapping', () => {
    it('maps equally to both motors', () => {
      const result = equalMotorMapping(0.5);
      expect(result.weakMagnitude).toBe(0.5);
      expect(result.strongMagnitude).toBe(0.5);
    });
  });

  describe('heavyMotorMapping', () => {
    it('emphasizes strong motor', () => {
      const result = heavyMotorMapping(0.8);
      expect(result.strongMagnitude).toBeGreaterThan(result.weakMagnitude);
      expect(result.strongMagnitude).toBe(0.8);
    });
  });
});
