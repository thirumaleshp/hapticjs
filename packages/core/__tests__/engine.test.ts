import { describe, it, expect, beforeEach } from 'vitest';
import { HapticEngine } from '../src/engine/haptic-engine';
import { MockAdapter } from './helpers/mock-adapter';

describe('HapticEngine', () => {
  let mock: MockAdapter;
  let engine: HapticEngine;

  beforeEach(() => {
    mock = new MockAdapter();
    engine = new HapticEngine({ adapter: mock });
  });

  describe('semantic API', () => {
    it('tap() produces a short vibration', async () => {
      await engine.tap();
      expect(mock.history.length).toBeGreaterThan(0);
      expect(mock.history[0]!.type).toBe('vibrate');
      expect(mock.history[0]!.duration).toBeLessThanOrEqual(20);
    });

    it('doubleTap() produces two vibrations with a pause', async () => {
      await engine.doubleTap();
      const vibrations = mock.history.filter((s) => s.type === 'vibrate');
      expect(vibrations.length).toBe(2);
    });

    it('success() produces ascending pattern', async () => {
      await engine.success();
      const vibrations = mock.history.filter((s) => s.type === 'vibrate');
      expect(vibrations.length).toBe(2);
      expect(vibrations[1]!.intensity).toBeGreaterThan(vibrations[0]!.intensity);
    });

    it('warning() produces three even pulses', async () => {
      await engine.warning();
      const vibrations = mock.history.filter((s) => s.type === 'vibrate');
      expect(vibrations.length).toBe(3);
    });

    it('error() produces two heavy pulses', async () => {
      await engine.error();
      const vibrations = mock.history.filter((s) => s.type === 'vibrate');
      expect(vibrations.length).toBe(2);
      expect(vibrations[0]!.intensity).toBe(1.0);
    });

    it('selection() produces a very short subtle pulse', async () => {
      await engine.selection();
      expect(mock.history[0]!.duration).toBeLessThanOrEqual(10);
      expect(mock.history[0]!.intensity).toBeLessThan(0.5);
    });

    it('impact() with different styles varies intensity', async () => {
      await engine.impact('light');
      const lightIntensity = mock.history[0]!.intensity;
      mock.reset();

      await engine.impact('heavy');
      const heavyIntensity = mock.history[0]!.intensity;

      expect(heavyIntensity).toBeGreaterThan(lightIntensity);
    });

    it('toggle(true) is stronger than toggle(false)', async () => {
      await engine.toggle(true);
      const onIntensity = mock.history[0]!.intensity;
      mock.reset();

      await engine.toggle(false);
      const offIntensity = mock.history[0]!.intensity;

      expect(onIntensity).toBeGreaterThan(offIntensity);
    });
  });

  describe('parametric API', () => {
    it('vibrate() plays a custom duration', async () => {
      await engine.vibrate(200, 0.7);
      expect(mock.history[0]).toEqual(
        expect.objectContaining({ type: 'vibrate', duration: 200, intensity: 0.7 }),
      );
    });

    it('play() accepts HPL string', async () => {
      await engine.play('~~');
      expect(mock.history.length).toBeGreaterThan(0);
    });

    it('play() accepts step array', async () => {
      await engine.play([
        { type: 'vibrate', duration: 50, intensity: 0.5 },
        { type: 'pause', duration: 50, intensity: 0 },
      ]);
      expect(mock.history).toHaveLength(2);
    });

    it('play() accepts HapticPattern object', async () => {
      await engine.play({
        name: 'test',
        steps: [{ type: 'vibrate', duration: 100, intensity: 1.0 }],
      });
      expect(mock.history).toHaveLength(1);
    });
  });

  describe('configuration', () => {
    it('respects enabled=false', async () => {
      engine.configure({ enabled: false });
      await engine.tap();
      expect(mock.history).toHaveLength(0);
    });

    it('applies global intensity multiplier', async () => {
      engine.configure({ intensity: 0.5 });
      await engine.vibrate(100, 1.0);
      expect(mock.history[0]!.intensity).toBe(0.5);
    });

    it('reports isSupported from adapter', () => {
      expect(engine.isSupported).toBe(true);

      const unsupported = new MockAdapter();
      Object.defineProperty(unsupported, 'supported', { value: false });
      const engine2 = new HapticEngine({ adapter: unsupported });
      expect(engine2.isSupported).toBe(false);
    });
  });

  describe('lifecycle', () => {
    it('cancel() forwards to adapter', () => {
      engine.cancel();
      expect(mock.cancelCount).toBe(1);
    });

    it('dispose() forwards to adapter', () => {
      engine.dispose();
      expect(mock.disposed).toBe(true);
    });
  });

  describe('composer integration', () => {
    it('compose() returns a PatternComposer that plays through the engine', async () => {
      await engine.compose().tap(0.5).pause(100).buzz(200).play();
      expect(mock.history.length).toBeGreaterThan(0);
    });
  });
});
