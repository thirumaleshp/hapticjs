/** Dual motor parameters for gamepad haptics */
export interface DualMotorParams {
  /** Weak (high-frequency) motor magnitude 0-1 */
  weakMagnitude: number;
  /** Strong (low-frequency) motor magnitude 0-1 */
  strongMagnitude: number;
}

export type MotorMappingFn = (intensity: number) => DualMotorParams;

/**
 * Default motor mapping: light effects use weak motor, heavy use strong, medium uses both.
 */
export const defaultMotorMapping: MotorMappingFn = (intensity: number): DualMotorParams => {
  return {
    weakMagnitude: Math.min(intensity * 1.5, 1.0),
    strongMagnitude: Math.max(intensity - 0.3, 0),
  };
};

/**
 * Equal mapping: both motors at same intensity.
 */
export const equalMotorMapping: MotorMappingFn = (intensity: number): DualMotorParams => {
  return {
    weakMagnitude: intensity,
    strongMagnitude: intensity,
  };
};

/**
 * Heavy mapping: emphasizes the strong (low-frequency) motor.
 */
export const heavyMotorMapping: MotorMappingFn = (intensity: number): DualMotorParams => {
  return {
    weakMagnitude: intensity * 0.3,
    strongMagnitude: intensity,
  };
};
