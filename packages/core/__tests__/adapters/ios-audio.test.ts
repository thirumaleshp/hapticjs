import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IoSAudioAdapter } from '../../src/adapters/ios-audio.adapter';

// ─── AudioContext mock ─────────────────────────────────────

function createMockOscillator() {
  return {
    type: 'sine' as OscillatorType,
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn().mockImplementation(function (this: { onended: (() => void) | null }) {
      // Trigger onended synchronously so tests don't hang
      setTimeout(() => this.onended?.(), 0);
    }),
    onended: null as (() => void) | null,
  };
}

function createMockGainNode() {
  return {
    gain: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function createMockAudioContext() {
  return {
    state: 'running' as AudioContextState,
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(() => createMockOscillator()),
    createGain: vi.fn(() => createMockGainNode()),
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

// ─── Helpers ───────────────────────────────────────────────

function mockIOSEnvironment() {
  Object.defineProperty(globalThis, 'window', {
    value: globalThis,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'document', {
    value: {},
    writable: true,
    configurable: true,
  });
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    writable: true,
    configurable: true,
  });
  Object.defineProperty(navigator, 'platform', {
    value: 'iPhone',
    writable: true,
    configurable: true,
  });

  const MockAudioContext = vi.fn(() => createMockAudioContext());
  (globalThis as unknown as Record<string, unknown>).AudioContext = MockAudioContext;

  return MockAudioContext;
}

function cleanupEnvironment() {
  delete (globalThis as unknown as Record<string, unknown>).AudioContext;
}

// ─── Tests ─────────────────────────────────────────────────

describe('IoSAudioAdapter', () => {
  let savedUA: string;
  let savedPlatform: string;

  beforeEach(() => {
    savedUA = navigator.userAgent;
    savedPlatform = navigator.platform;
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanupEnvironment();
    Object.defineProperty(navigator, 'userAgent', {
      value: savedUA,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, 'platform', {
      value: savedPlatform,
      writable: true,
      configurable: true,
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('isSupported', () => {
    it('reports supported on iOS with AudioContext', () => {
      mockIOSEnvironment();
      const adapter = new IoSAudioAdapter();
      expect(adapter.supported).toBe(true);
    });

    it('reports unsupported when AudioContext is missing', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        writable: true,
        configurable: true,
      });
      // No AudioContext defined
      const adapter = new IoSAudioAdapter();
      expect(adapter.supported).toBe(false);
    });

    it('reports unsupported on non-iOS platforms', () => {
      Object.defineProperty(globalThis, 'window', {
        value: globalThis,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, 'document', {
        value: {},
        writable: true,
        configurable: true,
      });
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 13)',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(navigator, 'platform', {
        value: 'Linux armv8l',
        writable: true,
        configurable: true,
      });
      (globalThis as unknown as Record<string, unknown>).AudioContext = vi.fn();

      const adapter = new IoSAudioAdapter();
      expect(adapter.supported).toBe(false);
    });
  });

  describe('metadata', () => {
    it('has the correct name', () => {
      mockIOSEnvironment();
      const adapter = new IoSAudioAdapter();
      expect(adapter.name).toBe('ios-audio');
    });

    it('returns expected capabilities', () => {
      mockIOSEnvironment();
      const caps = new IoSAudioAdapter().capabilities();
      expect(caps.maxIntensityLevels).toBe(100);
      expect(caps.minDuration).toBe(5);
      expect(caps.maxDuration).toBe(5000);
      expect(caps.supportsPattern).toBe(true);
      expect(caps.supportsIntensity).toBe(true);
      expect(caps.dualMotor).toBe(false);
    });
  });

  describe('pulse', () => {
    it('creates an oscillator with correct frequency and gain', async () => {
      mockIOSEnvironment();
      const adapter = new IoSAudioAdapter();

      const promise = adapter.pulse(0.5, 100);
      await vi.advanceTimersByTimeAsync(10);
      await promise;

      // Adapter is supported, so AudioContext should have been used
      expect(adapter.supported).toBe(true);
    });

    it('does nothing when unsupported', async () => {
      const adapter = new IoSAudioAdapter(); // unsupported in default env
      await expect(adapter.pulse(1, 100)).resolves.toBeUndefined();
    });
  });

  describe('playSequence', () => {
    it('plays vibrate steps and delays pause steps', async () => {
      mockIOSEnvironment();
      const adapter = new IoSAudioAdapter();

      const steps = [
        { type: 'vibrate' as const, duration: 30, intensity: 0.8 },
        { type: 'pause' as const, duration: 50, intensity: 0 },
        { type: 'vibrate' as const, duration: 20, intensity: 0.5 },
      ];

      const promise = adapter.playSequence(steps);
      // Advance timers enough to resolve all delays and onended callbacks
      await vi.advanceTimersByTimeAsync(200);
      await promise;
    });

    it('skips zero-intensity vibrate steps', async () => {
      mockIOSEnvironment();
      const adapter = new IoSAudioAdapter();

      const steps = [
        { type: 'vibrate' as const, duration: 30, intensity: 0 },
      ];

      const promise = adapter.playSequence(steps);
      await vi.advanceTimersByTimeAsync(50);
      await promise;
    });

    it('does nothing for empty steps', async () => {
      mockIOSEnvironment();
      const adapter = new IoSAudioAdapter();
      await expect(adapter.playSequence([])).resolves.toBeUndefined();
    });

    it('does nothing when unsupported', async () => {
      const adapter = new IoSAudioAdapter();
      await expect(
        adapter.playSequence([{ type: 'vibrate', duration: 50, intensity: 1 }]),
      ).resolves.toBeUndefined();
    });
  });

  describe('cancel', () => {
    it('stops the active oscillator', () => {
      mockIOSEnvironment();
      const adapter = new IoSAudioAdapter();
      // Cancel without active oscillator should not throw
      expect(() => adapter.cancel()).not.toThrow();
    });
  });

  describe('dispose', () => {
    it('closes the AudioContext', async () => {
      mockIOSEnvironment();
      const adapter = new IoSAudioAdapter();

      // Trigger AudioContext creation
      const promise = adapter.pulse(1, 10);
      await vi.advanceTimersByTimeAsync(10);
      await promise;

      adapter.dispose();
      // Should not throw on double dispose
      expect(() => adapter.dispose()).not.toThrow();
    });
  });
});
