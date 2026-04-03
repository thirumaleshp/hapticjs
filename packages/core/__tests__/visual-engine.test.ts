import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VisualEngine } from '../src/visual/visual-engine';

describe('VisualEngine', () => {
  let engine: VisualEngine;

  beforeEach(() => {
    vi.useFakeTimers();
    engine = new VisualEngine();
  });

  afterEach(() => {
    engine.dispose();
    vi.useRealTimers();
    // Clean up any injected style tags
    const style = document.getElementById('__hapticjs_visual_keyframes__');
    if (style) style.remove();
  });

  describe('constructor', () => {
    it('defaults to enabled with intensity 1.0', () => {
      expect(engine.enabled).toBe(true);
      expect(engine.intensity).toBe(1.0);
    });

    it('respects custom options', () => {
      const target = document.createElement('div');
      const custom = new VisualEngine({ enabled: false, target, intensity: 0.5 });
      expect(custom.enabled).toBe(false);
      expect(custom.intensity).toBe(0.5);
      custom.dispose();
    });
  });

  describe('flash()', () => {
    it('creates and appends an overlay div to the body', () => {
      engine.flash();
      const overlays = document.querySelectorAll('div[style*="position: fixed"]');
      expect(overlays.length).toBeGreaterThan(0);
    });

    it('removes the overlay after duration', () => {
      engine.flash({ duration: 100 });
      vi.advanceTimersByTime(200);
      // After cleanup, no fixed overlays from this engine
      const overlays = document.querySelectorAll('div[style*="z-index: 99999"]');
      expect(overlays.length).toBe(0);
    });

    it('respects custom color and opacity', () => {
      engine.flash({ color: 'red', opacity: 0.5 });
      const overlay = document.querySelector('div[style*="background-color: red"]');
      expect(overlay).not.toBeNull();
    });

    it('does nothing when disabled', () => {
      const disabled = new VisualEngine({ enabled: false });
      disabled.flash();
      const overlays = document.querySelectorAll('div[style*="z-index: 99999"]');
      expect(overlays.length).toBe(0);
      disabled.dispose();
    });
  });

  describe('shake()', () => {
    it('applies a shake animation to the target', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.shake();
      expect(target.style.animation).toContain('hapticjs-shake');
      target.remove();
    });

    it('injects a style tag with keyframes', () => {
      engine.shake();
      const style = document.getElementById('__hapticjs_visual_keyframes__');
      expect(style).not.toBeNull();
      expect(style?.textContent).toContain('@keyframes hapticjs-shake');
    });

    it('restores previous animation after duration', () => {
      const target = document.createElement('div');
      target.style.animation = 'none';
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.shake({ duration: 200 });
      vi.advanceTimersByTime(300);
      expect(target.style.animation).toBe('none');
      target.remove();
    });
  });

  describe('pulse()', () => {
    it('applies a pulse animation', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.pulse();
      expect(target.style.animation).toContain('hapticjs-pulse');
      target.remove();
    });

    it('respects custom scale option', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.pulse({ scale: 1.1 });
      expect(target.style.animation).toContain('hapticjs-pulse');
      target.remove();
    });
  });

  describe('ripple()', () => {
    it('creates a ripple element at specified coordinates', () => {
      engine.ripple(100, 200);
      const ripple = document.querySelector('div[style*="border-radius: 50%"]');
      expect(ripple).not.toBeNull();
    });

    it('removes ripple after duration', () => {
      engine.ripple(100, 200, { duration: 300 });
      vi.advanceTimersByTime(400);
      const ripple = document.querySelector('div[style*="border-radius: 50%"]');
      expect(ripple).toBeNull();
    });

    it('applies custom color and size', () => {
      engine.ripple(50, 50, { color: 'blue', size: 200 });
      const ripple = document.querySelector('div[style*="border-radius: 50%"]');
      expect(ripple).not.toBeNull();
    });
  });

  describe('glow()', () => {
    it('applies box-shadow to target element', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.glow();
      expect(target.style.boxShadow).toContain('0 0');
      target.remove();
    });

    it('removes glow after duration', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.glow({ duration: 200 });
      vi.advanceTimersByTime(300);
      expect(target.style.boxShadow).toBe('');
      target.remove();
    });
  });

  describe('bounce()', () => {
    it('applies bounce animation to target', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.bounce();
      expect(target.style.animation).toContain('hapticjs-bounce');
      target.remove();
    });
  });

  describe('jello()', () => {
    it('applies jello animation to target', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.jello();
      expect(target.style.animation).toContain('hapticjs-jello');
      target.remove();
    });
  });

  describe('rubber()', () => {
    it('applies rubber animation to target', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.rubber();
      expect(target.style.animation).toContain('hapticjs-rubber');
      target.remove();
    });

    it('accepts custom scaleX and scaleY', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.rubber({ scaleX: 1.3, scaleY: 0.7, duration: 400 });
      expect(target.style.animation).toContain('hapticjs-rubber');
      target.remove();
    });
  });

  describe('highlight()', () => {
    it('applies background color to target', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.highlight();
      expect(target.style.backgroundColor).not.toBe('');
      target.remove();
    });

    it('restores original background after duration', () => {
      const target = document.createElement('div');
      target.style.backgroundColor = 'green';
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.highlight({ duration: 200 });
      vi.advanceTimersByTime(300);
      expect(target.style.backgroundColor).toBe('green');
      target.remove();
    });
  });

  describe('setTarget()', () => {
    it('changes the target element for animations', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      document.body.appendChild(div1);
      document.body.appendChild(div2);

      engine.setTarget(div1);
      engine.shake();
      expect(div1.style.animation).toContain('hapticjs-shake');

      engine.setTarget(div2);
      engine.pulse();
      expect(div2.style.animation).toContain('hapticjs-pulse');

      div1.remove();
      div2.remove();
    });
  });

  describe('dispose()', () => {
    it('cleans up all active animations', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      engine.setTarget(target);

      engine.shake();
      engine.glow();
      engine.dispose();

      // After dispose, animations should be cleaned
      expect(target.style.animation).toBe('');
      target.remove();
    });

    it('removes flash overlays', () => {
      engine.flash({ duration: 5000 });
      engine.flash({ duration: 5000 });

      engine.dispose();

      const overlays = document.querySelectorAll('div[style*="z-index: 99999"]');
      expect(overlays.length).toBe(0);
    });
  });

  describe('intensity scaling', () => {
    it('scales effects by the intensity multiplier', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);

      const lowIntensity = new VisualEngine({ intensity: 0.5, target });
      lowIntensity.glow({ size: 20 });

      // The glow size should be scaled by 0.5 -> size 10
      expect(target.style.boxShadow).toContain('10px');

      lowIntensity.dispose();
      target.remove();
    });
  });
});
