/**
 * RhythmSync — sync haptic feedback to audio/music BPM.
 *
 * Provides beat detection via tap tempo, BPM control,
 * and automatic haptic triggering on each beat.
 */

export interface RhythmSyncOptions {
  /** Beats per minute (60-300) */
  bpm?: number;
  /** Global intensity multiplier (0-1) */
  intensity?: number;
  /** HPL pattern string to play on each beat */
  pattern?: string;
}

export class RhythmSync {
  private _bpm: number;
  private _intensity: number;
  private _pattern: string; // reserved for pattern-based rhythm
  private _isPlaying = false;
  private _beatCount = 0;
  private _intervalId: ReturnType<typeof setInterval> | null = null;
  private _callbacks: Array<(beat: number) => void> = [];
  private _tapTimestamps: number[] = [];
  private _audioElement: unknown = null;
  private _syncEngine: unknown = null;
  private _syncEffect: string = 'tap';

  constructor(options: RhythmSyncOptions = {}) {
    this._bpm = Math.min(300, Math.max(60, options.bpm ?? 120));
    this._intensity = Math.min(1, Math.max(0, options.intensity ?? 0.7));
    this._pattern = options.pattern ?? '';
  }

  // ─── BPM Control ─────────────────────────────────────────

  /** Set beats per minute (clamped to 60-300) */
  setBPM(bpm: number): void {
    this._bpm = Math.min(300, Math.max(60, bpm));

    // Restart interval if currently playing
    if (this._isPlaying) {
      this._stopInterval();
      this._startInterval();
    }
  }

  /**
   * Store an audio element reference for sync.
   * Since Web Audio API's AnalyserNode isn't reliably available in all
   * environments, use tapTempo() for BPM detection instead.
   */
  detectBPM(audioElement: unknown): void {
    this._audioElement = audioElement;
  }

  /**
   * Tap tempo — call repeatedly to set BPM from tap intervals.
   * Calculates average BPM from the last 4-8 taps.
   * Returns the current estimated BPM.
   */
  tapTempo(): number {
    const now = Date.now();
    this._tapTimestamps.push(now);

    // Keep only the last 8 taps
    if (this._tapTimestamps.length > 8) {
      this._tapTimestamps = this._tapTimestamps.slice(-8);
    }

    // Need at least 2 taps to calculate
    if (this._tapTimestamps.length < 2) {
      return this._bpm;
    }

    // Use last 4-8 intervals
    const timestamps = this._tapTimestamps.slice(-8);
    const intervals: number[] = [];

    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i]! - timestamps[i - 1]!);
    }

    // Average interval in ms
    const avgInterval = intervals.reduce((sum, v) => sum + v, 0) / intervals.length;

    if (avgInterval > 0) {
      const estimatedBPM = Math.round(60000 / avgInterval);
      this._bpm = Math.min(300, Math.max(60, estimatedBPM));
    }

    return this._bpm;
  }

  // ─── Playback ────────────────────────────────────────────

  /** Start emitting beats at the current BPM */
  start(callback?: (beat: number) => void): void {
    if (this._isPlaying) return;

    if (callback) {
      this._callbacks.push(callback);
    }

    this._isPlaying = true;
    this._beatCount = 0;
    this._startInterval();
  }

  /** Stop the rhythm */
  stop(): void {
    this._isPlaying = false;
    this._stopInterval();
  }

  /** Register a beat callback */
  onBeat(callback: (beat: number) => void): void {
    this._callbacks.push(callback);
  }

  // ─── Haptic Sync ────────────────────────────────────────

  /**
   * Auto-trigger a haptic effect on each beat.
   * Calls engine.tap() by default, or the specified semantic method.
   */
  syncHaptic(engine: any, effect: string = 'tap'): void {
    this._syncEngine = engine;
    this._syncEffect = effect;
  }

  // ─── Getters ─────────────────────────────────────────────

  /** Current BPM */
  get bpm(): number {
    return this._bpm;
  }

  /** Whether rhythm is active */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /** Total beats since start */
  get beatCount(): number {
    return this._beatCount;
  }

  /** Current pattern string */
  get pattern(): string {
    return this._pattern;
  }

  /** The attached audio element, if any */
  get audioElement(): unknown {
    return this._audioElement;
  }

  // ─── Lifecycle ───────────────────────────────────────────

  /** Clean up intervals and callbacks */
  dispose(): void {
    this.stop();
    this._callbacks = [];
    this._tapTimestamps = [];
    this._syncEngine = null;
    this._audioElement = null;
  }

  // ─── Internal ────────────────────────────────────────────

  private _startInterval(): void {
    const intervalMs = 60000 / this._bpm;

    this._intervalId = setInterval(() => {
      this._beatCount++;
      const beat = this._beatCount;

      // Fire all registered callbacks
      for (const cb of this._callbacks) {
        cb(beat);
      }

      // Fire synced haptic
      if (this._syncEngine) {
        const engine = this._syncEngine as any;
        if (typeof engine[this._syncEffect] === 'function') {
          engine[this._syncEffect](this._intensity);
        } else if (typeof engine.tap === 'function') {
          engine.tap(this._intensity);
        }
      }
    }, intervalMs);
  }

  private _stopInterval(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
}
