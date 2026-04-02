import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeManager, themes } from '../src/themes/theme-manager';
import type { ThemePreset } from '../src/themes/theme-manager';

describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    manager = new ThemeManager();
  });

  describe('built-in themes', () => {
    const expectedThemes = [
      'default',
      'gaming',
      'minimal',
      'luxury',
      'retro',
      'nature',
      'silent',
      'accessible',
    ];

    it('all built-in themes exist', () => {
      const available = manager.listThemes();
      for (const name of expectedThemes) {
        expect(available).toContain(name);
      }
    });

    it('themes object has all presets', () => {
      for (const name of expectedThemes) {
        expect(themes[name]).toBeDefined();
        expect(themes[name].name).toBe(name);
      }
    });

    it('each theme has required properties', () => {
      for (const name of expectedThemes) {
        const t = themes[name];
        expect(t.hapticIntensity).toBeGreaterThanOrEqual(0);
        expect(t.hapticIntensity).toBeLessThanOrEqual(1);
        expect(typeof t.soundEnabled).toBe('boolean');
        expect(t.soundVolume).toBeGreaterThanOrEqual(0);
        expect(t.soundVolume).toBeLessThanOrEqual(1);
        expect(typeof t.visualEnabled).toBe('boolean');
        expect(['flash', 'ripple', 'shake', 'glow', 'pulse']).toContain(t.visualStyle);
        expect(t.colors.primary).toBeTruthy();
        expect(t.colors.success).toBeTruthy();
        expect(t.colors.error).toBeTruthy();
        expect(t.colors.warning).toBeTruthy();
      }
    });

    it('silent theme disables sound and visual', () => {
      expect(themes.silent.soundEnabled).toBe(false);
      expect(themes.silent.visualEnabled).toBe(false);
    });

    it('gaming theme has max haptic intensity', () => {
      expect(themes.gaming.hapticIntensity).toBe(1.0);
    });

    it('accessible theme has strong haptic and clear sounds', () => {
      expect(themes.accessible.hapticIntensity).toBe(1.0);
      expect(themes.accessible.soundEnabled).toBe(true);
      expect(themes.accessible.soundVolume).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('setTheme / getTheme', () => {
    it('defaults to the "default" theme', () => {
      expect(manager.current).toBe('default');
      expect(manager.getTheme().name).toBe('default');
    });

    it('setTheme(name) switches to a built-in theme', () => {
      manager.setTheme('gaming');
      expect(manager.current).toBe('gaming');
      expect(manager.getTheme()).toEqual(themes.gaming);
    });

    it('setTheme(preset) applies a custom preset', () => {
      const custom: ThemePreset = {
        name: 'custom',
        hapticIntensity: 0.3,
        soundEnabled: true,
        soundVolume: 0.1,
        visualEnabled: false,
        visualStyle: 'glow',
        colors: {
          primary: '#fff',
          success: '#0f0',
          error: '#f00',
          warning: '#ff0',
        },
      };

      manager.setTheme(custom);
      expect(manager.current).toBe('custom');
      expect(manager.getTheme()).toEqual(custom);
    });

    it('throws for unknown theme name', () => {
      expect(() => manager.setTheme('nonexistent')).toThrow('Unknown theme');
    });
  });

  describe('registerTheme', () => {
    it('adds a custom theme to the registry', () => {
      const custom: ThemePreset = {
        name: 'neon',
        hapticIntensity: 0.9,
        soundEnabled: true,
        soundVolume: 0.7,
        visualEnabled: true,
        visualStyle: 'glow',
        colors: {
          primary: '#ff00ff',
          success: '#00ff00',
          error: '#ff0000',
          warning: '#ffff00',
        },
      };

      manager.registerTheme(custom);
      expect(manager.listThemes()).toContain('neon');

      // Can now set it by name
      manager.setTheme('neon');
      expect(manager.getTheme()).toEqual(custom);
    });
  });

  describe('listThemes', () => {
    it('returns all built-in theme names', () => {
      const list = manager.listThemes();
      expect(list.length).toBeGreaterThanOrEqual(8);
    });

    it('includes registered custom themes', () => {
      manager.registerTheme({
        name: 'test-theme',
        hapticIntensity: 0.5,
        soundEnabled: false,
        soundVolume: 0,
        visualEnabled: false,
        visualStyle: 'flash',
        colors: { primary: '#000', success: '#000', error: '#000', warning: '#000' },
      });

      expect(manager.listThemes()).toContain('test-theme');
    });
  });
});
