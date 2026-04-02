import { HapticEngine } from '@hapticjs/core';
import type { ImpactStyle } from '@hapticjs/core';

const SEMANTIC_EFFECTS = [
  'tap',
  'doubleTap',
  'success',
  'warning',
  'error',
  'selection',
] as const;

type SemanticEffectName = (typeof SEMANTIC_EFFECTS)[number];

/**
 * Custom element that triggers haptic feedback on click.
 *
 * Usage:
 *   <haptic-button effect="tap">Click me</haptic-button>
 *   <haptic-button effect="success">Submit</haptic-button>
 *   <haptic-button pattern="~~..##">Custom</haptic-button>
 *   <haptic-button effect="impact" intensity="0.8">Heavy</haptic-button>
 */
export class HapticButtonElement extends HTMLElement {
  static observedAttributes = ['effect', 'pattern', 'intensity', 'disabled'];

  private engine: HapticEngine;
  private button: HTMLButtonElement;
  private handleClick: () => void;

  constructor() {
    super();
    this.engine = HapticEngine.create();

    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: inline-block;
      }
      button {
        all: inherit;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    `;

    this.button = document.createElement('button');
    this.button.setAttribute('part', 'button');
    this.button.innerHTML = '<slot></slot>';

    shadow.appendChild(style);
    shadow.appendChild(this.button);

    this.handleClick = () => this._triggerEffect();
  }

  connectedCallback(): void {
    this.button.addEventListener('click', this.handleClick);
    this._syncDisabled();
  }

  disconnectedCallback(): void {
    this.button.removeEventListener('click', this.handleClick);
    this.engine.dispose();
  }

  attributeChangedCallback(name: string, _old: string | null, _next: string | null): void {
    if (name === 'disabled') {
      this._syncDisabled();
    }
  }

  private _syncDisabled(): void {
    const isDisabled = this.hasAttribute('disabled');
    if (isDisabled) {
      this.button.setAttribute('disabled', '');
    } else {
      this.button.removeAttribute('disabled');
    }
  }

  private async _triggerEffect(): Promise<void> {
    if (this.hasAttribute('disabled')) return;

    const pattern = this.getAttribute('pattern');
    if (pattern) {
      await this.engine.play(pattern);
      return;
    }

    const effect = this.getAttribute('effect') || 'tap';
    const intensity = this.getAttribute('intensity');
    const intensityValue = intensity ? parseFloat(intensity) : undefined;

    if (effect === 'impact') {
      await this.engine.impact((intensity as ImpactStyle) ?? 'medium');
      return;
    }

    if (SEMANTIC_EFFECTS.includes(effect as SemanticEffectName)) {
      const method = this.engine[effect as SemanticEffectName];
      if (typeof method === 'function') {
        if (effect === 'tap' || effect === 'doubleTap') {
          await (method as (i?: number) => Promise<void>).call(this.engine, intensityValue);
        } else {
          await (method as () => Promise<void>).call(this.engine);
        }
        return;
      }
    }

    // Fall back to playing as HPL
    await this.engine.play(effect);
  }
}

if (typeof customElements !== 'undefined') {
  customElements.define('haptic-button', HapticButtonElement);
}
