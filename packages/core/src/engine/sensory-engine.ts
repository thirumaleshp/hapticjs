import type { HapticConfig, HapticStep, HapticPattern } from '../types';
import { HapticEngine } from './haptic-engine';
import { SoundEngine } from '../sound/sound-engine';
import { VisualEngine } from '../visual/visual-engine';
import { ThemeManager } from '../themes/theme-manager';
import type { ThemePreset } from '../themes/theme-manager';

/** Options for the SensoryEngine */
export interface SensoryEngineOptions {
  haptic?: Partial<HapticConfig>;
  sound?: { enabled?: boolean; volume?: number; muted?: boolean };
  visual?: { enabled?: boolean; target?: HTMLElement; intensity?: number };
  theme?: string | ThemePreset;
}

/**
 * Higher-level engine that combines haptic + sound + visual feedback.
 * Ties HapticEngine, SoundEngine, VisualEngine, and ThemeManager together.
 *
 * Usage:
 *   const engine = SensoryEngine.create();
 *   engine.tap();
 *   engine.success();
 *   engine.setTheme('gaming');
 */
export class SensoryEngine {
  private _haptic: HapticEngine;
  private _sound: SoundEngine;
  private _visual: VisualEngine;
  private _themes: ThemeManager;

  constructor(options?: SensoryEngineOptions) {
    this._haptic = new HapticEngine(options?.haptic);
    this._sound = new SoundEngine(options?.sound);
    this._visual = new VisualEngine(options?.visual);
    this._themes = new ThemeManager();

    if (options?.theme) {
      this.setTheme(options.theme);
    }
  }

  /** Factory method */
  static create(options?: SensoryEngineOptions): SensoryEngine {
    return new SensoryEngine(options);
  }

  // ─── Multi-sensory API ─────────────────────────────────────

  /** Tap: vibrate + click sound + pulse visual */
  async tap(): Promise<void> {
    const theme = this._themes.getTheme();

    await Promise.all([
      this._haptic.tap(),
      theme.soundEnabled ? this._sound.click({ pitch: 'mid' }) : Promise.resolve(),
      theme.visualEnabled ? this._runVisual(theme, 'tap') : Promise.resolve(),
    ]);
  }

  /** Success: haptic success + success sound + green glow */
  async success(): Promise<void> {
    const theme = this._themes.getTheme();

    await Promise.all([
      this._haptic.success(),
      theme.soundEnabled ? this._sound.success() : Promise.resolve(),
      theme.visualEnabled
        ? this._visual.glow({ color: theme.colors.success, duration: 300 })
        : Promise.resolve(),
    ]);
  }

  /** Error: haptic error + error sound + red flash */
  async error(): Promise<void> {
    const theme = this._themes.getTheme();

    await Promise.all([
      this._haptic.error(),
      theme.soundEnabled ? this._sound.error() : Promise.resolve(),
      theme.visualEnabled
        ? this._visual.flash({ color: theme.colors.error, duration: 150, opacity: 0.2 })
        : Promise.resolve(),
    ]);
  }

  /** Warning: haptic warning + warning sound + yellow flash */
  async warning(): Promise<void> {
    const theme = this._themes.getTheme();

    await Promise.all([
      this._haptic.warning(),
      theme.soundEnabled ? this._sound.chime('E4') : Promise.resolve(),
      theme.visualEnabled
        ? this._visual.flash({ color: theme.colors.warning, duration: 150, opacity: 0.2 })
        : Promise.resolve(),
    ]);
  }

  /** Selection: haptic selection + tick sound + subtle pulse */
  async selection(): Promise<void> {
    const theme = this._themes.getTheme();

    await Promise.all([
      this._haptic.selection(),
      theme.soundEnabled ? this._sound.tick() : Promise.resolve(),
      theme.visualEnabled
        ? this._visual.pulse({ scale: 1.01, duration: 100 })
        : Promise.resolve(),
    ]);
  }

  /** Toggle: haptic toggle + toggle sound + pulse */
  async toggle(on: boolean): Promise<void> {
    const theme = this._themes.getTheme();

    await Promise.all([
      this._haptic.toggle(on),
      theme.soundEnabled ? this._sound.toggle(on) : Promise.resolve(),
      theme.visualEnabled
        ? this._visual.pulse({ scale: on ? 1.03 : 0.98, duration: 150 })
        : Promise.resolve(),
    ]);
  }

  /** Play a haptic pattern (sound/visual auto-mapped from theme) */
  async play(pattern: string | HapticPattern | HapticStep[]): Promise<void> {
    const theme = this._themes.getTheme();

    await Promise.all([
      this._haptic.play(pattern),
      theme.soundEnabled ? this._sound.tap() : Promise.resolve(),
      theme.visualEnabled ? this._runVisual(theme, 'play') : Promise.resolve(),
    ]);
  }

  // ─── Theme ─────────────────────────────────────────────────

  /** Apply a theme by name or preset */
  setTheme(name: string | ThemePreset): void {
    this._themes.setTheme(name);

    const theme = this._themes.getTheme();

    // Sync engines to theme settings
    this._haptic.configure({ intensity: theme.hapticIntensity });
    this._sound.setVolume(theme.soundVolume);

    if (!theme.soundEnabled) {
      this._sound.mute();
    } else {
      this._sound.unmute();
    }
  }

  // ─── Accessors ─────────────────────────────────────────────

  /** Access the underlying HapticEngine */
  get haptic(): HapticEngine {
    return this._haptic;
  }

  /** Access the SoundEngine */
  get sound(): SoundEngine {
    return this._sound;
  }

  /** Access the VisualEngine */
  get visual(): VisualEngine {
    return this._visual;
  }

  /** Access the ThemeManager */
  get themes(): ThemeManager {
    return this._themes;
  }

  // ─── Configuration ─────────────────────────────────────────

  /** Configure all engines */
  configure(options: SensoryEngineOptions): void {
    if (options.haptic) {
      this._haptic.configure(options.haptic);
    }
    if (options.sound) {
      this._sound = new SoundEngine(options.sound);
    }
    if (options.visual) {
      this._visual = new VisualEngine(options.visual);
    }
    if (options.theme) {
      this.setTheme(options.theme);
    }
  }

  // ─── Lifecycle ─────────────────────────────────────────────

  /** Clean up all engines */
  dispose(): void {
    this._haptic.dispose();
    this._sound.dispose();
    this._visual.dispose();
  }

  // ─── Internal ──────────────────────────────────────────────

  /** Run the appropriate visual effect based on theme style */
  private _runVisual(theme: ThemePreset, context: string): void {
    switch (theme.visualStyle) {
      case 'flash':
        this._visual.flash({ color: theme.colors.primary });
        break;
      case 'ripple':
        // Ripple at center of viewport when no coordinates available
        if (typeof window !== 'undefined') {
          this._visual.ripple(window.innerWidth / 2, window.innerHeight / 2, {
            color: theme.colors.primary,
          });
        }
        break;
      case 'shake':
        this._visual.shake({ intensity: context === 'play' ? 5 : 3 });
        break;
      case 'glow':
        this._visual.glow({ color: theme.colors.primary });
        break;
      case 'pulse':
        this._visual.pulse();
        break;
    }
  }
}
