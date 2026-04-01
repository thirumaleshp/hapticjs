// Hooks
export { useHaptic } from './hooks/use-haptic';
export type { UseHapticReturn, UseHapticActions } from './hooks/use-haptic';
export { useHapticGesture } from './hooks/use-haptic-gesture';
export type { HapticGestureConfig } from './hooks/use-haptic-gesture';

// Context
export { HapticProvider, useHapticEngine } from './context/haptic-provider';
export type { HapticProviderProps, HapticContextValue } from './context/haptic-provider';

// Components
export { HapticButton } from './components/haptic-button';
export type { HapticButtonProps } from './components/haptic-button';
