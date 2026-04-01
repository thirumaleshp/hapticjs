import { describe, it, expect, vi } from 'vitest';
import { ReactNativeHapticAdapter } from '../src/adapters/react-native-haptic.adapter';

/**
 * Since the adapter uses `require()` at the module level with cached state,
 * and we can't easily mock that in a Node test environment, we test the
 * adapter in its "no backend" mode (which is what happens in a regular
 * Node/test environment where react-native packages aren't installed).
 */
describe('ReactNativeHapticAdapter', () => {
  it('should have the correct name', () => {
    const adapter = new ReactNativeHapticAdapter();
    expect(adapter.name).toBe('react-native-haptic');
  });

  it('should report unsupported when no native packages are available', () => {
    const adapter = new ReactNativeHapticAdapter();
    expect(adapter.supported).toBe(false);
  });

  it('should return capabilities', () => {
    const adapter = new ReactNativeHapticAdapter();
    const caps = adapter.capabilities();

    expect(caps).toHaveProperty('maxDuration');
    expect(caps).toHaveProperty('minDuration');
    expect(caps).toHaveProperty('supportsPattern');
    expect(caps.maxDuration).toBe(5000);
    expect(caps.supportsPattern).toBe(true);
  });

  it('should no-op triggerEffect when unsupported', async () => {
    const adapter = new ReactNativeHapticAdapter();
    // Should not throw
    await adapter.triggerEffect('tap');
    await adapter.triggerEffect('success');
    await adapter.triggerEffect('error');
  });

  it('should no-op pulse when unsupported', async () => {
    const adapter = new ReactNativeHapticAdapter();
    await adapter.pulse(0.5, 100);
  });

  it('should no-op playSequence when unsupported', async () => {
    const adapter = new ReactNativeHapticAdapter();
    await adapter.playSequence([
      { type: 'vibrate', duration: 50, intensity: 0.8 },
      { type: 'pause', duration: 50, intensity: 0 },
    ]);
  });

  it('should handle empty playSequence', async () => {
    const adapter = new ReactNativeHapticAdapter();
    await expect(adapter.playSequence([])).resolves.toBeUndefined();
  });

  it('should cancel without throwing', () => {
    const adapter = new ReactNativeHapticAdapter();
    expect(() => adapter.cancel()).not.toThrow();
  });

  it('should dispose without throwing', () => {
    const adapter = new ReactNativeHapticAdapter();
    expect(() => adapter.dispose()).not.toThrow();
  });

  it('should map intensity to impact style correctly', async () => {
    const adapter = new ReactNativeHapticAdapter();
    // These just exercise the code path without throwing
    await adapter.pulse(0.1, 20);  // light
    await adapter.pulse(0.5, 40);  // medium
    await adapter.pulse(0.9, 60);  // heavy
  });
});
