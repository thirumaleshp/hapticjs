# I built a pattern language for haptic feedback on the web

Web haptics are embarrassingly bad. We have `navigator.vibrate()`, a function that takes an array of numbers and produces a buzz that feels like your phone is having a seizure. That's the entire API. No intensity control, no way to describe a pattern, no composability. Every app that wants decent haptic feedback ends up building its own abstraction over the same blunt instrument.

I spent the last year building something better: a tiny pattern language called **HPL** (Haptic Pattern Language) that lets you describe complex haptic patterns as short strings. Think of it as regex for vibration.

This is part of [@hapticjs/core](https://github.com/thirumaleshp/hapticjs), a zero-dependency haptics engine for the web. The library is about 4KB gzipped. Here's what HPL looks like:

```
~~..##..@@
```

That's a pattern that goes: light buzz, pause, medium buzz, pause, heavy buzz. A gentle ramp-up you might use for a loading completion. Let me walk through how it works.

## The syntax

HPL has six characters and two structural operators. That's it.

**Intensity characters** -- each produces a 50ms vibration at a specific intensity level:

| Char | Effect | Intensity |
|------|--------|-----------|
| `~` | Light vibration | 0.3 |
| `#` | Medium vibration | 0.6 |
| `@` | Heavy vibration | 1.0 |

**Control characters:**

| Char | Effect |
|------|--------|
| `.` | 50ms pause (silence) |
| `\|` | 10ms sharp tap at full intensity |
| `-` | Sustain -- extends the previous vibration by 50ms |

**Structure:**

| Syntax | Effect |
|--------|--------|
| `[...]` | Group a sub-pattern |
| `xN` | Repeat the preceding group N times |

That's the whole language. Seven characters and one modifier. You can learn it in a minute and write patterns from memory.

## Patterns that actually feel like something

Here are real patterns I use in production. Try reading them -- after a few, you'll find you can "hear" them just by looking at the string.

**Notification buzz:**
```
##..##
```
Two medium pulses with a short pause. The standard "you got a message" feel.

**Success confirmation:**
```
~..##-
```
A light tick, pause, then a sustained medium buzz. Feels like a satisfying "done."

**Error / rejection:**
```
@@....@@
```
Two heavy hits with a long pause. Unmistakably wrong.

**Heartbeat:**
```
[@@.@@....]x3
```
Two quick heavy beats followed by a longer pause, repeated three times. Use it for health indicators in games or biometric feedback.

**Game impact -- getting hit:**
```
@@---
```
A single heavy vibration sustained for 200ms. That one hurts.

**Morse code SOS:**
```
[|.|.|..]x3[|--|--|..]x3[|.|.|..]x3
```
Three short taps, three sustained taps, three short taps. Probably not useful in production, but it proves the language is expressive enough.

## Under the hood

When you call `haptic.play('~~..##')`, here's what happens:

**1. Tokenizer** -- the string is scanned character by character into tokens:

```
~  ~  .  .  #  #
```
becomes:
```
[LIGHT, LIGHT, PAUSE, PAUSE, MEDIUM, MEDIUM]
```

**2. Parser** -- a recursive descent parser builds an AST. Groups and repeats become tree structures:

```
Sequence
  Vibrate { intensity: 0.3, duration: 50 }
  Vibrate { intensity: 0.3, duration: 50 }
  Pause   { duration: 50 }
  Pause   { duration: 50 }
  Vibrate { intensity: 0.6, duration: 50 }
  Vibrate { intensity: 0.6, duration: 50 }
```

**3. Compiler** -- the AST is compiled to a flat array of `HapticStep` objects. Sustain markers get merged into their preceding vibration. Adjacent pauses and same-intensity vibrations get collapsed by the optimizer.

So `~~` becomes a single 100ms vibration at 0.3 intensity, not two 50ms vibrations. And `@@---` becomes one 200ms vibration at full intensity, not four separate steps.

**4. Adapter** -- the optimized steps are dispatched to whatever haptic API is available on the current platform. The engine auto-detects the best adapter:

- **Web Vibration API** on Android Chrome
- **AudioContext-based fallback** on iOS Safari (since iOS doesn't expose the Vibration API)
- **Gamepad API** for controllers with rumble motors
- A **no-op adapter** when nothing is available, so your code never crashes

The adapter layer also handles device-specific quirks. Android has a minimum vibration duration of about 10ms. iOS AudioContext haptics behave differently from motor vibrations. The engine normalizes all of this so your pattern string works everywhere.

## Beyond vibration

HPL drives vibration, but `@hapticjs/core` also ships a `SensoryEngine` that ties haptics together with sound and visual feedback:

```typescript
import { SensoryEngine } from '@hapticjs/core';

const engine = SensoryEngine.create({
  sound: { enabled: true, volume: 0.3 },
  visual: { enabled: true, target: document.body },
});

engine.tap();     // vibration + click sound + visual pulse
engine.success(); // vibration + chime + green flash
```

When haptics aren't available (desktop browsers, older devices), the sound and visual channels still work. Your users always get feedback -- the engine just picks the best channel for the platform.

There's also a theme system. Set `theme: 'gaming'` and all feedback gets more aggressive. Set `theme: 'minimal'` and everything gets subtler. The pattern strings stay the same; the engine adjusts intensity and timing.

## Cross-platform reality check

One HPL string works across:

- **Android** -- Vibration API, good intensity support
- **iOS** -- AudioContext workaround. Honestly, it's limited. You get vibration-like feedback through audio tricks, but it's not the same as a real haptic motor. Apple doesn't expose their Taptic Engine to the web.
- **Gamepads** -- Dual motor support via the Gamepad API, with separate control for strong and weak motors
- **React Native** -- If you're building a hybrid app, the same pattern strings work with the React Native adapter

I want to be honest about the limitations. iOS web haptics are the biggest gap. Apple's Taptic Engine is incredible hardware, but they've locked it behind native APIs. Our AudioContext fallback is clever but it's not the same thing. Android's Vibration API doesn't support intensity control in most browsers -- you get on/off. We simulate intensity differences through duration and timing tricks, which works surprisingly well but isn't perfect.

The web haptics story will get better. The [Web Vibration API Level 2](https://www.w3.org/TR/vibration/) spec hints at intensity support. Until then, HPL gives you a way to write patterns that degrade gracefully.

## Try it

```bash
npm install @hapticjs/core
```

```typescript
import { haptic } from '@hapticjs/core';

// Semantic API
haptic.tap();
haptic.success();

// HPL patterns
haptic.play('~~..##..@@');
haptic.play('[|..]x3..@@--');
```

That's three lines to get haptic feedback in any web app. The `haptic` export is a pre-configured singleton -- no setup needed.

If you want to go deeper, there's a [playground](https://github.com/thirumaleshp/hapticjs) where you can type HPL strings and feel them on your phone in real time. There's also a pattern composer API for building patterns programmatically, a physics engine for spring/bounce/friction-based effects, and a pattern recorder that captures taps and exports HPL strings.

## What's next

Things I'd love help with:

- **Better iOS support** -- If anyone has ideas for getting richer haptic feedback on iOS Safari without a native bridge, I'm all ears
- **Pattern sharing format** -- HPL strings are great for embedding in code, but we need a standard way to share pattern libraries
- **Accessibility** -- We have an `HapticA11y` module that respects `prefers-reduced-motion`, but there's more work to do around haptic feedback for screen reader users
- **Hardware testing** -- I've tested on ~10 Android devices and a few iPhones. The more device-specific quirks we find and handle, the better the adaptive engine gets

The whole thing is MIT licensed. PRs welcome.

---

**Links:**
- GitHub: [github.com/thirumaleshp/hapticjs](https://github.com/thirumaleshp/hapticjs)
- npm: [@hapticjs/core](https://www.npmjs.com/package/@hapticjs/core)
- Docs: [hapticjs docs](https://thirumaleshp.github.io/hapticjs/docs/)
- HPL reference: [HPL Pattern Language guide](https://thirumaleshp.github.io/hapticjs/docs/guide/hpl)
