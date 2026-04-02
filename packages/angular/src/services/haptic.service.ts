import type { HapticConfig, HapticPattern, HapticStep, ImpactStyle } from '@hapticjs/core';
import { HapticEngine, PatternComposer } from '@hapticjs/core';

/**
 * Angular-friendly service wrapping HapticEngine.
 *
 * Since we don't depend on Angular's compiler, this is a plain class.
 * Provide it in your module or component:
 *
 *   providers: [{ provide: HapticService, useClass: HapticService }]
 *
 * Or use a factory for custom config:
 *
 *   providers: [{
 *     provide: HapticService,
 *     useFactory: () => new HapticService({ intensity: 0.8 }),
 *   }]
 */
export class HapticService {
  private engine: HapticEngine;

  constructor(config?: Partial<HapticConfig>) {
    this.engine = HapticEngine.create(config);
  }

  // ─── Semantic API ──────────────────────────────────────────

  /** Light tap feedback */
  tap(intensity?: number): Promise<void> {
    return this.engine.tap(intensity);
  }

  /** Double tap */
  doubleTap(intensity?: number): Promise<void> {
    return this.engine.doubleTap(intensity);
  }

  /** Success notification */
  success(): Promise<void> {
    return this.engine.success();
  }

  /** Warning notification */
  warning(): Promise<void> {
    return this.engine.warning();
  }

  /** Error notification */
  error(): Promise<void> {
    return this.engine.error();
  }

  /** Selection change feedback */
  selection(): Promise<void> {
    return this.engine.selection();
  }

  /** Toggle feedback */
  toggle(on: boolean): Promise<void> {
    return this.engine.toggle(on);
  }

  /** Impact with style */
  impact(style?: ImpactStyle): Promise<void> {
    return this.engine.impact(style);
  }

  // ─── Parametric API ────────────────────────────────────────

  /** Play a haptic pattern (HPL string, HapticPattern, or HapticStep[]) */
  play(pattern: string | HapticPattern | HapticStep[]): Promise<void> {
    return this.engine.play(pattern);
  }

  /** Vibrate for a specified duration */
  vibrate(duration: number, intensity?: number): Promise<void> {
    return this.engine.vibrate(duration, intensity);
  }

  /** Create a new pattern composer */
  compose(): PatternComposer {
    return this.engine.compose();
  }

  // ─── Configuration ─────────────────────────────────────────

  /** Update engine configuration */
  configure(config: Partial<HapticConfig>): void {
    this.engine.configure(config);
  }

  /** Check if haptics are supported on this device */
  get isSupported(): boolean {
    return this.engine.isSupported;
  }

  /** Get the current adapter name */
  get adapterName(): string {
    return this.engine.adapterName;
  }

  // ─── Lifecycle ─────────────────────────────────────────────

  /** Clean up resources — call in ngOnDestroy */
  dispose(): void {
    this.engine.dispose();
  }
}
