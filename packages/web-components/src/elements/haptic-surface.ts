import { HapticEngine } from '@hapticjs/core';

/**
 * Custom element that wraps content and adds haptic feedback on interaction.
 *
 * Usage:
 *   <haptic-surface on-tap="tap" on-press="success" on-hover="selection">
 *     <div>Interactive content</div>
 *   </haptic-surface>
 *
 *   <haptic-surface on-tap="~~..##">
 *     <img src="photo.jpg" />
 *   </haptic-surface>
 */
export class HapticSurfaceElement extends HTMLElement {
  static observedAttributes = ['on-tap', 'on-press', 'on-hover'];

  private engine: HapticEngine;
  private handlePointerDown: () => void;
  private handlePointerUp: () => void;
  private handlePointerEnter: () => void;

  constructor() {
    super();
    this.engine = HapticEngine.create();

    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: contents;
      }
    `;

    const slot = document.createElement('slot');

    shadow.appendChild(style);
    shadow.appendChild(slot);

    this.handlePointerDown = () => this._playEffect('on-tap');
    this.handlePointerUp = () => this._playEffect('on-press');
    this.handlePointerEnter = () => this._playEffect('on-hover');
  }

  connectedCallback(): void {
    this.addEventListener('pointerdown', this.handlePointerDown);
    this.addEventListener('pointerup', this.handlePointerUp);
    this.addEventListener('pointerenter', this.handlePointerEnter);
  }

  disconnectedCallback(): void {
    this.removeEventListener('pointerdown', this.handlePointerDown);
    this.removeEventListener('pointerup', this.handlePointerUp);
    this.removeEventListener('pointerenter', this.handlePointerEnter);
    this.engine.dispose();
  }

  private async _playEffect(attr: string): Promise<void> {
    const value = this.getAttribute(attr);
    if (!value) return;

    // Check if it's a semantic effect
    if (value in this.engine) {
      const method = this.engine[value as keyof HapticEngine];
      if (typeof method === 'function') {
        await (method as () => Promise<void>).call(this.engine);
        return;
      }
    }

    // Treat as HPL pattern
    await this.engine.play(value);
  }
}

if (typeof customElements !== 'undefined') {
  customElements.define('haptic-surface', HapticSurfaceElement);
}
