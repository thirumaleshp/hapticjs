import { describe, it, expect, beforeEach } from 'vitest';
import { ProfileManager, profiles } from '../src/profiles';
import type { IntensityProfile } from '../src/profiles';
import type { HapticStep } from '../src/types';

describe('Intensity Profiles', () => {
  describe('built-in profiles', () => {
    const expectedProfiles = ['off', 'subtle', 'normal', 'strong', 'intense', 'accessible'];

    it('all built-in profiles exist', () => {
      for (const name of expectedProfiles) {
        expect(profiles[name]).toBeDefined();
        expect(profiles[name].name).toBe(name);
      }
    });

    it('off profile disables everything', () => {
      const off = profiles.off;
      expect(off.hapticScale).toBe(0);
      expect(off.durationScale).toBe(0);
      expect(off.soundEnabled).toBe(false);
      expect(off.visualEnabled).toBe(false);
    });

    it('normal profile has scale 1.0', () => {
      const normal = profiles.normal;
      expect(normal.hapticScale).toBe(1.0);
      expect(normal.durationScale).toBe(1.0);
    });

    it('all profiles have hapticScale in 0-2 range', () => {
      for (const name of expectedProfiles) {
        expect(profiles[name].hapticScale).toBeGreaterThanOrEqual(0);
        expect(profiles[name].hapticScale).toBeLessThanOrEqual(2);
      }
    });

    it('all profiles have soundVolume in 0-1 range', () => {
      for (const name of expectedProfiles) {
        expect(profiles[name].soundVolume).toBeGreaterThanOrEqual(0);
        expect(profiles[name].soundVolume).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('ProfileManager', () => {
    let manager: ProfileManager;

    beforeEach(() => {
      manager = new ProfileManager();
    });

    it('defaults to normal profile', () => {
      expect(manager.current).toBe('normal');
      expect(manager.getProfile().name).toBe('normal');
    });

    it('setProfile(name) switches to a built-in profile', () => {
      manager.setProfile('strong');
      expect(manager.current).toBe('strong');
      expect(manager.getProfile()).toEqual(profiles.strong);
    });

    it('setProfile(object) applies a custom profile', () => {
      const custom: IntensityProfile = {
        name: 'custom',
        hapticScale: 0.3,
        durationScale: 0.5,
        soundEnabled: false,
        soundVolume: 0,
        visualEnabled: true,
      };
      manager.setProfile(custom);
      expect(manager.current).toBe('custom');
      expect(manager.getProfile()).toEqual(custom);
    });

    it('throws for unknown profile name', () => {
      expect(() => manager.setProfile('nonexistent')).toThrow('Unknown profile');
    });

    it('listProfiles() returns all built-in profile names', () => {
      const list = manager.listProfiles();
      expect(list).toContain('off');
      expect(list).toContain('subtle');
      expect(list).toContain('normal');
      expect(list).toContain('strong');
      expect(list).toContain('intense');
      expect(list).toContain('accessible');
    });

    it('registerProfile() adds a custom profile', () => {
      const custom: IntensityProfile = {
        name: 'mega',
        hapticScale: 2.0,
        durationScale: 2.0,
        soundEnabled: true,
        soundVolume: 1.0,
        visualEnabled: true,
      };
      manager.registerProfile(custom);
      expect(manager.listProfiles()).toContain('mega');

      manager.setProfile('mega');
      expect(manager.getProfile()).toEqual(custom);
    });

    describe('toMiddleware', () => {
      it('returns a valid middleware with correct name', () => {
        manager.setProfile('strong');
        const mw = manager.toMiddleware();
        expect(mw.name).toBe('profile:strong');
        expect(typeof mw.process).toBe('function');
      });

      it('scales intensity and duration according to profile', () => {
        manager.setProfile('subtle');
        const mw = manager.toMiddleware();

        const steps: HapticStep[] = [
          { type: 'vibrate', duration: 100, intensity: 0.8 },
        ];

        const result = mw.process(steps);
        // hapticScale = 0.5, durationScale = 0.7
        expect(result[0].intensity).toBeCloseTo(0.4);
        expect(result[0].duration).toBe(70);
      });

      it('enforces minimum 20ms duration', () => {
        manager.setProfile('off');
        const mw = manager.toMiddleware();

        const steps: HapticStep[] = [
          { type: 'vibrate', duration: 30, intensity: 0.5 },
        ];

        const result = mw.process(steps);
        expect(result[0].duration).toBe(20);
      });
    });
  });
});
