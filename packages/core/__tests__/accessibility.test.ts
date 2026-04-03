import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HapticA11y } from '../src/accessibility/haptic-a11y';

describe('HapticA11y', () => {
  let mockEngine: any;
  let a11y: HapticA11y;

  beforeEach(() => {
    mockEngine = {
      tap: vi.fn().mockResolvedValue(undefined),
      selection: vi.fn().mockResolvedValue(undefined),
      error: vi.fn().mockResolvedValue(undefined),
      warning: vi.fn().mockResolvedValue(undefined),
      toggle: vi.fn().mockResolvedValue(undefined),
    };
    a11y = new HapticA11y(mockEngine);
  });

  afterEach(() => {
    a11y.dispose();
  });

  describe('constructor', () => {
    it('creates with default options (all enabled)', () => {
      expect(a11y.isAttached).toBe(false);
    });

    it('accepts custom options', () => {
      const custom = new HapticA11y(mockEngine, {
        focusChange: false,
        formErrors: false,
        navigation: false,
        announcements: false,
      });
      expect(custom.isAttached).toBe(false);
      custom.dispose();
    });
  });

  describe('attach/detach', () => {
    it('attaches to document.body by default', () => {
      a11y.attach();
      expect(a11y.isAttached).toBe(true);
    });

    it('attaches to a custom root element', () => {
      const root = document.createElement('div');
      document.body.appendChild(root);
      a11y.attach(root);
      expect(a11y.isAttached).toBe(true);
      root.remove();
    });

    it('does not double-attach', () => {
      a11y.attach();
      a11y.attach(); // should be a no-op
      expect(a11y.isAttached).toBe(true);
    });

    it('detaches and stops listening', () => {
      a11y.attach();
      a11y.detach();
      expect(a11y.isAttached).toBe(false);
    });

    it('detach is safe when not attached', () => {
      expect(() => a11y.detach()).not.toThrow();
    });
  });

  describe('focus events', () => {
    it('triggers selection haptic on focusin', () => {
      a11y.attach();

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      expect(mockEngine.selection).toHaveBeenCalled();
      input.remove();
    });

    it('does not trigger when focusChange is disabled', () => {
      const noFocus = new HapticA11y(mockEngine, { focusChange: false });
      noFocus.attach();

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      expect(mockEngine.selection).not.toHaveBeenCalled();
      input.remove();
      noFocus.dispose();
    });

    it('calls custom focus change handler when set', () => {
      const handler = vi.fn();
      a11y.onFocusChange(handler);
      a11y.attach();

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      expect(handler).toHaveBeenCalled();
      expect(mockEngine.selection).not.toHaveBeenCalled();
      input.remove();
    });
  });

  describe('form validation events', () => {
    it('triggers error haptic on invalid event', () => {
      a11y.attach();

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.dispatchEvent(new Event('invalid', { bubbles: false }));

      expect(mockEngine.error).toHaveBeenCalled();
      input.remove();
    });

    it('does not trigger when formErrors is disabled', () => {
      const noForm = new HapticA11y(mockEngine, { formErrors: false });
      noForm.attach();

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.dispatchEvent(new Event('invalid', { bubbles: false }));

      expect(mockEngine.error).not.toHaveBeenCalled();
      input.remove();
      noForm.dispose();
    });

    it('calls custom form error handler when set', () => {
      const handler = vi.fn();
      a11y.onFormError(handler);
      a11y.attach();

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.dispatchEvent(new Event('invalid', { bubbles: false }));

      expect(handler).toHaveBeenCalled();
      expect(mockEngine.error).not.toHaveBeenCalled();
      input.remove();
    });
  });

  describe('click events', () => {
    it('triggers tap haptic on button click', () => {
      a11y.attach();

      const button = document.createElement('button');
      document.body.appendChild(button);
      button.click();

      expect(mockEngine.tap).toHaveBeenCalled();
      button.remove();
    });

    it('triggers tap haptic on role="button" click', () => {
      a11y.attach();

      const div = document.createElement('div');
      div.setAttribute('role', 'button');
      document.body.appendChild(div);
      div.click();

      expect(mockEngine.tap).toHaveBeenCalled();
      div.remove();
    });

    it('triggers selection haptic on link click', () => {
      a11y.attach();

      const link = document.createElement('a');
      link.href = '#';
      document.body.appendChild(link);
      link.click();

      expect(mockEngine.selection).toHaveBeenCalled();
      link.remove();
    });

    it('does not trigger link haptic when navigation is disabled', () => {
      const noNav = new HapticA11y(mockEngine, { navigation: false });
      noNav.attach();

      const link = document.createElement('a');
      link.href = '#';
      document.body.appendChild(link);
      link.click();

      expect(mockEngine.selection).not.toHaveBeenCalled();
      link.remove();
      noNav.dispose();
    });

    it('triggers toggle haptic on checkbox click', () => {
      a11y.attach();

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      document.body.appendChild(checkbox);
      checkbox.click();

      expect(mockEngine.toggle).toHaveBeenCalled();
      checkbox.remove();
    });
  });

  describe('MutationObserver - announcements', () => {
    it('triggers warning on alert role element added', async () => {
      a11y.attach();

      const alert = document.createElement('div');
      alert.setAttribute('role', 'alert');
      document.body.appendChild(alert);

      // MutationObserver is async
      await new Promise((r) => setTimeout(r, 0));

      expect(mockEngine.warning).toHaveBeenCalled();
      alert.remove();
    });

    it('triggers selection on aria-live polite element added', async () => {
      a11y.attach();

      const status = document.createElement('div');
      status.setAttribute('aria-live', 'polite');
      document.body.appendChild(status);

      await new Promise((r) => setTimeout(r, 0));

      expect(mockEngine.selection).toHaveBeenCalled();
      status.remove();
    });

    it('triggers toggle on dialog element added', async () => {
      a11y.attach();

      const dialog = document.createElement('div');
      dialog.setAttribute('role', 'dialog');
      document.body.appendChild(dialog);

      await new Promise((r) => setTimeout(r, 0));

      expect(mockEngine.toggle).toHaveBeenCalledWith(true);
      dialog.remove();
    });

    it('triggers toggle(false) when dialog is removed', async () => {
      a11y.attach();

      const dialog = document.createElement('div');
      dialog.setAttribute('role', 'dialog');
      document.body.appendChild(dialog);

      await new Promise((r) => setTimeout(r, 0));
      mockEngine.toggle.mockClear();

      dialog.remove();
      await new Promise((r) => setTimeout(r, 0));

      expect(mockEngine.toggle).toHaveBeenCalledWith(false);
    });

    it('does not observe when announcements is disabled', async () => {
      const noAnnounce = new HapticA11y(mockEngine, { announcements: false });
      noAnnounce.attach();

      const alert = document.createElement('div');
      alert.setAttribute('role', 'alert');
      document.body.appendChild(alert);

      await new Promise((r) => setTimeout(r, 0));

      expect(mockEngine.warning).not.toHaveBeenCalled();
      alert.remove();
      noAnnounce.dispose();
    });
  });

  describe('dispose()', () => {
    it('detaches and clears callbacks', () => {
      a11y.attach();
      a11y.onFocusChange(() => {});
      a11y.onFormError(() => {});

      a11y.dispose();

      expect(a11y.isAttached).toBe(false);
    });

    it('can be called multiple times safely', () => {
      a11y.attach();
      a11y.dispose();
      expect(() => a11y.dispose()).not.toThrow();
    });
  });

  describe('error resilience', () => {
    it('swallows engine errors silently', () => {
      mockEngine.tap.mockImplementation(() => {
        throw new Error('engine failure');
      });

      a11y.attach();

      const button = document.createElement('button');
      document.body.appendChild(button);

      expect(() => button.click()).not.toThrow();
      button.remove();
    });

    it('swallows promise rejection silently', () => {
      mockEngine.selection.mockReturnValue(Promise.reject(new Error('async fail')));

      a11y.attach();

      const input = document.createElement('input');
      document.body.appendChild(input);

      expect(() =>
        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true })),
      ).not.toThrow();
      input.remove();
    });
  });
});
