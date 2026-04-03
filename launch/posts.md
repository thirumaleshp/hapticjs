# haptic.js Launch Posts

---

## 1. Hacker News -- Show HN Post

**Title:** Show HN: Haptic.js -- A pattern language for haptic feedback on the web

**Body:**

Hi HN, I built haptic.js, an open-source haptics engine for JavaScript/TypeScript. The core idea is a small DSL called HPL (Haptic Pattern Language) that lets you describe vibration patterns as strings instead of manually wiring up duration arrays.

The web already has `navigator.vibrate()`, but using it directly is painful. You end up with `navigator.vibrate([30, 50, 100, 30, 200])` and no way to read, share, or reason about what that pattern actually feels like. HPL replaces that with a character-per-step notation:

```
~  = light vibration (0.3 intensity)
#  = medium vibration (0.6)
@  = heavy vibration (1.0)
.  = pause
|  = sharp tap
-  = sustain previous
[~.]x3 = repeat group 3 times
```

So instead of opaque number arrays, you write `~~..##..@@` for a gentle-to-heavy ramp, or `[|..]x3..@@` for three taps followed by a boom. The strings are compact enough to pass around in config files, store in a database, or tweet.

Under the hood, the HPL string goes through a tokenizer -> parser -> compiler pipeline that outputs a normalized step array. The engine then dispatches those steps to the appropriate platform adapter -- Web Vibration API on Android Chrome, an audio-based workaround on iOS Safari (which doesn't support the Vibration API), gamepad rumble via the Gamepad API, or native haptics through React Native bridges.

```typescript
import { haptic } from '@hapticjs/core';

haptic.play('~~..##..@@');     // ramp pattern
haptic.play('[~.]x5');         // 5 quick pulses
haptic.tap();                  // preset: single tap
haptic.success();              // preset: success notification
```

The library ships with 63+ presets organized by category (UI interactions, notifications, gaming, accessibility, emotions), a physics engine for spring/bounce/friction-based patterns, middleware for transforming patterns (intensity scaling, duration scaling, accessibility boosting), and a pattern recorder for creating patterns from timed user input.

Framework integrations exist for React (`useHaptic` hook), Vue (composable + directive), Svelte (action), Angular (service + directive), Web Components, React Native, and Gamepad. The core is ~3KB gzipped, zero dependencies, tree-shakeable, and ships ESM + CJS + IIFE builds.

Honest limitations: iOS Safari does not support the Vibration API at all, so the iOS fallback uses AudioContext to produce a short click sound -- it works but it's not real haptics. Android's minimum vibration duration is device-dependent (often ~10ms), so very short steps get clamped. Desktop browsers generally have no vibration support outside of gamepad rumble. This is fundamentally a mobile-first capability.

Playground (try it on your phone): https://thirumaleshp.github.io/hapticjs/
Docs: https://thirumaleshp.github.io/hapticjs/docs/
GitHub: https://github.com/thirumaleshp/hapticjs
npm: `npm install @hapticjs/core`

Would love feedback on the pattern language design, the adapter architecture, or anything else. MIT licensed.

---

## 2. Reddit r/webdev Post

**Title:** I built an open-source haptics engine with its own pattern language -- works across Web, React, Vue, Svelte, Angular, React Native, and Gamepads

**Body:**

I've been working on haptic.js, a library that makes adding haptic feedback to web apps actually manageable.

**The problem:** The Vibration API exists but it's awkward. You call `navigator.vibrate([30, 50, 100, 30, 200])` and those numbers are completely opaque. What does that pattern feel like? Who knows. Change a 30 to a 50 and you have to test on a real device to see if it matters. There's no way to reason about patterns at a glance.

**The solution:** I made a tiny pattern language called HPL (Haptic Pattern Language). You write patterns as strings:

```
haptic.play('~~..##..@@');   // gentle -> medium -> heavy ramp
haptic.play('[|..]x3..@@');  // three taps, then a boom
haptic.play('[~.]x5');       // five quick pulses
```

Each character maps to a step: `~` is light, `#` is medium, `@` is heavy, `.` is a pause, `|` is a sharp tap, `-` sustains the previous step. Wrap in brackets with `xN` to repeat. That's the whole syntax.

**What's included:**

- 63+ built-in presets: UI interactions (tap, toggle, swipe, pull-to-refresh), notifications (success, error, warning), gaming (explosion, damage, heartbeat), accessibility, and even emotional patterns
- Physics engine: spring, bounce, friction, gravity, elastic, wave, pendulum -- generates patterns from physical simulations
- Middleware system: scale intensity, clamp values, boost for accessibility, reverse patterns
- Pattern recorder: create patterns by tapping along in real time
- Multi-sensory fallbacks: sound engine and visual engine (screen flash, shake, pulse) for devices without vibration support

**Framework support:** React hook, Vue composable + directive, Svelte action, Angular service, Web Components, React Native, Gamepad. Install the adapter for your framework and you're set.

**Try it right now:** Open the playground on your phone -- https://thirumaleshp.github.io/hapticjs/

```bash
npm install @hapticjs/core
```

~3KB gzipped, zero dependencies, TypeScript-first, tree-shakeable. MIT licensed.

GitHub: https://github.com/thirumaleshp/hapticjs
Docs: https://thirumaleshp.github.io/hapticjs/docs/
Pattern Gallery: https://thirumaleshp.github.io/hapticjs/gallery/

Fair warning: this only works with real haptics on Android. iOS doesn't support the Vibration API, so there's an audio-based fallback, but it's not the same thing. Desktop support is limited to gamepad rumble.

Happy to answer questions or hear suggestions on the pattern language.

---

## 3. Reddit r/javascript Post

**Title:** hapticjs -- a tiny DSL for haptic patterns + universal vibration engine (TypeScript, tree-shakeable, 9 framework adapters)

**Body:**

I've been building haptic.js, an open-source haptics library. The interesting technical bit is HPL (Haptic Pattern Language), a small DSL for describing vibration patterns as strings.

**HPL as a DSL**

HPL is intentionally minimal. Six pattern characters (`~` light, `#` medium, `@` heavy, `.` pause, `|` tap, `-` sustain) plus a repeat group syntax (`[~.]x3`). The entire grammar fits in a page.

The compilation pipeline is: string -> tokenizer -> AST -> compiler -> normalized step array. Each step is `{ type: 'vibrate' | 'pause', duration: number, intensity: number }`. The tokenizer, parser, and compiler are all independently exported if you want to use them directly.

```typescript
import { tokenize, parseHPL, compile } from '@hapticjs/core';

const tokens = tokenize('~~..##..@@');
const ast = parseHPL('~~..##..@@');
const steps = compile(ast);
// steps = [{ type: 'vibrate', duration: 30, intensity: 0.3 }, ...]
```

There's also a validator (`validateHPL`) that returns structured errors with position info, and pattern import/export utilities (JSON, data URLs) for sharing patterns.

**Adapter architecture**

The engine uses a pluggable adapter pattern. The core ships with `WebVibrationAdapter`, `IoSAudioAdapter`, and `NoopAdapter`. Framework packages add their own adapters. `detectAdapter()` auto-selects the right one for the current environment.

The `AdaptiveEngine` wraps the base `HapticEngine` with automatic fallback management -- if vibration fails, it falls through to audio or visual feedback via `SoundEngine` and `VisualEngine`.

**What else is in the box**

- `PatternComposer` -- programmatic pattern building
- `PatternRecorder` -- record patterns from real-time input
- Physics-based generation (`spring()`, `bounce()`, `friction()`, `gravity()`, `elastic()`, `wave()`, `pendulum()`)
- Middleware pipeline (`intensityScaler`, `durationScaler`, `intensityClamper`, `reverser`, `accessibilityBooster`)
- `ProfileManager` with intensity profiles
- `HapticExperiment` for A/B testing different patterns
- `RhythmSync` for syncing patterns to BPM
- `MotionDetector` for triggering haptics from device motion
- `ThemeManager` with theme presets
- `HapticA11y` for accessibility announcements alongside haptics

**Build output**

- ESM, CJS, and IIFE (global `HapticJS`)
- TypeScript declarations
- Tree-shakeable -- import only what you use
- ~3KB gzipped for the core
- Zero dependencies

**Framework adapters:** React (`useHaptic`), Vue (composable + `v-haptic` directive), Svelte (action), Angular (service + directive), Web Components (custom elements), React Native, Gamepad.

GitHub: https://github.com/thirumaleshp/hapticjs
Docs: https://thirumaleshp.github.io/hapticjs/docs/
npm: `@hapticjs/core`

MIT licensed. Feedback welcome, especially on the DSL design and the adapter API surface.

---

## 4. Twitter/X Thread

**Tweet 1:**
I built haptic.js -- an open-source engine that adds haptic feedback to any JS app.

The core idea: a tiny pattern language where you describe vibrations as strings instead of number arrays.

`haptic.play('~~..##..@@')`

Thread on how it works:

**Tweet 2:**
The pattern language is called HPL.

~ = light vibration
\# = medium
@ = heavy
. = pause
| = sharp tap
- = sustain

Wrap in brackets to repeat: [~.]x5

That's it. Six characters and you can describe any pattern. Readable, shareable, fits in a config file.

**Tweet 3:**
Three lines to get started:

```
npm i @hapticjs/core
```

```js
import { haptic } from '@hapticjs/core';
haptic.play('[|..]x3..@@');
```

63+ built-in presets too: tap, success, error, heartbeat, explosion, and more. ~3KB gzipped, zero deps.

**Tweet 4:**
Framework support:

- React: useHaptic hook
- Vue: composable + directive
- Svelte: action
- Angular: service + directive
- Web Components
- React Native
- Gamepad rumble

One pattern language, every platform.

**Tweet 5:**
Try it right now -- open the playground on your phone and feel the patterns:

https://thirumaleshp.github.io/hapticjs/

Browse all 63+ presets in the gallery:

https://thirumaleshp.github.io/hapticjs/gallery/

**Tweet 6:**
It's open source, MIT licensed, TypeScript-first, tree-shakeable.

GitHub: https://github.com/thirumaleshp/hapticjs
npm: @hapticjs/core
Docs: https://thirumaleshp.github.io/hapticjs/docs/

Feedback welcome. Especially on the pattern language design.

---

## 5. Dev.to / Hashnode Article Outline

**Title:** "Designing a Pattern Language for Haptic Feedback on the Web"

### Section 1: The Problem with navigator.vibrate()
- The Vibration API exists but is hard to use well
- Duration arrays are opaque and unreadable: `vibrate([30, 50, 100, 30, 200])`
- No standard way to describe, share, or compose patterns
- iOS doesn't support it at all
- No one uses haptics on the web because the DX is terrible

### Section 2: What if Haptic Patterns Were Readable?
- Introduce HPL (Haptic Pattern Language)
- Design goals: human-readable, compact, composable
- The six characters and their meanings
- Repeat groups with bracket syntax
- Side-by-side comparison: number arrays vs HPL strings
- Show 4-5 example patterns with descriptions

### Section 3: How the Compiler Works
- Tokenizer: string to token array
- Parser: tokens to AST (handling nested groups, repeat modifiers)
- Compiler: AST to normalized step array
- Optimizer: merging adjacent same-intensity steps
- Validator: structured error reporting with position info
- Code examples of each stage

### Section 4: The Adapter Architecture
- Why a pluggable adapter pattern
- WebVibrationAdapter: mapping intensity to the binary vibrate() API
- IoSAudioAdapter: using AudioContext as a fallback
- NoopAdapter: for SSR and unsupported environments
- Auto-detection logic
- How framework adapters extend this (React Native bridge, Gamepad API)

### Section 5: Beyond Basic Vibration
- Physics-based pattern generation (spring, bounce, gravity, elastic)
- The middleware pipeline (transform patterns before playback)
- Pattern recording from user input
- Multi-sensory feedback: sound engine, visual engine
- Rhythm sync, motion detection, A/B testing

### Section 6: Framework Integrations
- React: useHaptic hook usage
- Vue: composable and v-haptic directive
- Svelte: action pattern
- Angular: injectable service
- Web Components: custom elements
- React Native and Gamepad adapters
- Code examples for each

### Section 7: Honest Limitations
- iOS: no Vibration API, audio fallback is imperfect
- Android minimum vibration durations vary by device
- Desktop: no vibration outside gamepads
- Intensity is binary in the Vibration API (vibrate or don't) -- intensity mapping is approximated via duration modulation
- Battery considerations for long patterns

### Section 8: Try It Yourself
- Link to playground
- Link to pattern gallery
- npm install instructions
- Link to GitHub and docs
- Invitation for feedback on the pattern language design
