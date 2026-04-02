/** Note names mapped to frequencies (Hz) */
const NOTE_FREQUENCIES: Record<string, number> = {
  C4: 261.63,
  E4: 329.63,
  G4: 392.0,
  C5: 523.25,
};

/** Options for SoundEngine construction */
export interface SoundEngineOptions {
  enabled?: boolean;
  volume?: number;
  muted?: boolean;
}

/** Options for the click sound */
export interface ClickOptions {
  pitch?: 'low' | 'mid' | 'high';
  volume?: number;
}

/** Options for the generic tone player */
export interface ToneOptions {
  waveform?: OscillatorType;
  volume?: number;
  decay?: boolean;
}

/**
 * Lightweight audio feedback engine using Web Audio API.
 * Produces tiny UI sounds synced with haptics — all procedurally generated.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterVolume: number;
  private _muted: boolean;
  private _enabled: boolean;

  constructor(options?: SoundEngineOptions) {
    this._enabled = options?.enabled ?? true;
    this.masterVolume = options?.volume ?? 0.5;
    this._muted = options?.muted ?? false;
  }

  // ─── Public API ──────────────────────────────────────────

  /** Short click sound */
  async click(options?: ClickOptions): Promise<void> {
    const pitchMap = { low: 800, mid: 1200, high: 2000 };
    const freq = pitchMap[options?.pitch ?? 'mid'];
    const vol = options?.volume ?? 0.3;
    await this.playTone(freq, 4, { waveform: 'sine', volume: vol, decay: true });
  }

  /** Ultra-short tick sound */
  async tick(): Promise<void> {
    await this.playTone(4000, 2, { waveform: 'sine', volume: 0.15, decay: true });
  }

  /** Bubbly pop sound — quick frequency sweep high to low */
  async pop(): Promise<void> {
    const ctx = this._getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const vol = this._effectiveVolume(0.25);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /** Swipe/swoosh sound — noise with quick fade */
  async whoosh(): Promise<void> {
    const ctx = this._getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const vol = this._effectiveVolume(0.2);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    source.start(now);
  }

  /** Musical chime */
  async chime(note: 'C4' | 'E4' | 'G4' | 'C5' = 'C5'): Promise<void> {
    const freq = NOTE_FREQUENCIES[note] ?? 523;
    await this.playTone(freq, 100, { waveform: 'sine', volume: 0.2, decay: true });
  }

  /** Low buzzer/error tone — two descending tones */
  async error(): Promise<void> {
    const ctx = this._getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    this._scheduleTone(ctx, 400, now, 0.08, 'square', 0.15);
    this._scheduleTone(ctx, 280, now + 0.1, 0.1, 'square', 0.15);
  }

  /** Ascending two-tone success sound */
  async success(): Promise<void> {
    const ctx = this._getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    this._scheduleTone(ctx, 880, now, 0.06, 'sine', 0.15);
    this._scheduleTone(ctx, 1320, now + 0.08, 0.08, 'sine', 0.15);
  }

  /** Subtle tap sound */
  async tap(): Promise<void> {
    await this.playTone(1000, 3, { waveform: 'sine', volume: 0.2, decay: true });
  }

  /** Toggle sound — ascending for on, descending for off */
  async toggle(on: boolean): Promise<void> {
    const ctx = this._getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (on) {
      this._scheduleTone(ctx, 600, now, 0.04, 'sine', 0.15);
      this._scheduleTone(ctx, 900, now + 0.06, 0.04, 'sine', 0.15);
    } else {
      this._scheduleTone(ctx, 900, now, 0.04, 'sine', 0.15);
      this._scheduleTone(ctx, 600, now + 0.06, 0.04, 'sine', 0.15);
    }
  }

  /** Generic tone player */
  async playTone(
    frequency: number,
    duration: number,
    options?: ToneOptions,
  ): Promise<void> {
    const ctx = this._getContext();
    if (!ctx) return;

    const waveform = options?.waveform ?? 'sine';
    const vol = this._effectiveVolume(options?.volume ?? 0.3);
    const decay = options?.decay ?? false;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = waveform;
    osc.frequency.value = frequency;

    const now = ctx.currentTime;
    const durSec = duration / 1000;

    gain.gain.setValueAtTime(vol, now);
    if (decay) {
      gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);
    }

    osc.start(now);
    osc.stop(now + durSec);
  }

  /** Set master volume (0-1) */
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /** Mute all sounds */
  mute(): void {
    this._muted = true;
  }

  /** Unmute sounds */
  unmute(): void {
    this._muted = false;
  }

  /** Whether sounds are currently muted */
  get muted(): boolean {
    return this._muted;
  }

  /** Current master volume */
  get volume(): number {
    return this.masterVolume;
  }

  /** Whether the engine is enabled */
  get enabled(): boolean {
    return this._enabled;
  }

  /** Close AudioContext and release resources */
  dispose(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  // ─── Internal ──────────────────────────────────────────────

  /** Lazily create and return AudioContext, handling autoplay policy */
  private _getContext(): AudioContext | null {
    if (!this._enabled || this._muted) return null;
    if (typeof AudioContext === 'undefined') return null;

    if (!this.ctx) {
      this.ctx = new AudioContext();
    }

    // Resume if suspended (autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /** Compute effective volume from master + per-sound volume */
  private _effectiveVolume(soundVolume: number): number {
    return this.masterVolume * soundVolume;
  }

  /** Schedule a tone at a specific AudioContext time */
  private _scheduleTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    durationSec: number,
    waveform: OscillatorType,
    volume: number,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = waveform;
    osc.frequency.value = frequency;

    const vol = this._effectiveVolume(volume);
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

    osc.start(startTime);
    osc.stop(startTime + durationSec);
  }
}
