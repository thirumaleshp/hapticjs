import { describe, it, expect } from 'vitest';
import { PatternComposer } from '../src/composer/pattern-composer';

describe('PatternComposer', () => {
  it('builds empty pattern', () => {
    const steps = new PatternComposer().build();
    expect(steps).toEqual([]);
  });

  it('builds tap', () => {
    const steps = new PatternComposer().tap(0.5).build();
    expect(steps).toEqual([{ type: 'vibrate', duration: 10, intensity: 0.5 }]);
  });

  it('builds vibrate with custom duration', () => {
    const steps = new PatternComposer().vibrate(200, 0.8).build();
    expect(steps).toEqual([{ type: 'vibrate', duration: 200, intensity: 0.8 }]);
  });

  it('builds buzz', () => {
    const steps = new PatternComposer().buzz(150, 0.6).build();
    expect(steps).toEqual([{ type: 'vibrate', duration: 150, intensity: 0.6 }]);
  });

  it('builds pause', () => {
    const steps = new PatternComposer().pause(100).build();
    expect(steps).toEqual([{ type: 'pause', duration: 100, intensity: 0 }]);
  });

  it('chains multiple operations', () => {
    const steps = new PatternComposer()
      .tap(0.5)
      .pause(100)
      .buzz(200)
      .build();
    expect(steps).toHaveLength(3);
    expect(steps[0]!.type).toBe('vibrate');
    expect(steps[1]!.type).toBe('pause');
    expect(steps[2]!.type).toBe('vibrate');
  });

  it('builds ramp with linear easing', () => {
    const steps = new PatternComposer()
      .ramp(0, 1, 100, 'linear')
      .build();
    expect(steps.length).toBeGreaterThan(1);
    // Intensity should increase
    expect(steps[steps.length - 1]!.intensity).toBeGreaterThan(steps[0]!.intensity);
  });

  it('builds pulse pattern', () => {
    const steps = new PatternComposer().pulse(3, 50, 30).build();
    // 3 vibrates + 2 pauses between them
    expect(steps).toHaveLength(5);
    expect(steps[0]!.type).toBe('vibrate');
    expect(steps[1]!.type).toBe('pause');
    expect(steps[1]!.duration).toBe(30);
  });

  it('repeats the pattern', () => {
    const steps = new PatternComposer().tap().repeat(3).build();
    expect(steps).toHaveLength(3);
  });

  it('calculates total duration', () => {
    const composer = new PatternComposer().vibrate(100).pause(50).vibrate(100);
    expect(composer.duration).toBe(250);
  });

  it('clears the pattern', () => {
    const composer = new PatternComposer().tap().pause(100);
    expect(composer.build()).toHaveLength(2);
    composer.clear();
    expect(composer.build()).toHaveLength(0);
  });

  it('play() calls the onPlay callback', async () => {
    let playedSteps: unknown[] = [];
    const composer = new PatternComposer();
    composer.onPlay(async (steps) => {
      playedSteps = steps;
    });
    await composer.tap().buzz(200).play();
    expect(playedSteps).toHaveLength(2);
  });
});
