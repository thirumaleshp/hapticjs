/** Multi-sensory theme preset — configures haptic, sound, and visual behavior */
export interface ThemePreset {
  name: string;
  hapticIntensity: number;
  soundEnabled: boolean;
  soundVolume: number;
  visualEnabled: boolean;
  visualStyle: 'flash' | 'ripple' | 'shake' | 'glow' | 'pulse';
  colors: {
    primary: string;
    success: string;
    error: string;
    warning: string;
  };
}

/** Built-in theme presets */
export const themes: Record<string, ThemePreset> = {
  default: {
    name: 'default',
    hapticIntensity: 0.7,
    soundEnabled: true,
    soundVolume: 0.3,
    visualEnabled: true,
    visualStyle: 'flash',
    colors: {
      primary: '#3b82f6',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#eab308',
    },
  },
  gaming: {
    name: 'gaming',
    hapticIntensity: 1.0,
    soundEnabled: true,
    soundVolume: 0.8,
    visualEnabled: true,
    visualStyle: 'shake',
    colors: {
      primary: '#a855f7',
      success: '#00ff88',
      error: '#ff2222',
      warning: '#ff8800',
    },
  },
  minimal: {
    name: 'minimal',
    hapticIntensity: 0.4,
    soundEnabled: false,
    soundVolume: 0,
    visualEnabled: true,
    visualStyle: 'pulse',
    colors: {
      primary: '#6b7280',
      success: '#9ca3af',
      error: '#4b5563',
      warning: '#d1d5db',
    },
  },
  luxury: {
    name: 'luxury',
    hapticIntensity: 0.6,
    soundEnabled: true,
    soundVolume: 0.25,
    visualEnabled: true,
    visualStyle: 'glow',
    colors: {
      primary: '#d4af37',
      success: '#50c878',
      error: '#8b0000',
      warning: '#cd853f',
    },
  },
  retro: {
    name: 'retro',
    hapticIntensity: 0.9,
    soundEnabled: true,
    soundVolume: 0.5,
    visualEnabled: true,
    visualStyle: 'flash',
    colors: {
      primary: '#00ff00',
      success: '#00ffff',
      error: '#ff0000',
      warning: '#ffff00',
    },
  },
  nature: {
    name: 'nature',
    hapticIntensity: 0.5,
    soundEnabled: true,
    soundVolume: 0.2,
    visualEnabled: true,
    visualStyle: 'pulse',
    colors: {
      primary: '#2d6a4f',
      success: '#40916c',
      error: '#9b2226',
      warning: '#ee9b00',
    },
  },
  silent: {
    name: 'silent',
    hapticIntensity: 0.7,
    soundEnabled: false,
    soundVolume: 0,
    visualEnabled: false,
    visualStyle: 'flash',
    colors: {
      primary: '#3b82f6',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#eab308',
    },
  },
  accessible: {
    name: 'accessible',
    hapticIntensity: 1.0,
    soundEnabled: true,
    soundVolume: 0.6,
    visualEnabled: true,
    visualStyle: 'flash',
    colors: {
      primary: '#0000ff',
      success: '#008000',
      error: '#ff0000',
      warning: '#ff8c00',
    },
  },
};

/**
 * Manages multi-sensory themes that configure haptic, sound, and visual behavior.
 */
export class ThemeManager {
  private _current: ThemePreset;
  private _registry: Map<string, ThemePreset>;

  constructor() {
    this._registry = new Map(Object.entries(themes));
    this._current = themes.default!;
  }

  /** Apply a theme by name or provide a custom preset */
  setTheme(name: string | ThemePreset): void {
    if (typeof name === 'string') {
      const preset = this._registry.get(name);
      if (!preset) {
        throw new Error(`Unknown theme: "${name}". Available: ${this.listThemes().join(', ')}`);
      }
      this._current = preset;
    } else {
      this._registry.set(name.name, name);
      this._current = name;
    }
  }

  /** Get the current theme preset */
  getTheme(): ThemePreset {
    return this._current;
  }

  /** Current theme name */
  get current(): string {
    return this._current.name;
  }

  /** List all available theme names */
  listThemes(): string[] {
    return Array.from(this._registry.keys());
  }

  /** Register a custom theme preset */
  registerTheme(preset: ThemePreset): void {
    this._registry.set(preset.name, preset);
  }
}
