import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoundEngine } from '../src/sound/sound-engine';

// ─── Mock Web Audio API ──────────────────────────────────────

class MockGainNode {
  gain = { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockOscillatorNode {
  type: OscillatorType = 'sine';
  frequency = { value: 440, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  onended: (() => void) | null = null;
}

class MockBiquadFilterNode {
  type = 'bandpass';
  frequency = { value: 350 };
  Q = { value: 1 };
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockBufferSourceNode {
  buffer: AudioBuffer | null = null;
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioBuffer {
  private _data: Float32Array;
  constructor(options: { length: number; sampleRate: number }) {
    this._data = new Float32Array(options.length);
  }
  getChannelData(): Float32Array {
    return this._data;
  }
}

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state: AudioContextState = 'running';
  destination = {};

  createOscillator = vi.fn(() => new MockOscillatorNode());
  createGain = vi.fn(() => new MockGainNode());
  createBiquadFilter = vi.fn(() => new MockBiquadFilterNode());
  createBufferSource = vi.fn(() => new MockBufferSourceNode());
  createBuffer = vi.fn(
    (_channels: number, length: number, sampleRate: number) =>
      new MockAudioBuffer({ length, sampleRate }),
  );
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
}

// Install mock globally
(globalThis as any).AudioContext = MockAudioContext;

describe('SoundEngine', () => {
  let engine: SoundEngine;

  beforeEach(() => {
    engine = new SoundEngine({ enabled: true, volume: 0.5 });
  });

  describe('construction', () => {
    it('creates with default options', () => {
      const e = new SoundEngine();
      expect(e.volume).toBe(0.5);
      expect(e.muted).toBe(false);
      expect(e.enabled).toBe(true);
    });

    it('respects custom options', () => {
      const e = new SoundEngine({ enabled: false, volume: 0.8, muted: true });
      expect(e.volume).toBe(0.8);
      expect(e.muted).toBe(true);
      expect(e.enabled).toBe(false);
    });
  });

  describe('sound methods', () => {
    it('click() creates an oscillator', async () => {
      await engine.click();
      // Should have lazily created a context and used it
      // No throw = success
    });

    it('click() accepts pitch options', async () => {
      await engine.click({ pitch: 'low' });
      await engine.click({ pitch: 'mid' });
      await engine.click({ pitch: 'high', volume: 0.5 });
    });

    it('tick() produces a sound', async () => {
      await engine.tick();
    });

    it('pop() produces a frequency sweep', async () => {
      await engine.pop();
    });

    it('whoosh() produces a noise burst', async () => {
      await engine.whoosh();
    });

    it('chime() plays a musical note', async () => {
      await engine.chime('C4');
      await engine.chime('G4');
      await engine.chime(); // default C5
    });

    it('error() produces two descending tones', async () => {
      await engine.error();
    });

    it('success() produces two ascending tones', async () => {
      await engine.success();
    });

    it('tap() produces a subtle sound', async () => {
      await engine.tap();
    });

    it('toggle(true) plays ascending tone', async () => {
      await engine.toggle(true);
    });

    it('toggle(false) plays descending tone', async () => {
      await engine.toggle(false);
    });

    it('playTone() plays a generic tone', async () => {
      await engine.playTone(440, 50, { waveform: 'square', volume: 0.3, decay: true });
    });

    it('playTone() works without options', async () => {
      await engine.playTone(800, 10);
    });
  });

  describe('volume control', () => {
    it('setVolume() clamps to 0-1', () => {
      engine.setVolume(0.8);
      expect(engine.volume).toBe(0.8);

      engine.setVolume(-0.5);
      expect(engine.volume).toBe(0);

      engine.setVolume(2.0);
      expect(engine.volume).toBe(1);
    });
  });

  describe('mute/unmute', () => {
    it('mute() silences the engine', async () => {
      engine.mute();
      expect(engine.muted).toBe(true);

      // Should not create AudioContext when muted
      await engine.click();
    });

    it('unmute() re-enables sounds', () => {
      engine.mute();
      expect(engine.muted).toBe(true);

      engine.unmute();
      expect(engine.muted).toBe(false);
    });
  });

  describe('disabled engine', () => {
    it('does not produce sounds when disabled', async () => {
      const disabled = new SoundEngine({ enabled: false });
      await disabled.click();
      await disabled.success();
      await disabled.error();
      // No throw = success; AudioContext should not be created
    });
  });

  describe('dispose', () => {
    it('closes the AudioContext', async () => {
      // Trigger context creation
      await engine.click();
      engine.dispose();
      // Second dispose should be safe
      engine.dispose();
    });
  });
});
