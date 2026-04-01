import { describe, it, expect } from 'vitest';
import { NoopAdapter } from '../../src/adapters/noop.adapter';

describe('NoopAdapter', () => {
  it('reports as unsupported', () => {
    const adapter = new NoopAdapter();
    expect(adapter.supported).toBe(false);
    expect(adapter.name).toBe('noop');
  });

  it('has zero capabilities', () => {
    const caps = new NoopAdapter().capabilities();
    expect(caps.maxIntensityLevels).toBe(0);
    expect(caps.supportsIntensity).toBe(false);
    expect(caps.supportsPattern).toBe(false);
  });

  it('pulse does nothing without error', async () => {
    await expect(new NoopAdapter().pulse(1, 100)).resolves.toBeUndefined();
  });

  it('playSequence does nothing without error', async () => {
    await expect(
      new NoopAdapter().playSequence([{ type: 'vibrate', duration: 50, intensity: 1 }]),
    ).resolves.toBeUndefined();
  });

  it('cancel and dispose do nothing without error', () => {
    const adapter = new NoopAdapter();
    expect(() => adapter.cancel()).not.toThrow();
    expect(() => adapter.dispose()).not.toThrow();
  });
});
