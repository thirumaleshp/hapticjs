import type { FallbackConfig, HapticStep } from '../types';

/**
 * Provides visual/audio fallback when haptic hardware is unavailable.
 */
export class FallbackManager {
  private config: FallbackConfig;

  constructor(config: FallbackConfig) {
    this.config = config;
  }

  updateConfig(config: FallbackConfig): void {
    this.config = config;
  }

  /** Execute fallback feedback for the given steps */
  async execute(steps: HapticStep[]): Promise<void> {
    if (this.config.type === 'none') return;

    const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
    const maxIntensity = Math.max(...steps.filter((s) => s.type === 'vibrate').map((s) => s.intensity), 0);

    if (this.config.type === 'visual' || this.config.type === 'both') {
      await this._visualFallback(totalDuration, maxIntensity);
    }

    if (this.config.type === 'audio' || this.config.type === 'both') {
      await this._audioFallback(totalDuration, maxIntensity);
    }
  }

  private async _visualFallback(duration: number, intensity: number): Promise<void> {
    const visual = this.config.visual;
    if (!visual || typeof document === 'undefined') return;

    const element = visual.element ?? document.body;
    const style = visual.style ?? 'pulse';
    const className = visual.className;

    if (className) {
      element.classList.add(className);
      setTimeout(() => element.classList.remove(className), duration);
      return;
    }

    // Built-in visual feedback
    switch (style) {
      case 'flash': {
        const opacity = 0.1 + intensity * 0.3;
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
          position: 'fixed',
          inset: '0',
          backgroundColor: `rgba(0, 0, 0, ${opacity})`,
          pointerEvents: 'none',
          zIndex: '99999',
          transition: `opacity ${duration}ms ease-out`,
        });
        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
          overlay.style.opacity = '0';
        });
        setTimeout(() => overlay.remove(), duration + 100);
        break;
      }
      case 'shake': {
        const magnitude = Math.round(intensity * 5);
        element.style.transition = 'none';
        element.style.transform = `translateX(${magnitude}px)`;
        setTimeout(() => {
          element.style.transition = `transform ${duration}ms ease-out`;
          element.style.transform = '';
        }, 50);
        break;
      }
      case 'pulse': {
        const scale = 1 + intensity * 0.02;
        element.style.transition = `transform ${duration}ms ease-out`;
        element.style.transform = `scale(${scale})`;
        setTimeout(() => {
          element.style.transform = '';
        }, duration);
        break;
      }
    }
  }

  private async _audioFallback(duration: number, intensity: number): Promise<void> {
    const audio = this.config.audio;
    if (!audio?.enabled || typeof AudioContext === 'undefined') return;

    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 200 + intensity * 200;
      gainNode.gain.value = audio.volume * intensity * 0.1;

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration / 1000);

      await new Promise<void>((resolve) => {
        oscillator.onended = () => {
          ctx.close();
          resolve();
        };
      });
    } catch {
      // Audio fallback is best-effort
    }
  }
}
