import { describe, it, expect } from 'vitest';
import { createHapticStore } from '../src/stores/haptic-store';

describe('createHapticStore', () => {
  it('creates a store with all methods', () => {
    const store = createHapticStore();
    expect(store.engine).toBeDefined();
    expect(typeof store.tap).toBe('function');
    expect(typeof store.doubleTap).toBe('function');
    expect(typeof store.success).toBe('function');
    expect(typeof store.warning).toBe('function');
    expect(typeof store.error).toBe('function');
    expect(typeof store.selection).toBe('function');
    expect(typeof store.toggle).toBe('function');
    expect(typeof store.play).toBe('function');
    expect(typeof store.vibrate).toBe('function');
  });

  it('has isSupported property', () => {
    const store = createHapticStore();
    expect(typeof store.isSupported).toBe('boolean');
  });

  it('accepts custom config', () => {
    const store = createHapticStore({ intensity: 0.5, enabled: true });
    expect(store.engine).toBeDefined();
  });
});
