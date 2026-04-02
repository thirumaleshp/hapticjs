import { HapticEngine } from '@hapticjs/core';

/**
 * Toggle switch custom element with haptic feedback.
 *
 * Usage:
 *   <haptic-toggle></haptic-toggle>
 *   <haptic-toggle checked></haptic-toggle>
 *   <haptic-toggle on-effect="success" off-effect="error"></haptic-toggle>
 *
 * Fires a 'change' event with detail: { checked: boolean }
 */
export class HapticToggleElement extends HTMLElement {
  static observedAttributes = ['checked', 'on-effect', 'off-effect'];

  private engine: HapticEngine;
  private _checked = false;
  private track: HTMLDivElement;
  private thumb: HTMLDivElement;
  private handleClick: () => void;

  constructor() {
    super();
    this.engine = HapticEngine.create();

    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: inline-block;
        cursor: pointer;
        -webkit-user-select: none;
        user-select: none;
      }
      .track {
        width: 44px;
        height: 24px;
        border-radius: 12px;
        background: #ccc;
        position: relative;
        transition: background 0.2s ease;
      }
      .track[data-checked] {
        background: #4caf50;
      }
      .thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        position: absolute;
        top: 2px;
        left: 2px;
        transition: transform 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }
      .track[data-checked] .thumb {
        transform: translateX(20px);
      }
      :host([disabled]) {
        opacity: 0.5;
        pointer-events: none;
      }
    `;

    this.track = document.createElement('div');
    this.track.className = 'track';
    this.track.setAttribute('part', 'track');
    this.track.setAttribute('role', 'switch');
    this.track.setAttribute('tabindex', '0');

    this.thumb = document.createElement('div');
    this.thumb.className = 'thumb';
    this.thumb.setAttribute('part', 'thumb');

    this.track.appendChild(this.thumb);
    shadow.appendChild(style);
    shadow.appendChild(this.track);

    this.handleClick = () => this._toggle();
  }

  connectedCallback(): void {
    this._checked = this.hasAttribute('checked');
    this._syncState();
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this._handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this._handleKeydown);
    this.engine.dispose();
  }

  attributeChangedCallback(name: string, _old: string | null, _next: string | null): void {
    if (name === 'checked') {
      this._checked = this.hasAttribute('checked');
      this._syncState();
    }
  }

  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    this._checked = value;
    if (value) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    this._syncState();
  }

  private _syncState(): void {
    this.track.setAttribute('aria-checked', String(this._checked));
    if (this._checked) {
      this.track.setAttribute('data-checked', '');
    } else {
      this.track.removeAttribute('data-checked');
    }
  }

  private _handleKeydown = (e: Event): void => {
    const key = (e as KeyboardEvent).key;
    if (key === ' ' || key === 'Enter') {
      e.preventDefault();
      this._toggle();
    }
  };

  private async _toggle(): Promise<void> {
    this._checked = !this._checked;
    this._syncState();

    // Trigger haptic feedback
    const effectAttr = this._checked
      ? this.getAttribute('on-effect')
      : this.getAttribute('off-effect');

    if (effectAttr) {
      // Check if it's a semantic effect on the engine
      if (effectAttr in this.engine) {
        const method = this.engine[effectAttr as keyof HapticEngine];
        if (typeof method === 'function') {
          await (method as () => Promise<void>).call(this.engine);
        }
      } else {
        await this.engine.play(effectAttr);
      }
    } else {
      // Default: use engine toggle
      await this.engine.toggle(this._checked);
    }

    // Update attribute
    if (this._checked) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }

    // Fire change event
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { checked: this._checked },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

if (typeof customElements !== 'undefined') {
  customElements.define('haptic-toggle', HapticToggleElement);
}
