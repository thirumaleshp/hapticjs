import { describe, it, expect } from 'vitest';
import { presets, ui, notifications, gaming, accessibility, system } from '../src/presets';

describe('Presets', () => {
  it('exports all categories', () => {
    expect(presets.ui).toBeDefined();
    expect(presets.notifications).toBeDefined();
    expect(presets.gaming).toBeDefined();
    expect(presets.accessibility).toBeDefined();
    expect(presets.system).toBeDefined();
  });

  it('all presets have valid structure', () => {
    const allPresets = [
      ...Object.values(ui),
      ...Object.values(notifications),
      ...Object.values(gaming),
      ...Object.values(accessibility),
      ...Object.values(system),
    ];

    for (const preset of allPresets) {
      expect(preset.name).toBeTruthy();
      expect(preset.steps).toBeInstanceOf(Array);
      expect(preset.steps.length).toBeGreaterThan(0);

      for (const step of preset.steps) {
        expect(step.type).toMatch(/^(vibrate|pause)$/);
        expect(step.duration).toBeGreaterThan(0);
        expect(step.intensity).toBeGreaterThanOrEqual(0);
        expect(step.intensity).toBeLessThanOrEqual(1);
      }
    }
  });

  it('has at least 30 presets total', () => {
    const total =
      Object.keys(ui).length +
      Object.keys(notifications).length +
      Object.keys(gaming).length +
      Object.keys(accessibility).length +
      Object.keys(system).length;

    expect(total).toBeGreaterThanOrEqual(30);
  });

  it('UI presets include common interactions', () => {
    expect(ui.tap).toBeDefined();
    expect(ui.doubleTap).toBeDefined();
    expect(ui.longPress).toBeDefined();
    expect(ui.selection).toBeDefined();
    expect(ui.toggleOn).toBeDefined();
    expect(ui.toggleOff).toBeDefined();
  });

  it('notification presets include standard types', () => {
    expect(notifications.success).toBeDefined();
    expect(notifications.warning).toBeDefined();
    expect(notifications.error).toBeDefined();
    expect(notifications.info).toBeDefined();
  });
});
