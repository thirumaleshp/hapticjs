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

// Adapters
export { NoopAdapter, WebVibrationAdapter } from './adapters';

// Patterns
export { parseHPL, HPLParser, HPLParserError } from './patterns';
export { compile, optimizeSteps } from './patterns';
export { tokenize, HPLTokenizerError } from './patterns';
export { validateHPL } from './patterns';
export type { ValidationResult } from './patterns';

// Composer
export { PatternComposer } from './composer';

// Presets
export { presets, ui, notifications, gaming, accessibility, system } from './presets';

// Utils
export { detectPlatform } from './utils';
export type { PlatformInfo } from './utils';

// ─── Default singleton ──────────────────────────────────────

import { HapticEngine } from './engine';

/**
 * Pre-configured haptic engine singleton.
 * Import and use directly for quick haptic feedback:
 *
 *   import { haptic } from '@feelback/core';
 *   haptic.tap();
 *   haptic.success();
 *   haptic.play('~~..##..@@');
 */
export const haptic = HapticEngine.create();
