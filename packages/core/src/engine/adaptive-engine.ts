import type { HapticStep, AdapterCapabilities } from '../types';
import { clamp } from '../utils/scheduling';

/**
 * Adapts ideal haptic patterns to what the device can actually produce.
 * Handles intensity quantization, duration clamping, and step merging.
 */
export class AdaptiveEngine {
  adapt(steps: HapticStep[], capabilities: AdapterCapabilities): HapticStep[] {
    return steps.map((step) => this._adaptStep(step, capabilities));
  }

  private _adaptStep(step: HapticStep, caps: AdapterCapabilities): HapticStep {
    const adapted = { ...step };

    // Clamp duration
    if (adapted.type === 'vibrate') {
      adapted.duration = clamp(adapted.duration, caps.minDuration, caps.maxDuration);
    }

    // Quantize intensity if device has limited levels
    if (!caps.supportsIntensity && adapted.type === 'vibrate') {
      // On/off only — threshold at 0.1
      adapted.intensity = adapted.intensity > 0.1 ? 1.0 : 0;
    } else if (caps.maxIntensityLevels > 1 && caps.maxIntensityLevels < 100) {
      // Quantize to available levels
      const levels = caps.maxIntensityLevels;
      adapted.intensity = Math.round(adapted.intensity * levels) / levels;
    }

    return adapted;
  }
}
