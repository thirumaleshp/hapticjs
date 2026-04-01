import type { HapticAdapter, AdapterCapabilities, HapticStep } from '../types';
import { delay } from '../utils/scheduling';

/**
 * iOS Audio workaround adapter.
 * Uses AudioContext to generate short, low-frequency oscillator tones (20-60 Hz)
 * that create a subtle physical sensation through device speakers.
 * This is a fallback for iOS Safari, which does not support the Vibration API.
 */
export class IoSAudioAdapter implements HapticAdapter {
  readonly name = 'ios-audio';
  readonly supported: boolean;

  private _audioCtx: AudioContext | null = null;
  private _activeOscillator: OscillatorNode | null = null;
  private _activeGain: GainNode | null = null;
  private _cancelled = false;

  constructor() {
    this.supported = this._detectSupport();
  }

  capabilities(): AdapterCapabilities {
    return {
      maxIntensityLevels: 100,
      minDuration: 5,
      maxDuration: 5000,
      supportsPattern: true,
      supportsIntensity: true,
      dualMotor: false,
    };
  }

  async pulse(intensity: number, duration: number): Promise<void> {
    if (!this.supported) return;
    await this._playTone(intensity, duration);
  }

  async playSequence(steps: HapticStep[]): Promise<void> {
    if (!this.supported || steps.length === 0) return;

    this._cancelled = false;

    for (const step of steps) {
      if (this._cancelled) break;

      if (step.type === 'vibrate' && step.intensity > 0) {
        await this._playTone(step.intensity, step.duration);
      } else {
        await delay(step.duration);
      }
    }
  }

  cancel(): void {
    this._cancelled = true;
    this._stopOscillator();
  }

  dispose(): void {
    this.cancel();
    if (this._audioCtx) {
      void this._audioCtx.close();
      this._audioCtx = null;
    }
  }

  // ─── Internal ──────────────────────────────────────────────

  private _detectSupport(): boolean {
    if (typeof window === 'undefined') return false;

    const hasAudioContext =
      typeof AudioContext !== 'undefined' ||
      typeof (window as unknown as Record<string, unknown>).webkitAudioContext !== 'undefined';

    if (!hasAudioContext) return false;

    // Check for iOS platform
    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    return isIOS;
  }

  /** Get or create the AudioContext, resuming if suspended */
  private async _getAudioContext(): Promise<AudioContext> {
    if (!this._audioCtx) {
      const Ctor =
        typeof AudioContext !== 'undefined'
          ? AudioContext
          : ((window as unknown as Record<string, unknown>).webkitAudioContext as typeof AudioContext);
      this._audioCtx = new Ctor();
    }

    if (this._audioCtx.state === 'suspended') {
      await this._audioCtx.resume();
    }

    return this._audioCtx;
  }

  /** Map intensity (0-1) to frequency in the 20-60 Hz sub-bass range */
  private _intensityToFrequency(intensity: number): number {
    return 20 + intensity * 40; // 20 Hz at 0 intensity, 60 Hz at full
  }

  /** Play a single oscillator tone for the given duration */
  private async _playTone(intensity: number, duration: number): Promise<void> {
    const ctx = await this._getAudioContext();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(
      this._intensityToFrequency(intensity),
      ctx.currentTime,
    );

    gainNode.gain.setValueAtTime(intensity, ctx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    this._activeOscillator = oscillator;
    this._activeGain = gainNode;

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);

    await new Promise<void>((resolve) => {
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
        this._activeOscillator = null;
        this._activeGain = null;
        resolve();
      };
    });
  }

  /** Immediately stop the active oscillator if any */
  private _stopOscillator(): void {
    if (this._activeOscillator) {
      try {
        this._activeOscillator.stop();
        this._activeOscillator.disconnect();
      } catch {
        // Already stopped — ignore
      }
      this._activeOscillator = null;
    }

    if (this._activeGain) {
      try {
        this._activeGain.disconnect();
      } catch {
        // Already disconnected — ignore
      }
      this._activeGain = null;
    }
  }
}
