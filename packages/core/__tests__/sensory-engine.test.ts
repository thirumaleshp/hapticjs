import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SensoryEngine } from '../src/engine/sensory-engine';

// Mock navigator.vibrate
Object.defineProperty(globalThis.navigator, 'vibrate', {
  value: vi.fn(() => true),
  writable: true,
  configurable: true,
});

describe('SensoryEngine', () => {
  let engine: SensoryEngine;

  beforeEach(() => {
    engine = SensoryEngine.create();
    vi.clearAllMocks();
  });

  afterEach(() => {
    engine.dispose();
  });

  describe('factory', () => {
    it('creates an instance via SensoryEngine.create()', () => {
      expect(engine).toBeInstanceOf(SensoryEngine);
    });

    it('creates an instance via constructor', () => {
      const e = new SensoryEngine();
      expect(e).toBeInstanceOf(SensoryEngine);
      e.dispose();
    });
  });

  describe('accessors', () => {
    it('exposes haptic engine', () => {
      expect(engine.haptic).toBeDefined();
    });

    it('exposes sound engine', () => {
      expect(engine.sound).toBeDefined();
    });

    it('exposes visual engine', () => {
      expect(engine.visual).toBeDefined();
    });

    it('exposes theme manager', () => {
      expect(engine.themes).toBeDefined();
    });
  });

  describe('multi-sensory API', () => {
    it('tap() resolves without error', async () => {
      await expect(engine.tap()).resolves.toBeUndefined();
    });

    it('success() resolves without error', async () => {
      await expect(engine.success()).resolves.toBeUndefined();
    });

    it('error() resolves without error', async () => {
      await expect(engine.error()).resolves.toBeUndefined();
    });

    it('warning() resolves without error', async () => {
      await expect(engine.warning()).resolves.toBeUndefined();
    });

    it('selection() resolves without error', async () => {
      await expect(engine.selection()).resolves.toBeUndefined();
    });

    it('toggle(true) resolves without error', async () => {
      await expect(engine.toggle(true)).resolves.toBeUndefined();
    });

    it('toggle(false) resolves without error', async () => {
      await expect(engine.toggle(false)).resolves.toBeUndefined();
    });

    it('play() with HPL string resolves without error', async () => {
      await expect(engine.play('~~..##')).resolves.toBeUndefined();
    });
  });

  describe('setTheme()', () => {
    it('accepts a theme name string', () => {
      expect(() => engine.setTheme('gaming')).not.toThrow();
    });

    it('accepts a theme preset object', () => {
      expect(() =>
        engine.setTheme({
          name: 'custom',
          hapticIntensity: 0.8,
          soundEnabled: true,
          soundVolume: 0.5,
          visualEnabled: true,
          visualStyle: 'pulse',
          colors: {
            primary: '#fff',
            success: '#0f0',
            error: '#f00',
            warning: '#ff0',
          },
        }),
      ).not.toThrow();
    });
  });

  describe('configure()', () => {
    it('reconfigures haptic options', () => {
      expect(() => engine.configure({ haptic: { intensity: 0.5 } })).not.toThrow();
    });

    it('reconfigures sound options', () => {
      expect(() => engine.configure({ sound: { enabled: false } })).not.toThrow();
    });

    it('reconfigures visual options', () => {
      expect(() => engine.configure({ visual: { enabled: false } })).not.toThrow();
    });

    it('reconfigures theme', () => {
      expect(() => engine.configure({ theme: 'minimal' })).not.toThrow();
    });
  });

  describe('dispose()', () => {
    it('cleans up without error', () => {
      expect(() => engine.dispose()).not.toThrow();
    });

    it('can be called multiple times safely', () => {
      engine.dispose();
      expect(() => engine.dispose()).not.toThrow();
    });
  });

  describe('theme integration', () => {
    it('silent theme disables sound', () => {
      engine.setTheme('silent');
      const theme = engine.themes.getTheme();
      expect(theme.soundEnabled).toBe(false);
    });

    it('gaming theme sets high intensity', () => {
      engine.setTheme('gaming');
      const theme = engine.themes.getTheme();
      expect(theme.hapticIntensity).toBeGreaterThanOrEqual(0.8);
    });
  });
});
