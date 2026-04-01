// Plugin
export { FeelbackPlugin, HAPTIC_ENGINE_KEY } from './plugin';
export type { FeelbackPluginOptions } from './plugin';

// Composables
export { useHaptic } from './composables/use-haptic';
export type { UseHapticReturn, UseHapticActions } from './composables/use-haptic';
export { useHapticGesture } from './composables/use-haptic-gesture';
export type { HapticGestureConfig } from './composables/use-haptic-gesture';

// Directives
export { vHaptic } from './directives/v-haptic';
