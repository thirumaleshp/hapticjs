import { describe, it, expect } from 'vitest';
import { HapticService } from '../src/services/haptic.service';

describe('HapticService', () => {
  it('should create an instance', () => {
    const service = new HapticService();
    expect(service).toBeDefined();
  });

  it('should create an instance with config', () => {
    const service = new HapticService({ intensity: 0.5, enabled: false });
    expect(service).toBeDefined();
  });

  it('should expose isSupported', () => {
    const service = new HapticService();
    expect(typeof service.isSupported).toBe('boolean');
  });

  it('should expose adapterName', () => {
    const service = new HapticService();
    expect(typeof service.adapterName).toBe('string');
  });

  it('should have all semantic methods', () => {
    const service = new HapticService();
    expect(typeof service.tap).toBe('function');
    expect(typeof service.doubleTap).toBe('function');
    expect(typeof service.success).toBe('function');
    expect(typeof service.warning).toBe('function');
    expect(typeof service.error).toBe('function');
    expect(typeof service.selection).toBe('function');
    expect(typeof service.toggle).toBe('function');
    expect(typeof service.impact).toBe('function');
  });

  it('should have parametric methods', () => {
    const service = new HapticService();
    expect(typeof service.play).toBe('function');
    expect(typeof service.vibrate).toBe('function');
    expect(typeof service.compose).toBe('function');
  });

  it('should have configure and dispose', () => {
    const service = new HapticService();
    expect(typeof service.configure).toBe('function');
    expect(typeof service.dispose).toBe('function');
  });

  it('should call tap without throwing', async () => {
    const service = new HapticService();
    await expect(service.tap()).resolves.toBeUndefined();
  });

  it('should call success without throwing', async () => {
    const service = new HapticService();
    await expect(service.success()).resolves.toBeUndefined();
  });

  it('should call configure without throwing', () => {
    const service = new HapticService();
    expect(() => service.configure({ intensity: 0.3 })).not.toThrow();
  });

  it('should dispose without throwing', () => {
    const service = new HapticService();
    expect(() => service.dispose()).not.toThrow();
  });
});
