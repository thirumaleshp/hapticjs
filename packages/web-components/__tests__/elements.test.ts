import { describe, it, expect, beforeAll } from 'vitest';
import { HapticButtonElement } from '../src/elements/haptic-button';
import { HapticSurfaceElement } from '../src/elements/haptic-surface';
import { HapticToggleElement } from '../src/elements/haptic-toggle';

describe('HapticButtonElement', () => {
  it('should be a class', () => {
    expect(typeof HapticButtonElement).toBe('function');
  });

  it('should extend HTMLElement', () => {
    expect(HapticButtonElement.prototype instanceof HTMLElement).toBe(true);
  });

  it('should have observedAttributes', () => {
    expect(HapticButtonElement.observedAttributes).toEqual([
      'effect',
      'pattern',
      'intensity',
      'disabled',
    ]);
  });

  it('should register as custom element', () => {
    const registered = customElements.get('haptic-button');
    expect(registered).toBe(HapticButtonElement);
  });

  it('should create an element', () => {
    const el = document.createElement('haptic-button');
    expect(el).toBeInstanceOf(HapticButtonElement);
  });

  it('should render a button in shadow DOM', () => {
    const el = document.createElement('haptic-button');
    document.body.appendChild(el);
    const button = el.shadowRoot?.querySelector('button');
    expect(button).toBeTruthy();
    document.body.removeChild(el);
  });

  it('should render a slot inside the button', () => {
    const el = document.createElement('haptic-button');
    document.body.appendChild(el);
    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeTruthy();
    document.body.removeChild(el);
  });
});

describe('HapticSurfaceElement', () => {
  it('should be a class', () => {
    expect(typeof HapticSurfaceElement).toBe('function');
  });

  it('should extend HTMLElement', () => {
    expect(HapticSurfaceElement.prototype instanceof HTMLElement).toBe(true);
  });

  it('should have observedAttributes', () => {
    expect(HapticSurfaceElement.observedAttributes).toEqual([
      'on-tap',
      'on-press',
      'on-hover',
    ]);
  });

  it('should register as custom element', () => {
    const registered = customElements.get('haptic-surface');
    expect(registered).toBe(HapticSurfaceElement);
  });

  it('should create an element', () => {
    const el = document.createElement('haptic-surface');
    expect(el).toBeInstanceOf(HapticSurfaceElement);
  });

  it('should have a slot in shadow DOM', () => {
    const el = document.createElement('haptic-surface');
    document.body.appendChild(el);
    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeTruthy();
    document.body.removeChild(el);
  });
});

describe('HapticToggleElement', () => {
  it('should be a class', () => {
    expect(typeof HapticToggleElement).toBe('function');
  });

  it('should extend HTMLElement', () => {
    expect(HapticToggleElement.prototype instanceof HTMLElement).toBe(true);
  });

  it('should have observedAttributes', () => {
    expect(HapticToggleElement.observedAttributes).toEqual([
      'checked',
      'on-effect',
      'off-effect',
    ]);
  });

  it('should register as custom element', () => {
    const registered = customElements.get('haptic-toggle');
    expect(registered).toBe(HapticToggleElement);
  });

  it('should create an element', () => {
    const el = document.createElement('haptic-toggle');
    expect(el).toBeInstanceOf(HapticToggleElement);
  });

  it('should default to unchecked', () => {
    const el = document.createElement('haptic-toggle') as HapticToggleElement;
    document.body.appendChild(el);
    expect(el.checked).toBe(false);
    document.body.removeChild(el);
  });

  it('should be checked when attribute is set', () => {
    const el = document.createElement('haptic-toggle') as HapticToggleElement;
    el.setAttribute('checked', '');
    document.body.appendChild(el);
    expect(el.checked).toBe(true);
    document.body.removeChild(el);
  });

  it('should have track and thumb in shadow DOM', () => {
    const el = document.createElement('haptic-toggle');
    document.body.appendChild(el);
    const track = el.shadowRoot?.querySelector('.track');
    const thumb = el.shadowRoot?.querySelector('.thumb');
    expect(track).toBeTruthy();
    expect(thumb).toBeTruthy();
    document.body.removeChild(el);
  });

  it('should have role=switch on track', () => {
    const el = document.createElement('haptic-toggle');
    document.body.appendChild(el);
    const track = el.shadowRoot?.querySelector('.track');
    expect(track?.getAttribute('role')).toBe('switch');
    document.body.removeChild(el);
  });

  it('should set checked via property', () => {
    const el = document.createElement('haptic-toggle') as HapticToggleElement;
    document.body.appendChild(el);
    el.checked = true;
    expect(el.hasAttribute('checked')).toBe(true);
    el.checked = false;
    expect(el.hasAttribute('checked')).toBe(false);
    document.body.removeChild(el);
  });
});
