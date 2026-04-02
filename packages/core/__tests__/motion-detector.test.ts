import { describe, it, expect } from 'vitest';
import { MotionDetector } from '../src/motion/motion-detector';

describe('MotionDetector', () => {
  describe('constructor', () => {
    it('does not throw', () => {
      expect(() => new MotionDetector()).not.toThrow();
    });

    it('accepts custom options', () => {
      expect(
        () => new MotionDetector({ shakeThreshold: 20, tiltThreshold: 15 }),
      ).not.toThrow();
    });
  });

  describe('isSupported', () => {
    it('returns a boolean', () => {
      const detector = new MotionDetector();
      expect(typeof detector.isSupported).toBe('boolean');
    });
  });

  describe('isListening', () => {
    it('starts as false', () => {
      const detector = new MotionDetector();
      expect(detector.isListening).toBe(false);
    });
  });

  describe('start/stop', () => {
    it('start does not throw when unsupported', () => {
      const detector = new MotionDetector();
      expect(() => detector.start()).not.toThrow();
    });

    it('stop does not throw when unsupported', () => {
      const detector = new MotionDetector();
      expect(() => detector.stop()).not.toThrow();
    });

    it('stop does not throw when not started', () => {
      const detector = new MotionDetector();
      expect(() => detector.stop()).not.toThrow();
    });
  });

  describe('callback registration', () => {
    it('onShake registers callback without error', () => {
      const detector = new MotionDetector();
      expect(() => detector.onShake(() => {})).not.toThrow();
    });

    it('onTilt registers callback without error', () => {
      const detector = new MotionDetector();
      expect(() => detector.onTilt(() => {})).not.toThrow();
    });

    it('onRotation registers callback without error', () => {
      const detector = new MotionDetector();
      expect(() => detector.onRotation(() => {})).not.toThrow();
    });

    it('onFlip registers callback without error', () => {
      const detector = new MotionDetector();
      expect(() => detector.onFlip(() => {})).not.toThrow();
    });
  });

  describe('requestPermission', () => {
    it('returns a boolean', async () => {
      const detector = new MotionDetector();
      const result = await detector.requestPermission();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('dispose', () => {
    it('cleans up without error', () => {
      const detector = new MotionDetector();
      detector.onShake(() => {});
      detector.onTilt(() => {});
      expect(() => detector.dispose()).not.toThrow();
    });
  });
});
