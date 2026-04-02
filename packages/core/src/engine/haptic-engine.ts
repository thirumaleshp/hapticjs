import type {
  HapticAdapter,
  HapticConfig,
  HapticStep,
  HapticPattern,
  ImpactStyle,
} from '../types';
import { DEFAULT_CONFIG } from '../types';
import { detectAdapter } from './capability-detector';
import { AdaptiveEngine } from './adaptive-engine';
import { FallbackManager } from './fallback-manager';
import { PatternComposer } from '../composer/pattern-composer';
import { parseHPL } from '../patterns/parser';
import { compile, optimizeSteps } from '../patterns/compiler';
import { normalizeIntensity } from '../utils/scheduling';

/**
 * The main haptic engine — orchestrates adapters, patterns, and fallbacks.
 *
 * Usage:
 *   const engine = HapticEngine.create();
 *   engine.tap();
 *   engine.success();
 *   engine.play('~~..##..@@');
 */
export class HapticEngine {
  private adapter: HapticAdapter;
  private config: HapticConfig;
  private adaptive: AdaptiveEngine;
  private fallback: FallbackManager;

  constructor(config?: Partial<HapticConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.adapter = this.config.adapter ?? detectAdapter();
    this.adaptive = new AdaptiveEngine();
    this.fallback = new FallbackManager(this.config.fallback);
  }

  /** Create a new engine with auto-detected adapter */
  static create(config?: Partial<HapticConfig>): HapticEngine {
    return new HapticEngine(config);
  }

  // ─── Semantic API ──────────────────────────────────────────

  /** Light tap feedback */
  async tap(intensity = 0.6): Promise<void> {
    await this._playSteps([{ type: 'vibrate', duration: 30, intensity }]);
  }

  /** Double tap */
  async doubleTap(intensity = 0.6): Promise<void> {
    await this._playSteps([
      { type: 'vibrate', duration: 25, intensity },
      { type: 'pause', duration: 80, intensity: 0 },
      { type: 'vibrate', duration: 25, intensity },
    ]);
  }

  /** Long press feedback */
  async longPress(intensity = 0.8): Promise<void> {
    await this._playSteps([{ type: 'vibrate', duration: 50, intensity }]);
  }

  /** Success notification */
  async success(): Promise<void> {
    await this._playSteps([
      { type: 'vibrate', duration: 30, intensity: 0.5 },
      { type: 'pause', duration: 60, intensity: 0 },
      { type: 'vibrate', duration: 40, intensity: 0.8 },
    ]);
  }

  /** Warning notification */
  async warning(): Promise<void> {
    await this._playSteps([
      { type: 'vibrate', duration: 40, intensity: 0.7 },
      { type: 'pause', duration: 50, intensity: 0 },
      { type: 'vibrate', duration: 40, intensity: 0.7 },
      { type: 'pause', duration: 50, intensity: 0 },
      { type: 'vibrate', duration: 40, intensity: 0.7 },
    ]);
  }

  /** Error notification */
  async error(): Promise<void> {
    await this._playSteps([
      { type: 'vibrate', duration: 80, intensity: 1.0 },
      { type: 'pause', duration: 100, intensity: 0 },
      { type: 'vibrate', duration: 80, intensity: 1.0 },
    ]);
  }

  /** Selection change feedback */
  async selection(): Promise<void> {
    await this._playSteps([{ type: 'vibrate', duration: 25, intensity: 0.5 }]);
  }

  /** Toggle feedback */
  async toggle(on: boolean): Promise<void> {
    if (on) {
      await this._playSteps([{ type: 'vibrate', duration: 30, intensity: 0.6 }]);
    } else {
      await this._playSteps([{ type: 'vibrate', duration: 25, intensity: 0.4 }]);
    }
  }

  /** Impact with style (matches iOS UIImpactFeedbackGenerator) */
  async impact(style: ImpactStyle = 'medium'): Promise<void> {
    const presets: Record<ImpactStyle, HapticStep[]> = {
      light: [{ type: 'vibrate', duration: 25, intensity: 0.4 }],
      medium: [{ type: 'vibrate', duration: 35, intensity: 0.7 }],
      heavy: [{ type: 'vibrate', duration: 50, intensity: 1.0 }],
      rigid: [{ type: 'vibrate', duration: 30, intensity: 0.9 }],
      soft: [{ type: 'vibrate', duration: 35, intensity: 0.5 }],
    };
    await this._playSteps(presets[style]);
  }

  // ─── Parametric API ────────────────────────────────────────

  /** Vibrate for a specified duration */
  async vibrate(duration: number, intensity = 1.0): Promise<void> {
    await this._playSteps([
      { type: 'vibrate', duration, intensity: normalizeIntensity(intensity) },
    ]);
  }

  /**
   * Play a haptic pattern.
   * Accepts:
   *   - HPL string: "~~..##..@@"
   *   - HapticPattern object
   *   - Raw HapticStep array
   */
  async play(pattern: string | HapticPattern | HapticStep[]): Promise<void> {
    let steps: HapticStep[];

    if (typeof pattern === 'string') {
      const ast = parseHPL(pattern);
      steps = compile(ast);
    } else if (Array.isArray(pattern)) {
      steps = pattern;
    } else {
      steps = pattern.steps;
    }

    await this._playSteps(steps);
  }

  // ─── Composer ──────────────────────────────────────────────

  /** Create a new pattern composer */
  compose(): PatternComposer {
    const composer = new PatternComposer();
    composer.onPlay((steps) => this._playSteps(steps));
    return composer;
  }

  // ─── Configuration ─────────────────────────────────────────

  /** Update engine configuration */
  configure(config: Partial<HapticConfig>): void {
    Object.assign(this.config, config);

    if (config.adapter) {
      this.adapter = config.adapter;
    }

    if (config.fallback) {
      this.fallback.updateConfig(this.config.fallback);
    }
  }

  /** Check if haptics are supported on this device */
  get isSupported(): boolean {
    return this.adapter.supported;
  }

  /** Get the current adapter name */
  get adapterName(): string {
    return this.adapter.name;
  }

  // ─── Lifecycle ─────────────────────────────────────────────

  /** Cancel any ongoing haptic effect */
  cancel(): void {
    this.adapter.cancel();
  }

  /** Clean up resources */
  dispose(): void {
    this.adapter.dispose();
  }

  // ─── Internal ──────────────────────────────────────────────

  private async _playSteps(steps: HapticStep[]): Promise<void> {
    if (!this.config.enabled || steps.length === 0) return;

    // Apply global intensity multiplier
    let adjusted = steps.map((s) => ({
      ...s,
      intensity:
        s.type === 'vibrate'
          ? normalizeIntensity(s.intensity * this.config.intensity)
          : 0,
    }));

    // Adapt to device capabilities
    const caps = this.adapter.capabilities();
    adjusted = this.adaptive.adapt(adjusted, caps);

    // Optimize
    adjusted = optimizeSteps(adjusted);

    if (this.adapter.supported) {
      await this.adapter.playSequence(adjusted);
    } else {
      await this.fallback.execute(adjusted);
    }
  }
}
