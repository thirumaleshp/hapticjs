// Adapter
export { GamepadHapticAdapter } from './adapters/gamepad-haptic.adapter';
export type { GamepadAdapterOptions } from './adapters/gamepad-haptic.adapter';

// Spatial
export { SpatialHaptics } from './spatial/spatial-haptics';

// Utilities
export { GamepadManager } from './utils/gamepad-manager';
export {
  defaultMotorMapping,
  equalMotorMapping,
  heavyMotorMapping,
} from './utils/dual-motor';
export type { DualMotorParams, MotorMappingFn } from './utils/dual-motor';
