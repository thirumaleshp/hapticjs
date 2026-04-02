/**
 * MotionDetector — detect device motion (shake, tilt, rotation) as INPUT
 * to trigger haptic feedback.
 *
 * Uses DeviceMotionEvent and DeviceOrientationEvent when available.
 * Handles SSR gracefully by checking for window/document.
 */

export interface MotionDetectorOptions {
  /** Acceleration magnitude threshold for shake detection (default: 15) */
  shakeThreshold?: number;
  /** Tilt angle change threshold in degrees (default: 10) */
  tiltThreshold?: number;
}

interface MotionCallbacks {
  shake: Array<(intensity: number) => void>;
  tilt: Array<(direction: { x: number; y: number }) => void>;
  rotation: Array<(angle: number) => void>;
  flip: Array<() => void>;
}

export class MotionDetector {
  private _shakeThreshold: number;
  private _tiltThreshold: number;
  private _isListening = false;
  private _callbacks: MotionCallbacks = {
    shake: [],
    tilt: [],
    rotation: [],
    flip: [],
  };
  private _lastOrientation: { beta: number; gamma: number } | null = null;
  private _lastFlipState: boolean | null = null;
  private _boundMotionHandler: ((e: any) => void) | null = null;
  private _boundOrientationHandler: ((e: any) => void) | null = null;

  constructor(options: MotionDetectorOptions = {}) {
    this._shakeThreshold = options.shakeThreshold ?? 15;
    this._tiltThreshold = options.tiltThreshold ?? 10;
  }

  // ─── Detection ───────────────────────────────────────────

  /** Whether DeviceMotion API is available */
  get isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'DeviceMotionEvent' in window;
  }

  /** Whether currently listening for motion events */
  get isListening(): boolean {
    return this._isListening;
  }

  // ─── Permission ──────────────────────────────────────────

  /**
   * Request permission for motion events (required on iOS 13+).
   * Returns true if permission was granted.
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const DeviceMotionEventRef = (window as any).DeviceMotionEvent;
    if (
      DeviceMotionEventRef &&
      typeof DeviceMotionEventRef.requestPermission === 'function'
    ) {
      try {
        const result = await DeviceMotionEventRef.requestPermission();
        return result === 'granted';
      } catch {
        return false;
      }
    }

    // No permission needed on this platform
    return this.isSupported;
  }

  // ─── Lifecycle ───────────────────────────────────────────

  /** Begin listening to device motion and orientation events */
  start(): void {
    if (this._isListening) return;
    if (typeof window === 'undefined') return;

    this._boundMotionHandler = this._handleMotion.bind(this);
    this._boundOrientationHandler = this._handleOrientation.bind(this);

    window.addEventListener('devicemotion', this._boundMotionHandler);
    window.addEventListener('deviceorientation', this._boundOrientationHandler);

    this._isListening = true;
  }

  /** Stop listening to motion events */
  stop(): void {
    if (!this._isListening) return;
    if (typeof window === 'undefined') return;

    if (this._boundMotionHandler) {
      window.removeEventListener('devicemotion', this._boundMotionHandler);
    }
    if (this._boundOrientationHandler) {
      window.removeEventListener('deviceorientation', this._boundOrientationHandler);
    }

    this._isListening = false;
    this._lastOrientation = null;
    this._lastFlipState = null;
  }

  // ─── Callbacks ───────────────────────────────────────────

  /** Register callback for shake events. Intensity is 0-1 based on acceleration. */
  onShake(callback: (intensity: number) => void): void {
    this._callbacks.shake.push(callback);
  }

  /** Register callback for tilt changes. Direction x/y are -1 to 1. */
  onTilt(callback: (direction: { x: number; y: number }) => void): void {
    this._callbacks.tilt.push(callback);
  }

  /** Register callback for rotation. Angle in degrees. */
  onRotation(callback: (angle: number) => void): void {
    this._callbacks.rotation.push(callback);
  }

  /** Register callback for device flip (face-down/up toggle). */
  onFlip(callback: () => void): void {
    this._callbacks.flip.push(callback);
  }

  // ─── Cleanup ─────────────────────────────────────────────

  /** Remove all listeners and callbacks */
  dispose(): void {
    this.stop();
    this._callbacks = { shake: [], tilt: [], rotation: [], flip: [] };
  }

  // ─── Internal ────────────────────────────────────────────

  private _handleMotion(event: any): void {
    const accel = event.accelerationIncludingGravity;
    if (!accel) return;

    const { x, y, z } = accel;
    if (x == null || y == null || z == null) return;

    // Calculate acceleration magnitude (subtract gravity ~9.8)
    const magnitude = Math.sqrt(x * x + y * y + z * z) - 9.81;

    if (magnitude > this._shakeThreshold) {
      // Normalize intensity to 0-1 range (threshold to 2x threshold)
      const intensity = Math.min(
        1,
        (magnitude - this._shakeThreshold) / this._shakeThreshold,
      );
      for (const cb of this._callbacks.shake) {
        cb(intensity);
      }
    }
  }

  private _handleOrientation(event: any): void {
    const { alpha, beta, gamma } = event;
    if (beta == null || gamma == null) return;

    // ─── Tilt detection ──────────────────────────────────
    if (this._lastOrientation) {
      const deltaBeta = Math.abs(beta - this._lastOrientation.beta);
      const deltaGamma = Math.abs(gamma - this._lastOrientation.gamma);

      if (deltaBeta > this._tiltThreshold || deltaGamma > this._tiltThreshold) {
        // Normalize to -1..1 range (beta: -180..180, gamma: -90..90)
        const tiltX = Math.max(-1, Math.min(1, gamma / 90));
        const tiltY = Math.max(-1, Math.min(1, beta / 180));

        for (const cb of this._callbacks.tilt) {
          cb({ x: tiltX, y: tiltY });
        }
      }
    }

    this._lastOrientation = { beta, gamma };

    // ─── Rotation detection ──────────────────────────────
    if (alpha != null) {
      for (const cb of this._callbacks.rotation) {
        cb(alpha);
      }
    }

    // ─── Flip detection ──────────────────────────────────
    // Device is face-down when beta is close to +/-180
    const isFaceDown = Math.abs(beta) > 140;

    if (this._lastFlipState !== null && isFaceDown !== this._lastFlipState) {
      for (const cb of this._callbacks.flip) {
        cb();
      }
    }

    this._lastFlipState = isFaceDown;
  }
}
