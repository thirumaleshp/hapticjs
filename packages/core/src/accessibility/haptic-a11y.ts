/**
 * HapticA11y — auto-adds haptic feedback to common accessibility interactions.
 *
 * Attaches to DOM events (focus, blur, invalid, click) and uses
 * MutationObserver to watch for dynamically added elements.
 * Provides subtle, non-intrusive haptic cues for screen interactions.
 */

export interface HapticA11yOptions {
  /** Enable haptic on focus changes (default: true) */
  focusChange?: boolean;
  /** Enable haptic on form validation errors (default: true) */
  formErrors?: boolean;
  /** Enable haptic on navigation/link clicks (default: true) */
  navigation?: boolean;
  /** Enable haptic on alert/notification elements (default: true) */
  announcements?: boolean;
}

export class HapticA11y {
  private engine: any;
  private options: Required<HapticA11yOptions>;
  private _isAttached = false;
  private _root: any = null;
  private _observer: any = null;
  private _focusChangeCallback: ((event: any) => void) | null = null;
  private _formErrorCallback: ((event: any) => void) | null = null;

  // Bound handlers for cleanup
  private _handleFocusIn: ((e: any) => void) | null = null;
  private _handleFocusOut: ((e: any) => void) | null = null;
  private _handleInvalid: ((e: any) => void) | null = null;
  private _handleClick: ((e: any) => void) | null = null;

  constructor(engine: any, options: HapticA11yOptions = {}) {
    this.engine = engine;
    this.options = {
      focusChange: options.focusChange ?? true,
      formErrors: options.formErrors ?? true,
      navigation: options.navigation ?? true,
      announcements: options.announcements ?? true,
    };
  }

  /** Whether currently attached and listening */
  get isAttached(): boolean {
    return this._isAttached;
  }

  // ─── Attach / Detach ─────────────────────────────────────

  /**
   * Attach to a root element and begin listening for interactions.
   * Defaults to document.body if no root is provided.
   */
  attach(root?: any): void {
    if (this._isAttached) return;
    if (typeof document === 'undefined') return;

    this._root = root ?? document.body;
    if (!this._root) return;

    this._bindHandlers();
    this._attachListeners();
    this._startObserver();
    this._isAttached = true;
  }

  /** Remove all listeners and stop observing */
  detach(): void {
    if (!this._isAttached) return;

    this._removeListeners();
    this._stopObserver();
    this._isAttached = false;
    this._root = null;
  }

  // ─── Custom Handlers ─────────────────────────────────────

  /** Set a custom handler for focus changes */
  onFocusChange(callback?: (event: any) => void): void {
    this._focusChangeCallback = callback ?? null;
  }

  /** Set a custom handler for form errors */
  onFormError(callback?: (event: any) => void): void {
    this._formErrorCallback = callback ?? null;
  }

  // ─── Cleanup ─────────────────────────────────────────────

  /** Clean up all listeners, observers, and callbacks */
  dispose(): void {
    this.detach();
    this._focusChangeCallback = null;
    this._formErrorCallback = null;
  }

  // ─── Internal ────────────────────────────────────────────

  private _bindHandlers(): void {
    this._handleFocusIn = (e: any) => {
      if (!this.options.focusChange) return;

      if (this._focusChangeCallback) {
        this._focusChangeCallback(e);
        return;
      }

      // Subtle tick on focus change
      this._safeCall(() => this.engine.selection());
    };

    this._handleFocusOut = (_e: any) => {
      // No haptic on focus out — keep it subtle
    };

    this._handleInvalid = (e: any) => {
      if (!this.options.formErrors) return;

      if (this._formErrorCallback) {
        this._formErrorCallback(e);
        return;
      }

      // Error haptic on form validation failure
      this._safeCall(() => this.engine.error());
    };

    this._handleClick = (e: any) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tagName = target.tagName?.toLowerCase();

      // Button clicks → tap haptic
      if (tagName === 'button' || target.getAttribute?.('role') === 'button') {
        this._safeCall(() => this.engine.tap());
        return;
      }

      // Link navigation → selection haptic
      if (tagName === 'a' && this.options.navigation) {
        this._safeCall(() => this.engine.selection());
        return;
      }

      // Toggle inputs
      if (tagName === 'input') {
        const inputType = (target as any).type?.toLowerCase();
        if (inputType === 'checkbox' || inputType === 'radio') {
          const checked = (target as any).checked;
          this._safeCall(() => this.engine.toggle(checked));
        }
      }
    };
  }

  private _attachListeners(): void {
    if (!this._root) return;

    this._root.addEventListener('focusin', this._handleFocusIn, true);
    this._root.addEventListener('focusout', this._handleFocusOut, true);
    this._root.addEventListener('invalid', this._handleInvalid, true);
    this._root.addEventListener('click', this._handleClick, true);
  }

  private _removeListeners(): void {
    if (!this._root) return;

    this._root.removeEventListener('focusin', this._handleFocusIn, true);
    this._root.removeEventListener('focusout', this._handleFocusOut, true);
    this._root.removeEventListener('invalid', this._handleInvalid, true);
    this._root.removeEventListener('click', this._handleClick, true);
  }

  private _startObserver(): void {
    if (typeof MutationObserver === 'undefined') return;
    if (!this.options.announcements) return;

    this._observer = new MutationObserver((mutations: any[]) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue; // Element nodes only

          const el = node as HTMLElement;
          const role = el.getAttribute?.('role');
          const ariaLive = el.getAttribute?.('aria-live');

          // Alert/notification elements → warning haptic
          if (role === 'alert' || role === 'alertdialog') {
            this._safeCall(() => this.engine.warning());
          } else if (role === 'status' || ariaLive === 'polite' || ariaLive === 'assertive') {
            this._safeCall(() => this.engine.selection());
          }

          // Modal/dialog open → toggle haptic
          if (role === 'dialog' || el.tagName?.toLowerCase() === 'dialog') {
            this._safeCall(() => this.engine.toggle(true));
          }
        }

        // Modal/dialog removed → toggle haptic
        for (const node of mutation.removedNodes) {
          if (node.nodeType !== 1) continue;

          const el = node as HTMLElement;
          const role = el.getAttribute?.('role');

          if (role === 'dialog' || el.tagName?.toLowerCase() === 'dialog') {
            this._safeCall(() => this.engine.toggle(false));
          }
        }
      }
    });

    this._observer.observe(this._root, {
      childList: true,
      subtree: true,
    });
  }

  private _stopObserver(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  private _safeCall(fn: () => any): void {
    try {
      const result = fn();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          /* swallow haptic errors silently */
        });
      }
    } catch {
      /* swallow haptic errors silently */
    }
  }
}
