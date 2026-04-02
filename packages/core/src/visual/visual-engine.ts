/** Options for VisualEngine construction */
export interface VisualEngineOptions {
  enabled?: boolean;
  target?: HTMLElement;
  intensity?: number;
}

export interface FlashOptions {
  color?: string;
  duration?: number;
  opacity?: number;
}

export interface ShakeOptions {
  intensity?: number;
  duration?: number;
}

export interface PulseOptions {
  scale?: number;
  duration?: number;
}

export interface RippleOptions {
  color?: string;
  size?: number;
  duration?: number;
}

export interface GlowOptions {
  color?: string;
  duration?: number;
  size?: number;
}

export interface BounceOptions {
  height?: number;
  duration?: number;
}

export interface JelloOptions {
  intensity?: number;
  duration?: number;
}

export interface RubberOptions {
  scaleX?: number;
  scaleY?: number;
  duration?: number;
}

export interface HighlightOptions {
  color?: string;
  duration?: number;
}

const STYLE_ID = '__hapticjs_visual_keyframes__';

/**
 * CSS-based visual feedback effects that complement haptic patterns.
 * Works everywhere including desktop/iOS where vibration is unavailable.
 */
export class VisualEngine {
  private _enabled: boolean;
  private _target: HTMLElement | null;
  private _intensity: number;
  private _styleInjected = false;
  private _cleanups: Array<() => void> = [];

  constructor(options?: VisualEngineOptions) {
    this._enabled = options?.enabled ?? true;
    this._target = options?.target ?? null;
    this._intensity = options?.intensity ?? 1.0;
  }

  // ─── Public API ──────────────────────────────────────────

  /** Quick screen flash overlay */
  flash(options?: FlashOptions): void {
    if (!this._canRun()) return;

    const color = options?.color ?? 'white';
    const duration = options?.duration ?? 100;
    const opacity = options?.opacity ?? 0.15;

    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      backgroundColor: color,
      opacity: String(opacity * this._intensity),
      pointerEvents: 'none',
      zIndex: '99999',
      transition: `opacity ${duration}ms ease-out`,
    });

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '0';
    });

    const timer = setTimeout(() => {
      overlay.remove();
      this._removeCleanup(cleanup);
    }, duration + 50);

    const cleanup = () => {
      clearTimeout(timer);
      overlay.remove();
    };
    this._cleanups.push(cleanup);
  }

  /** CSS shake animation on target */
  shake(options?: ShakeOptions): void {
    if (!this._canRun()) return;
    this._injectStyles();

    const target = this._getTarget();
    const intensity = (options?.intensity ?? 3) * this._intensity;
    const duration = options?.duration ?? 200;

    const magnitude = Math.round(intensity);
    const name = `hapticjs-shake-${magnitude}`;

    this._ensureKeyframes(
      name,
      `0%,100%{transform:translateX(0)}` +
        `10%,30%,50%,70%,90%{transform:translateX(-${magnitude}px)}` +
        `20%,40%,60%,80%{transform:translateX(${magnitude}px)}`,
    );

    this._applyAnimation(target, name, duration);
  }

  /** Scale pulse animation */
  pulse(options?: PulseOptions): void {
    if (!this._canRun()) return;
    this._injectStyles();

    const target = this._getTarget();
    const scale = options?.scale ?? 1.02;
    const duration = options?.duration ?? 150;

    const adjusted = 1 + (scale - 1) * this._intensity;
    const name = `hapticjs-pulse-${Math.round(adjusted * 1000)}`;

    this._ensureKeyframes(
      name,
      `0%,100%{transform:scale(1)}50%{transform:scale(${adjusted})}`,
    );

    this._applyAnimation(target, name, duration);
  }

  /** Material Design style ripple at coordinates */
  ripple(x: number, y: number, options?: RippleOptions): void {
    if (!this._canRun()) return;
    this._injectStyles();

    const color = options?.color ?? 'rgba(255,255,255,0.4)';
    const size = options?.size ?? 100;
    const duration = options?.duration ?? 400;

    this._ensureKeyframes(
      'hapticjs-ripple',
      `0%{transform:scale(0);opacity:1}100%{transform:scale(4);opacity:0}`,
    );

    const el = document.createElement('div');
    const half = size / 2;

    Object.assign(el.style, {
      position: 'fixed',
      left: `${x - half}px`,
      top: `${y - half}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: color,
      pointerEvents: 'none',
      zIndex: '99999',
      animation: `hapticjs-ripple ${duration}ms ease-out forwards`,
    });

    document.body.appendChild(el);

    const timer = setTimeout(() => {
      el.remove();
      this._removeCleanup(cleanup);
    }, duration + 50);

    const cleanup = () => {
      clearTimeout(timer);
      el.remove();
    };
    this._cleanups.push(cleanup);
  }

  /** Box shadow glow effect */
  glow(options?: GlowOptions): void {
    if (!this._canRun()) return;

    const target = this._getTarget();
    const color = options?.color ?? 'rgba(59,130,246,0.5)';
    const duration = options?.duration ?? 300;
    const size = (options?.size ?? 15) * this._intensity;

    const prev = target.style.boxShadow;
    const prevTransition = target.style.transition;

    target.style.transition = `box-shadow ${duration / 2}ms ease-in-out`;
    target.style.boxShadow = `0 0 ${size}px ${color}`;

    const timer = setTimeout(() => {
      target.style.boxShadow = prev;
      setTimeout(() => {
        target.style.transition = prevTransition;
        this._removeCleanup(cleanup);
      }, duration / 2);
    }, duration / 2);

    const cleanup = () => {
      clearTimeout(timer);
      target.style.boxShadow = prev;
      target.style.transition = prevTransition;
    };
    this._cleanups.push(cleanup);
  }

  /** Bounce animation on target */
  bounce(options?: BounceOptions): void {
    if (!this._canRun()) return;
    this._injectStyles();

    const target = this._getTarget();
    const height = (options?.height ?? 8) * this._intensity;
    const duration = options?.duration ?? 300;

    const name = `hapticjs-bounce-${Math.round(height)}`;

    this._ensureKeyframes(
      name,
      `0%,100%{transform:translateY(0)}` +
        `40%{transform:translateY(-${height}px)}` +
        `60%{transform:translateY(-${Math.round(height * 0.4)}px)}`,
    );

    this._applyAnimation(target, name, duration);
  }

  /** Jello/wobble animation */
  jello(options?: JelloOptions): void {
    if (!this._canRun()) return;
    this._injectStyles();

    const target = this._getTarget();
    const intensity = (options?.intensity ?? 5) * this._intensity;
    const duration = options?.duration ?? 400;

    const skew = intensity;
    const name = `hapticjs-jello-${Math.round(skew)}`;

    this._ensureKeyframes(
      name,
      `0%,100%{transform:skew(0)}` +
        `20%{transform:skew(-${skew}deg)}` +
        `40%{transform:skew(${skew * 0.6}deg)}` +
        `60%{transform:skew(-${skew * 0.3}deg)}` +
        `80%{transform:skew(${skew * 0.1}deg)}`,
    );

    this._applyAnimation(target, name, duration);
  }

  /** Rubber band scale effect */
  rubber(options?: RubberOptions): void {
    if (!this._canRun()) return;
    this._injectStyles();

    const target = this._getTarget();
    const scaleX = options?.scaleX ?? 1.15;
    const scaleY = options?.scaleY ?? 0.85;
    const duration = options?.duration ?? 300;

    const name = `hapticjs-rubber-${Math.round(scaleX * 100)}-${Math.round(scaleY * 100)}`;

    this._ensureKeyframes(
      name,
      `0%,100%{transform:scale(1,1)}` +
        `30%{transform:scale(${scaleX},${scaleY})}` +
        `60%{transform:scale(${2 - scaleX},${2 - scaleY})}`,
    );

    this._applyAnimation(target, name, duration);
  }

  /** Brief background color highlight */
  highlight(options?: HighlightOptions): void {
    if (!this._canRun()) return;

    const target = this._getTarget();
    const color = options?.color ?? 'rgba(255,255,0,0.2)';
    const duration = options?.duration ?? 300;

    const prev = target.style.backgroundColor;
    const prevTransition = target.style.transition;

    target.style.transition = `background-color ${duration / 2}ms ease-in-out`;
    target.style.backgroundColor = color;

    const timer = setTimeout(() => {
      target.style.backgroundColor = prev;
      setTimeout(() => {
        target.style.transition = prevTransition;
        this._removeCleanup(cleanup);
      }, duration / 2);
    }, duration / 2);

    const cleanup = () => {
      clearTimeout(timer);
      target.style.backgroundColor = prev;
      target.style.transition = prevTransition;
    };
    this._cleanups.push(cleanup);
  }

  /** Change the target element for animations */
  setTarget(element: HTMLElement): void {
    this._target = element;
  }

  /** Whether the engine is enabled */
  get enabled(): boolean {
    return this._enabled;
  }

  /** Current intensity multiplier */
  get intensity(): number {
    return this._intensity;
  }

  /** Remove all active animations and clean up */
  dispose(): void {
    for (const cleanup of this._cleanups) {
      cleanup();
    }
    this._cleanups = [];
  }

  // ─── Internal ──────────────────────────────────────────────

  private _canRun(): boolean {
    return this._enabled && typeof document !== 'undefined';
  }

  private _getTarget(): HTMLElement {
    return this._target ?? document.body;
  }

  /** Inject a <style> tag for keyframes on first use */
  private _injectStyles(): void {
    if (this._styleInjected) return;
    if (typeof document === 'undefined') return;

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = ''; // keyframes added dynamically
      document.head.appendChild(style);
    }

    this._styleInjected = true;
  }

  /** Ensure a @keyframes rule exists in our style tag */
  private _ensureKeyframes(name: string, frames: string): void {
    const style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) return;

    // Check if already defined
    if (style.textContent?.includes(`@keyframes ${name}`)) return;

    style.textContent += `@keyframes ${name}{${frames}}`;
  }

  /** Apply a CSS animation to an element and clean up after */
  private _applyAnimation(
    target: HTMLElement,
    animationName: string,
    duration: number,
  ): void {
    const prev = target.style.animation;
    target.style.animation = `${animationName} ${duration}ms ease-in-out`;

    const timer = setTimeout(() => {
      target.style.animation = prev;
      this._removeCleanup(cleanup);
    }, duration + 50);

    const cleanup = () => {
      clearTimeout(timer);
      target.style.animation = prev;
    };
    this._cleanups.push(cleanup);
  }

  private _removeCleanup(fn: () => void): void {
    const idx = this._cleanups.indexOf(fn);
    if (idx !== -1) this._cleanups.splice(idx, 1);
  }
}
