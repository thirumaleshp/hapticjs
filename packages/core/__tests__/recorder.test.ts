import { describe, it, expect } from 'vitest';
import { PatternRecorder } from '../src/recorder/pattern-recorder';

/** Helper: create a recorder with a controllable clock */
function createRecorder() {
  let now = 0;
  const recorder = new PatternRecorder({ now: () => now });
  const advance = (ms: number) => {
    now += ms;
  };
  return { recorder, advance };
}

describe('PatternRecorder', () => {
  it('records basic taps and converts to HPL', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    recorder.tap();        // t=0, default 0.6 → '#'
    advance(100);
    recorder.tap();        // t=100, default 0.6 → '#'
    recorder.stop();

    // 100ms gap = 2 pauses (100/50)
    expect(recorder.toHPL()).toBe('#..#');
  });

  it('records with different intensities', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    recorder.tap(0.2);     // light → '~'
    advance(50);
    recorder.tap(0.5);     // medium → '#'
    advance(50);
    recorder.tap(0.9);     // heavy → '@'
    recorder.stop();

    expect(recorder.toHPL()).toBe('~.#.@');
  });

  it('converts gaps to correct number of pauses', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    recorder.tap();
    advance(200);          // 200ms gap = 4 pauses
    recorder.tap();
    recorder.stop();

    expect(recorder.toHPL()).toBe('#....#');
  });

  it('merges very short gaps (<25ms) as consecutive taps', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    recorder.tap();
    advance(10);           // <25ms, no pause
    recorder.tap();
    recorder.stop();

    expect(recorder.toHPL()).toBe('##');
  });

  it('quantizes taps to grid', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    recorder.tap();        // t=0
    advance(73);           // t=73, slightly off grid
    recorder.tap();
    advance(108);          // t=181, slightly off grid
    recorder.tap();
    recorder.stop();

    recorder.quantize(50); // snap to 50ms grid

    // After quantize: t=0, t=50, t=200 (73→50, 181→200? let's check)
    // 73 → round(73/50)*50 = round(1.46)*50 = 1*50 = 50
    // 181 → round(181/50)*50 = round(3.62)*50 = 4*50 = 200
    // gaps: 50ms (1 pause), 150ms (3 pauses)
    expect(recorder.toHPL()).toBe('#.#...#');
  });

  it('toSteps() produces valid HapticStep[]', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    recorder.tap(0.5);
    advance(100);
    recorder.tap(0.8);
    recorder.stop();

    const steps = recorder.toSteps();

    expect(steps).toHaveLength(3); // vibrate, pause, vibrate
    expect(steps[0]).toEqual({ type: 'vibrate', duration: 10, intensity: 0.5 });
    expect(steps[1]).toEqual({ type: 'pause', duration: 100, intensity: 0 });
    expect(steps[2]).toEqual({ type: 'vibrate', duration: 10, intensity: 0.8 });
  });

  it('toPattern() returns a HapticPattern', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    recorder.tap();
    advance(50);
    recorder.tap();
    recorder.stop();

    const pattern = recorder.toPattern('my-rhythm');
    expect(pattern.name).toBe('my-rhythm');
    expect(pattern.steps.length).toBeGreaterThan(0);
    expect(pattern.steps[0]!.type).toBe('vibrate');
  });

  it('toPattern() uses default name', () => {
    const { recorder } = createRecorder();
    recorder.start();
    recorder.tap();
    recorder.stop();

    expect(recorder.toPattern().name).toBe('recorded-pattern');
  });

  it('clear() resets state', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    recorder.tap();
    advance(50);
    recorder.tap();
    recorder.stop();

    expect(recorder.tapCount).toBe(2);

    recorder.clear();

    expect(recorder.tapCount).toBe(0);
    expect(recorder.isRecording).toBe(false);
    expect(recorder.duration).toBe(0);
    expect(recorder.toHPL()).toBe('');
    expect(recorder.toSteps()).toEqual([]);
  });

  it('tracks isRecording state', () => {
    const { recorder } = createRecorder();

    expect(recorder.isRecording).toBe(false);

    recorder.start();
    expect(recorder.isRecording).toBe(true);

    recorder.stop();
    expect(recorder.isRecording).toBe(false);
  });

  it('tracks tapCount', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    expect(recorder.tapCount).toBe(0);

    recorder.tap();
    expect(recorder.tapCount).toBe(1);

    advance(50);
    recorder.tap();
    expect(recorder.tapCount).toBe(2);

    advance(50);
    recorder.tap();
    expect(recorder.tapCount).toBe(3);

    recorder.stop();
    expect(recorder.tapCount).toBe(3);
  });

  it('tracks duration', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    recorder.tap();
    advance(200);
    recorder.tap();
    advance(100);
    recorder.stop();

    expect(recorder.duration).toBe(300);
  });

  it('ignores taps when not recording', () => {
    const { recorder } = createRecorder();

    recorder.tap();
    recorder.tap();

    expect(recorder.tapCount).toBe(0);
  });

  it('onTap callback fires for each tap', () => {
    const { recorder, advance } = createRecorder();
    const taps: Array<{ intensity: number; index: number }> = [];

    recorder.onTap((tap, index) => {
      taps.push({ intensity: tap.intensity, index });
    });

    recorder.start();
    recorder.tap(0.3);
    advance(50);
    recorder.tap(0.9);
    recorder.stop();

    expect(taps).toHaveLength(2);
    expect(taps[0]).toEqual({ intensity: 0.3, index: 0 });
    expect(taps[1]).toEqual({ intensity: 0.9, index: 1 });
  });

  it('clamps intensity to 0-1 range', () => {
    const { recorder } = createRecorder();

    recorder.start();
    recorder.tap(-0.5);
    recorder.tap(1.5);
    recorder.stop();

    const steps = recorder.toSteps();
    expect(steps[0]!.intensity).toBe(0);
    expect(steps[1]!.intensity).toBe(1);
  });

  it('stop() returns recorded taps', () => {
    const { recorder, advance } = createRecorder();

    recorder.start();
    recorder.tap(0.4);
    advance(100);
    recorder.tap(0.8);
    const result = recorder.stop();

    expect(result).toHaveLength(2);
    expect(result[0]!.time).toBe(0);
    expect(result[0]!.intensity).toBe(0.4);
    expect(result[1]!.time).toBe(100);
    expect(result[1]!.intensity).toBe(0.8);
  });
});
