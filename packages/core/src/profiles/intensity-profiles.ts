import type { HapticMiddleware } from '../middleware';
import { intensityScaler, durationScaler } from '../middleware';

/** User preference profile that scales all haptic feedback */
export type IntensityProfile = {
  name: string;
  /** 0-2 multiplier for vibration intensity */
  hapticScale: number;
  /** 0-2 multiplier for durations */
  durationScale: number;
  /** Whether sound feedback is enabled */
  soundEnabled: boolean;
  /** Sound volume from 0-1 */
  soundVolume: number;
  /** Whether visual feedback is enabled */
  visualEnabled: boolean;
};

// ─── Built-in profiles ─────────────────────────────────────

export const profiles: Record<string, IntensityProfile> = {
  off: {
    name: 'off',
    hapticScale: 0,
    durationScale: 0,
    soundEnabled: false,
    soundVolume: 0,
    visualEnabled: false,
  },
  subtle: {
    name: 'subtle',
    hapticScale: 0.5,
    durationScale: 0.7,
    soundEnabled: true,
    soundVolume: 0.1,
    visualEnabled: true,
  },
  normal: {
    name: 'normal',
    hapticScale: 1.0,
    durationScale: 1.0,
    soundEnabled: true,
    soundVolume: 0.3,
    visualEnabled: true,
  },
  strong: {
    name: 'strong',
    hapticScale: 1.3,
    durationScale: 1.2,
    soundEnabled: true,
    soundVolume: 0.5,
    visualEnabled: true,
  },
  intense: {
    name: 'intense',
    hapticScale: 1.8,
    durationScale: 1.5,
    soundEnabled: true,
    soundVolume: 0.7,
    visualEnabled: true,
  },
  accessible: {
    name: 'accessible',
    hapticScale: 1.5,
    durationScale: 1.3,
    soundEnabled: true,
    soundVolume: 0.6,
    visualEnabled: true,
  },
};

/**
 * Manages user intensity profiles for haptic feedback.
 *
 * Usage:
 *   const pm = new ProfileManager();
 *   pm.setProfile('strong');
 *   const mw = pm.toMiddleware();
 */
export class ProfileManager {
  private currentProfile: IntensityProfile;
  private registry: Map<string, IntensityProfile>;

  constructor() {
    this.registry = new Map();
    for (const [name, profile] of Object.entries(profiles)) {
      this.registry.set(name, profile);
    }
    this.currentProfile = profiles.normal!;
  }

  /** Apply a profile by name or custom profile object */
  setProfile(name: string | IntensityProfile): void {
    if (typeof name === 'string') {
      const profile = this.registry.get(name);
      if (!profile) {
        throw new Error(`Unknown profile: "${name}"`);
      }
      this.currentProfile = profile;
    } else {
      this.registry.set(name.name, name);
      this.currentProfile = name;
    }
  }

  /** Get the current profile */
  getProfile(): IntensityProfile {
    return this.currentProfile;
  }

  /** List available profile names */
  listProfiles(): string[] {
    return Array.from(this.registry.keys());
  }

  /** Register a custom profile */
  registerProfile(profile: IntensityProfile): void {
    this.registry.set(profile.name, profile);
  }

  /** Convert current profile to a HapticMiddleware (intensity + duration scaling) */
  toMiddleware(): HapticMiddleware {
    const profile = this.currentProfile;
    const iScaler = intensityScaler(profile.hapticScale);
    const dScaler = durationScaler(profile.durationScale);

    return {
      name: `profile:${profile.name}`,
      process: (steps) => dScaler.process(iScaler.process(steps)),
    };
  }

  /** Current profile name */
  get current(): string {
    return this.currentProfile.name;
  }
}
