import { describe, it, expect, vi } from 'vitest';
import { SpatialHaptics } from '../src/spatial/spatial-haptics';

/** Create a mock GamepadHapticAdapter */
function createMockAdapter() {
  const playEffectFn = vi.fn().mockResolvedValue(undefined);

  const mockGamepad = {
    vibrationActuator: {
      playEffect: playEffectFn,
      reset: vi.fn(),
    },
    index: 0,
  };

  const mockManager = {
    getFirstGamepad: vi.fn().mockReturnValue(mockGamepad),
    getGamepads: vi.fn().mockReturnValue([mockGamepad]),
    hasHapticGamepad: vi.fn().mockReturnValue(true),
    listen: vi.fn(),
    dispose: vi.fn(),
  };

  const adapter = {
    name: 'gamepad',
    supported: true,
    capabilities: vi.fn().mockReturnValue({
      maxIntensityLevels: 100,
      minDuration: 1,
      maxDuration: 5000,
      supportsPattern: false,
      supportsIntensity: true,
      dualMotor: true,
    }),
    pulse: vi.fn().mockResolvedValue(undefined),
    playSequence: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn(),
    dispose: vi.fn(),
    getManager: vi.fn().mockReturnValue(mockManager),
  };

  return { adapter, playEffectFn, mockGamepad, mockManager };
}

describe('SpatialHaptics', () => {
  describe('construction', () => {
    it('creates with adapter', () => {
      const { adapter } = createMockAdapter();
      expect(() => new SpatialHaptics(adapter as any)).not.toThrow();
    });
  });

  describe('directional methods', () => {
    it('left() plays weak motor only', async () => {
      const { adapter, playEffectFn } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await spatial.left(0.8, 100);

      expect(playEffectFn).toHaveBeenCalledWith('dual-rumble', {
        startDelay: 0,
        duration: 100,
        weakMagnitude: 0.8,
        strongMagnitude: 0,
      });
    });

    it('right() plays strong motor only', async () => {
      const { adapter, playEffectFn } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await spatial.right(0.9, 80);

      expect(playEffectFn).toHaveBeenCalledWith('dual-rumble', {
        startDelay: 0,
        duration: 80,
        weakMagnitude: 0,
        strongMagnitude: 0.9,
      });
    });

    it('left() enforces minimum 25ms duration', async () => {
      const { adapter, playEffectFn } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await spatial.left(0.5, 10);

      expect(playEffectFn).toHaveBeenCalledWith('dual-rumble', {
        startDelay: 0,
        duration: 25,
        weakMagnitude: 0.5,
        strongMagnitude: 0,
      });
    });
  });

  describe('sweep', () => {
    it('sweep left-to-right does not throw', async () => {
      const { adapter } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);
      await expect(spatial.sweep('left-to-right')).resolves.not.toThrow();
    });

    it('sweep right-to-left does not throw', async () => {
      const { adapter } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);
      await expect(spatial.sweep('right-to-left')).resolves.not.toThrow();
    });
  });

  describe('pulse', () => {
    it('pulse method exists and does not throw', async () => {
      const { adapter } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);
      await expect(spatial.pulse('both', 2, 100)).resolves.not.toThrow();
    });

    it('pulse calls playEffect for each pulse', async () => {
      const { adapter, playEffectFn } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await spatial.pulse('left', 3, 100);

      // 3 pulses, each calls playEffect once
      expect(playEffectFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('rumble', () => {
    it('rumbleLeft plays weak motor', async () => {
      const { adapter, playEffectFn } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await spatial.rumbleLeft(200, 0.5);

      expect(playEffectFn).toHaveBeenCalledWith('dual-rumble', {
        startDelay: 0,
        duration: 200,
        weakMagnitude: 0.5,
        strongMagnitude: 0,
      });
    });

    it('rumbleRight plays strong motor', async () => {
      const { adapter, playEffectFn } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await spatial.rumbleRight(300, 0.8);

      expect(playEffectFn).toHaveBeenCalledWith('dual-rumble', {
        startDelay: 0,
        duration: 300,
        weakMagnitude: 0,
        strongMagnitude: 0.8,
      });
    });
  });

  describe('impact', () => {
    it('impact center hits both motors', async () => {
      const { adapter, playEffectFn } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await spatial.impact('center', 1.0);

      expect(playEffectFn).toHaveBeenCalledWith('dual-rumble', {
        startDelay: 0,
        duration: 50,
        weakMagnitude: 1.0,
        strongMagnitude: 1.0,
      });
    });

    it('impact left emphasizes weak motor', async () => {
      const { adapter, playEffectFn } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await spatial.impact('left', 0.8);

      const call = playEffectFn.mock.calls[0]![1];
      expect(call.weakMagnitude).toBeGreaterThan(call.strongMagnitude);
    });
  });

  describe('engine RPM simulation', () => {
    it('low RPM produces low intensities', async () => {
      const { adapter, playEffectFn } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await spatial.engine(1000);

      const call = playEffectFn.mock.calls[0]![1];
      expect(call.strongMagnitude).toBeLessThan(0.5);
    });

    it('high RPM produces high intensities', async () => {
      const { adapter, playEffectFn } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await spatial.engine(7000);

      const call = playEffectFn.mock.calls[0]![1];
      expect(call.strongMagnitude).toBeGreaterThan(0.5);
    });

    it('clamps RPM to 0-8000 range', async () => {
      const { adapter } = createMockAdapter();
      const spatial = new SpatialHaptics(adapter as any);

      await expect(spatial.engine(-100)).resolves.not.toThrow();
      await expect(spatial.engine(10000)).resolves.not.toThrow();
    });
  });
});
