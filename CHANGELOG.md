# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-04-03

### Added
- **Middleware system** — plugin pipeline that transforms patterns before playback (`intensityScaler`, `durationScaler`, `intensityClamper`, `patternRepeater`, `reverser`, `accessibilityBooster`)
- **Intensity profiles** — `ProfileManager` with 6 built-in profiles (off, subtle, normal, strong, intense, accessible)
- **A/B testing** — `HapticExperiment` with hash-based variant assignment and event tracking
- **Rhythm sync** — `RhythmSync` with BPM control, tap tempo, beat callbacks, and `syncHaptic()`
- **Motion detection** — `MotionDetector` for shake, tilt, rotation, and flip detection
- **Accessibility API** — `HapticA11y` auto-attaches haptics to focus changes, form errors, button clicks, navigation
- **Spatial haptics** — directional feedback for gamepads (left, right, sweep, pulse, rumble, impact, engine)
- **@hapticjs/angular** — Angular service wrapper (`HapticService`)
- **@hapticjs/web-components** — Custom elements (`<haptic-button>`, `<haptic-surface>`, `<haptic-toggle>`)
- CDN/UMD build — `<script>` tag usage via unpkg/jsdelivr with `HapticJS` global
- Playground upgrade — 14 tabbed sections covering all features
- VitePress documentation site — 28 pages with guides, framework docs, API reference
- Example apps — whack-a-mole game, haptic form validation, music visualizer
- Pattern gallery — 63 built-in patterns with waveform visualization, creator, and sharing

## [0.3.0] - 2026-04-02

### Added
- **Multi-sensory engine** — `SensoryEngine` combining haptic + sound + visual feedback
- **Sound engine** — Web Audio API procedural sounds (click, tick, pop, whoosh, chime, error, success, tap, toggle, playTone)
- **Visual engine** — CSS-based effects (flash, shake, pulse, ripple, glow, bounce, jello, rubber, highlight)
- **Physics patterns** — 8 procedural generators (spring, bounce, friction, impact, gravity, elastic, wave, pendulum)
- **Emotion presets** — 12 emotion-mapped haptic patterns (excited, calm, tense, happy, sad, angry, surprised, anxious, confident, playful, romantic, peaceful)
- **Theme system** — `ThemeManager` with 8 built-in themes (default, gaming, minimal, luxury, retro, nature, silent, accessible)
- **Pattern recorder** — Record taps and convert to HPL strings or HapticStep arrays
- **Pattern sharing** — Export/import patterns as JSON and data URLs

## [0.2.1] - 2026-04-01

### Fixed
- **Android compatibility** — increased minimum vibration durations to 25-30ms for all effects
- **WebVibrationAdapter rewrite** — removed broken PWM intensity simulation, uses native `navigator.vibrate(pattern)` directly
- All presets updated with Android-safe minimum durations
- 20+ effects that were silently failing on Android now work correctly

## [0.2.0] - 2026-04-01

### Added
- **@hapticjs/react-native** — React Native adapter with auto-detection of `react-native-haptic-feedback`, `expo-haptics`, and RN Vibration API
- **Pattern sharing** — `patternToJSON()`, `patternFromJSON()`, `patternToDataURL()`, `patternFromDataURL()`
- iOS AudioContext adapter — sub-bass oscillator fallback for iOS Safari

## [0.1.1] - 2026-03-31

### Added
- **@hapticjs/vue** — Vue composables (`useHaptic`) and `v-haptic` directive
- **@hapticjs/svelte** — Svelte actions (`haptic`, `hapticHover`) and stores
- **@hapticjs/gamepad** — `GamepadHapticAdapter` with dual-motor rumble control
- **@hapticjs/cli** — Development CLI for testing and previewing patterns

## [0.1.0] - 2026-03-30

### Added
- **@hapticjs/core** — Core haptic engine with semantic API (`tap`, `doubleTap`, `longPress`, `success`, `warning`, `error`, `selection`, `toggle`, `impact`)
- **Haptic Pattern Language (HPL)** — Custom DSL for describing haptic patterns (`~`=light, `#`=medium, `@`=heavy, `.`=pause, `|`=tap, `-`=sustain)
- **Pattern Composer** — Fluent builder API for creating patterns programmatically
- **43 built-in presets** — UI, notifications, gaming, accessibility, system categories
- **@hapticjs/react** — React hooks (`useHaptic`), provider, and `HapticButton` component
- Web Vibration API adapter with Noop fallback
- Full TypeScript support with tree-shakeable ESM + CJS builds
