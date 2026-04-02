# TypeScript Types

All types exported from `@hapticjs/core`.

## Core Types

### HapticStep

A single step in a haptic sequence.

```typescript
interface HapticStep {
  type: 'vibrate' | 'pause';
  /** Duration in milliseconds */
  duration: number;
  /** Intensity from 0.0 to 1.0 (0 = off, 1 = max) */
  intensity: number;
  /** Optional easing for intensity ramps */
  easing?: EasingFunction;
}
```

### HapticPattern

A named sequence of haptic steps.

```typescript
interface HapticPattern {
  name?: string;
  steps: HapticStep[];
  metadata?: Record<string, unknown>;
}
```

### EasingFunction

```typescript
type EasingFunction = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
```

### ImpactStyle

Matches iOS `UIImpactFeedbackGenerator` styles.

```typescript
type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
```

### NotificationType

```typescript
type NotificationType = 'success' | 'warning' | 'error';
```

### SemanticEffect

All built-in semantic effect names.

```typescript
type SemanticEffect =
  | 'tap'
  | 'doubleTap'
  | 'longPress'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'
  | 'toggle'
  | ImpactStyle;
```

---

## Configuration Types

### HapticConfig

```typescript
interface HapticConfig {
  /** Explicitly set an adapter (overrides auto-detection) */
  adapter?: HapticAdapter;
  /** Global intensity multiplier (0.0 to 1.0) */
  intensity: number;
  /** Whether haptics are enabled */
  enabled: boolean;
  /** Fallback when haptics are unavailable */
  fallback: FallbackConfig;
  /** Respect system haptic settings */
  respectSystemSettings: boolean;
}
```

### FallbackConfig

```typescript
interface FallbackConfig {
  type: 'none' | 'visual' | 'audio' | 'both';
  visual?: {
    element?: HTMLElement;
    className?: string;
    style?: VisualFallbackStyle;
  };
  audio?: {
    enabled: boolean;
    volume: number;
  };
}
```

### VisualFallbackStyle

```typescript
type VisualFallbackStyle = 'flash' | 'shake' | 'pulse';
```

---

## Adapter Types

### HapticAdapter

Interface all haptic adapters must implement.

```typescript
interface HapticAdapter {
  readonly name: string;
  readonly supported: boolean;

  capabilities(): AdapterCapabilities;
  pulse(intensity: number, duration: number): Promise<void>;
  playSequence(steps: HapticStep[]): Promise<void>;
  cancel(): void;
  dispose(): void;
}
```

### AdapterCapabilities

```typescript
interface AdapterCapabilities {
  /** Number of discrete intensity levels (1 = on/off only) */
  maxIntensityLevels: number;
  /** Minimum pulse duration in ms */
  minDuration: number;
  /** Maximum continuous duration in ms */
  maxDuration: number;
  /** Whether the adapter can play multi-step patterns natively */
  supportsPattern: boolean;
  /** Whether the adapter can vary intensity */
  supportsIntensity: boolean;
  /** Whether the adapter has dual motors (gamepad-style) */
  dualMotor: boolean;
}
```

---

## HPL Types

### HPLToken

```typescript
interface HPLToken {
  type: HPLTokenType;
  value: string;
  position: number;
}
```

### HPLTokenType

```typescript
type HPLTokenType =
  | 'vibrate'
  | 'pause'
  | 'tap'
  | 'sustain'
  | 'group_start'
  | 'group_end'
  | 'repeat';
```

### HPLNode

```typescript
type HPLNode =
  | HPLVibrateNode
  | HPLPauseNode
  | HPLTapNode
  | HPLSustainNode
  | HPLGroupNode
  | HPLSequenceNode;
```

### HPLNodeType

```typescript
type HPLNodeType =
  | 'vibrate'
  | 'pause'
  | 'tap'
  | 'sustain'
  | 'group'
  | 'sequence';
```

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  stepCount: number;
  totalDuration: number;
}
```

---

## Pattern Sharing Types

### HapticPatternExport

```typescript
interface HapticPatternExport {
  version: 1;
  name: string;
  description?: string;
  hpl?: string;
  steps: HapticStep[];
  metadata?: {
    duration: number;
    author?: string;
    tags?: string[];
    createdAt?: string;
  };
}
```

### ExportOptions

```typescript
interface ExportOptions {
  name?: string;
  description?: string;
  author?: string;
  tags?: string[];
}
```

---

## Middleware Types

### HapticMiddleware

```typescript
type HapticMiddleware = {
  name: string;
  process: (steps: HapticStep[]) => HapticStep[];
};
```

---

## Profile Types

### IntensityProfile

```typescript
type IntensityProfile = {
  name: string;
  hapticScale: number;       // 0-2
  durationScale: number;     // 0-2
  soundEnabled: boolean;
  soundVolume: number;       // 0-1
  visualEnabled: boolean;
};
```

---

## Theme Types

### ThemePreset

```typescript
interface ThemePreset {
  name: string;
  hapticIntensity: number;
  soundEnabled: boolean;
  soundVolume: number;
  visualEnabled: boolean;
  visualStyle: 'flash' | 'ripple' | 'shake' | 'glow' | 'pulse';
  colors: {
    primary: string;
    success: string;
    error: string;
    warning: string;
  };
}
```

---

## Engine Types

### SensoryEngineOptions

```typescript
interface SensoryEngineOptions {
  haptic?: Partial<HapticConfig>;
  sound?: { enabled?: boolean; volume?: number; muted?: boolean };
  visual?: { enabled?: boolean; target?: HTMLElement; intensity?: number };
  theme?: string | ThemePreset;
}
```

### RhythmSyncOptions

```typescript
interface RhythmSyncOptions {
  bpm?: number;         // 60-300
  intensity?: number;   // 0-1
  pattern?: string;     // HPL pattern
}
```

### MotionDetectorOptions

```typescript
interface MotionDetectorOptions {
  shakeThreshold?: number;   // default: 15
  tiltThreshold?: number;    // default: 10
}
```

### HapticA11yOptions

```typescript
interface HapticA11yOptions {
  focusChange?: boolean;
  formErrors?: boolean;
  navigation?: boolean;
  announcements?: boolean;
}
```

---

## Physics Option Types

### SpringOptions

```typescript
interface SpringOptions {
  stiffness?: number;   // 0.5-1.0
  damping?: number;     // 0.1-0.9
  duration?: number;    // ms
}
```

### BounceOptions

```typescript
interface BounceOptions {
  height?: number;      // 0.5-1.0
  bounciness?: number;  // 0.3-0.9
  bounces?: number;
}
```

### FrictionOptions

```typescript
interface FrictionOptions {
  roughness?: number;   // 0.1-1.0
  speed?: number;       // 0.1-1.0
  duration?: number;    // ms
}
```

### ImpactOptions

```typescript
interface ImpactOptions {
  mass?: number;        // 0.1-1.0
  hardness?: number;    // 0.1-1.0
}
```

### GravityOptions

```typescript
interface GravityOptions {
  distance?: number;    // 0.3-1.0
  duration?: number;    // ms
}
```

### ElasticOptions

```typescript
interface ElasticOptions {
  stretch?: number;     // 0.3-1.0
  snapSpeed?: number;   // 0.3-1.0
}
```

### WaveOptions

```typescript
interface WaveOptions {
  amplitude?: number;   // 0.3-1.0
  frequency?: number;   // 0.5-2.0
  cycles?: number;
}
```

### PendulumOptions

```typescript
interface PendulumOptions {
  energy?: number;      // 0.3-1.0
  swings?: number;
}
```

---

## Sound Types

### SoundEngineOptions

```typescript
interface SoundEngineOptions {
  enabled?: boolean;
  volume?: number;
  muted?: boolean;
}
```

### ClickOptions

```typescript
interface ClickOptions {
  pitch?: 'low' | 'mid' | 'high';
}
```

### ToneOptions

```typescript
interface ToneOptions {
  frequency: number;
  duration: number;
}
```

---

## Visual Types

### VisualEngineOptions

```typescript
interface VisualEngineOptions {
  enabled?: boolean;
  target?: HTMLElement;
  intensity?: number;
}
```

### FlashOptions, ShakeOptions, PulseOptions, RippleOptions, GlowOptions, BounceOptions, JelloOptions, RubberOptions, HighlightOptions

Each visual effect method accepts an options object controlling its appearance. See the [Multi-Sensory guide](/guide/multi-sensory) for usage examples.

---

## Utility Types

### PlatformInfo

```typescript
interface PlatformInfo {
  // Platform detection results
}
```

```typescript
import { detectPlatform } from '@hapticjs/core';

const platform = detectPlatform();
```

---

## Gamepad Types (from `@hapticjs/gamepad`)

### GamepadAdapterOptions

```typescript
interface GamepadAdapterOptions {
  gamepadIndex?: number;
  motorMapping?: MotorMappingFn;
}
```

### DualMotorParams

```typescript
interface DualMotorParams {
  strongMagnitude: number;  // 0.0 - 1.0
  weakMagnitude: number;    // 0.0 - 1.0
}
```

### MotorMappingFn

```typescript
type MotorMappingFn = (intensity: number) => DualMotorParams;
```
