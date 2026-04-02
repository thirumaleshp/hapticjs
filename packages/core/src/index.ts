// Types
export type {
  HapticStep,
  HapticPattern,
  EasingFunction,
  ImpactStyle,
  NotificationType,
  SemanticEffect,
  AdapterCapabilities,
  HapticAdapter,
  HapticConfig,
  FallbackConfig,
  VisualFallbackStyle,
  HPLToken,
  HPLTokenType,
  HPLNode,
  HPLNodeType,
} from './types';

// Engine
export { HapticEngine } from './engine';
export { AdaptiveEngine, FallbackManager, detectAdapter } from './engine';
export { SensoryEngine } from './engine';
export type { SensoryEngineOptions } from './engine';

// Adapters
export { NoopAdapter, WebVibrationAdapter, IoSAudioAdapter } from './adapters';

// Patterns
export { parseHPL, HPLParser, HPLParserError } from './patterns';
export { compile, optimizeSteps } from './patterns';
export { tokenize, HPLTokenizerError } from './patterns';
export { validateHPL } from './patterns';
export type { ValidationResult } from './patterns';
export {
  exportPattern,
  importPattern,
  patternToJSON,
  patternFromJSON,
  patternToDataURL,
  patternFromDataURL,
} from './patterns';
export type { HapticPatternExport, ExportOptions } from './patterns';

// Composer
export { PatternComposer } from './composer';

// Recorder
export { PatternRecorder } from './recorder';

// Presets
export { presets, ui, notifications, gaming, accessibility, system, emotions } from './presets';

// Physics
export { physics } from './physics';
export {
  spring,
  bounce,
  friction,
  impact,
  gravity,
  elastic,
  wave,
  pendulum,
} from './physics';
export type {
  SpringOptions,
  BounceOptions,
  FrictionOptions,
  ImpactOptions,
  GravityOptions,
  ElasticOptions,
  WaveOptions,
  PendulumOptions,
} from './physics';

// Sound
export { SoundEngine } from './sound';
export type { SoundEngineOptions, ClickOptions, ToneOptions } from './sound';

// Visual
export { VisualEngine } from './visual';
export type {
  VisualEngineOptions,
  FlashOptions,
  ShakeOptions,
  PulseOptions,
  RippleOptions,
  GlowOptions,
  BounceOptions as VisualBounceOptions,
  JelloOptions,
  RubberOptions,
  HighlightOptions,
} from './visual';

// Themes
export { ThemeManager, themes } from './themes';
export type { ThemePreset } from './themes';

// Middleware
export {
  MiddlewareManager,
  intensityScaler,
  durationScaler,
  intensityClamper,
  patternRepeater,
  reverser,
  accessibilityBooster,
} from './middleware';
export type { HapticMiddleware } from './middleware';

// Profiles
export { ProfileManager, profiles } from './profiles';
export type { IntensityProfile } from './profiles';

// Experiment
export { HapticExperiment } from './experiment';

// Rhythm
export { RhythmSync } from './rhythm';
export type { RhythmSyncOptions } from './rhythm';

// Motion
export { MotionDetector } from './motion';
export type { MotionDetectorOptions } from './motion';

// Accessibility
export { HapticA11y } from './accessibility';
export type { HapticA11yOptions } from './accessibility';

// Utils
export { detectPlatform } from './utils';
export type { PlatformInfo } from './utils';

// ─── Default singleton ──────────────────────────────────────

import { HapticEngine } from './engine';

/**
 * Pre-configured haptic engine singleton.
 * Import and use directly for quick haptic feedback:
 *
 *   import { haptic } from '@hapticjs/core';
 *   haptic.tap();
 *   haptic.success();
 *   haptic.play('~~..##..@@');
 */
export const haptic = HapticEngine.create();
