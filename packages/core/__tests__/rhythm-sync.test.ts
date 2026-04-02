import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RhythmSync } from '../src/rhythm/rhythm-sync';

describe('RhythmSync', () => {
  let rhythm: RhythmSync;

  beforeEach(() => {
    vi.useFakeTimers();
    rhythm = new RhythmSync();
  });

  afterEach(() => {
    rhythm.dispose();
    vi.useRealTimers();
  });

  describe('BPM control', () => {
    it('defaults to 120 BPM', () => {
      expect(rhythm.bpm).toBe(120);
    });

    it('accepts custom BPM in constructor', () => {
      const r = new RhythmSync({ bpm: 140 });
      expect(r.bpm).toBe(140);
      r.dispose();
    });

    it('clamps BPM to 60-300 range', () => {
      rhythm.setBPM(30);
      expect(rhythm.bpm).toBe(60);

      rhythm.setBPM(500);
      expect(rhythm.bpm).toBe(300);
    });

    it('setBPM updates current BPM', () => {
      rhythm.setBPM(180);
      expect(rhythm.bpm).toBe(180);
    });
  });

  describe('tapTempo', () => {
    it('returns current BPM with single tap', () => {
      const bpm = rhythm.tapTempo();
      expect(bpm).toBe(120); // default, not enough data
    });

    it('calculates BPM from tap intervals', () => {
      // Simulate tapping at 120 BPM (500ms intervals)
      vi.setSystemTime(0);
      rhythm.tapTempo();

      vi.setSystemTime(500);
      rhythm.tapTempo();

      vi.setSystemTime(1000);
      rhythm.tapTempo();

      vi.setSystemTime(1500);
      const bpm = rhythm.tapTempo();

      expect(bpm).toBe(120);
    });

    it('calculates BPM from faster taps', () => {
      // Simulate tapping at 150 BPM (400ms intervals)
      vi.setSystemTime(0);
      rhythm.tapTempo();

      vi.setSystemTime(400);
      rhythm.tapTempo();

      vi.setSystemTime(800);
      rhythm.tapTempo();

      vi.setSystemTime(1200);
      const bpm = rhythm.tapTempo();

      expect(bpm).toBe(150);
    });
  });

  describe('start/stop lifecycle', () => {
    it('starts in stopped state', () => {
      expect(rhythm.isPlaying).toBe(false);
    });

    it('isPlaying is true after start', () => {
      rhythm.start();
      expect(rhythm.isPlaying).toBe(true);
    });

    it('isPlaying is false after stop', () => {
      rhythm.start();
      rhythm.stop();
      expect(rhythm.isPlaying).toBe(false);
    });

    it('start is idempotent', () => {
      rhythm.start();
      rhythm.start(); // should not throw
      expect(rhythm.isPlaying).toBe(true);
    });
  });

  describe('beatCount', () => {
    it('starts at 0', () => {
      expect(rhythm.beatCount).toBe(0);
    });

    it('increments on each beat', () => {
      rhythm.setBPM(120); // 500ms per beat
      rhythm.start();

      vi.advanceTimersByTime(500);
      expect(rhythm.beatCount).toBe(1);

      vi.advanceTimersByTime(500);
      expect(rhythm.beatCount).toBe(2);

      vi.advanceTimersByTime(500);
      expect(rhythm.beatCount).toBe(3);
    });
  });

  describe('onBeat callback', () => {
    it('fires callback on each beat', () => {
      const beats: number[] = [];
      rhythm.setBPM(120);
      rhythm.onBeat((beat) => beats.push(beat));
      rhythm.start();

      vi.advanceTimersByTime(1500);
      expect(beats).toEqual([1, 2, 3]);
    });

    it('fires callback passed to start()', () => {
      const beats: number[] = [];
      rhythm.setBPM(120);
      rhythm.start((beat) => beats.push(beat));

      vi.advanceTimersByTime(1000);
      expect(beats).toEqual([1, 2]);
    });

    it('fires multiple registered callbacks', () => {
      let countA = 0;
      let countB = 0;
      rhythm.setBPM(120);
      rhythm.onBeat(() => countA++);
      rhythm.onBeat(() => countB++);
      rhythm.start();

      vi.advanceTimersByTime(500);
      expect(countA).toBe(1);
      expect(countB).toBe(1);
    });
  });

  describe('syncHaptic', () => {
    it('calls engine method on each beat', () => {
      const mockEngine = { tap: vi.fn() };
      rhythm.setBPM(120);
      rhythm.syncHaptic(mockEngine, 'tap');
      rhythm.start();

      vi.advanceTimersByTime(1000);
      expect(mockEngine.tap).toHaveBeenCalledTimes(2);
    });
  });

  describe('dispose', () => {
    it('stops playback and cleans up', () => {
      rhythm.start();
      rhythm.dispose();
      expect(rhythm.isPlaying).toBe(false);
      expect(rhythm.beatCount).toBe(0);
    });
  });
});
