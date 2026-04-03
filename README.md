<div align="center">

<img src="assets/logo.svg" alt="haptic.js" width="360" />

<br/>

**The universal haptics engine for JavaScript & TypeScript**

[![npm version](https://img.shields.io/npm/v/@hapticjs/core?style=flat-square&color=6366f1)](https://www.npmjs.com/package/@hapticjs/core)
[![CI](https://img.shields.io/github/actions/workflow/status/thirumaleshp/hapticjs/ci.yml?style=flat-square&label=CI)](https://github.com/thirumaleshp/hapticjs/actions)
[![license](https://img.shields.io/npm/l/@hapticjs/core?style=flat-square)](https://github.com/thirumaleshp/hapticjs/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@hapticjs/core?style=flat-square&label=size)](https://bundlephobia.com/package/@hapticjs/core)
[![downloads](https://img.shields.io/npm/dm/@hapticjs/core?style=flat-square)](https://www.npmjs.com/package/@hapticjs/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[**Playground**](https://thirumaleshp.github.io/hapticjs/) &bull; [**Documentation**](https://thirumaleshp.github.io/hapticjs/docs/) &bull; [**Gallery**](https://thirumaleshp.github.io/hapticjs/gallery/) &bull; [**Examples**](https://thirumaleshp.github.io/hapticjs/examples/)

</div>

---

Add haptic feedback to any JavaScript app in 3 lines. One tiny library, every platform, every framework.

```bash
npm install @hapticjs/core
```

```typescript
import { haptic } from '@hapticjs/core';

haptic.tap();
haptic.success();
haptic.play('~~..##..@@');
```

### CDN

```html
<script src="https://unpkg.com/@hapticjs/core"></script>
<script>
  const haptic = new HapticJS.HapticEngine();
  haptic.tap();
</script>
```

---

## Why hapticjs?

- **One API, every platform** -- Web Vibration, Gamepad rumble, React Native, iOS audio fallback
- **Haptic Pattern Language** -- Describe vibrations as strings like `~~..##..@@` instead of arrays of numbers
- **63+ built-in presets** -- UI, notifications, gaming, accessibility, emotions, and more
- **< 3KB gzipped** -- Zero dependencies, tree-shakeable, dual ESM/CJS
- **TypeScript-first** -- Full type safety with framework integrations for React, Vue, Svelte, Angular, and more

---

## Haptic Pattern Language (HPL)

This is what makes hapticjs different. Instead of juggling duration arrays, you write patterns as readable strings:

| Char | Meaning | Intensity |
|------|---------|-----------|
| `~` | Light vibration | 0.3 |
| `#` | Medium vibration | 0.6 |
| `@` | Heavy vibration | 1.0 |
| `.` | Pause | -- |
| `\|` | Sharp tap | 1.0 |
| `-` | Sustain previous | -- |

Wrap in brackets to repeat: `[~.]x3` plays three quick pulses. Chain groups freely: `[##..]x2[@@]`.

```typescript
haptic.play('|');              // Quick tap
haptic.play('~~..##..@@');     // Ramp up: gentle -> medium -> heavy
haptic.play('[~.]x5');         // 5 quick pulses
haptic.play('@@--');           // Heavy sustained vibration
haptic.play('[|..]x3..@@');    // 3 taps then a boom
```

---

## Framework Support

| Framework | Package | Install |
|-----------|---------|---------|
| React | `@hapticjs/react` | `npm i @hapticjs/react` |
| Vue | `@hapticjs/vue` | `npm i @hapticjs/vue` |
| Svelte | `@hapticjs/svelte` | `npm i @hapticjs/svelte` |
| Angular | `@hapticjs/angular` | `npm i @hapticjs/angular` |
| Web Components | `@hapticjs/web-components` | `npm i @hapticjs/web-components` |
| React Native | `@hapticjs/react-native` | `npm i @hapticjs/react-native` |
| Gamepad | `@hapticjs/gamepad` | `npm i @hapticjs/gamepad` |

---

## Quick Links

- [Documentation](https://thirumaleshp.github.io/hapticjs/docs/) -- Full API reference, guides, and advanced features
- [Playground](https://thirumaleshp.github.io/hapticjs/) -- Try patterns live in your browser
- [Pattern Gallery](https://thirumaleshp.github.io/hapticjs/gallery/) -- Browse and preview 63+ presets
- [Examples](https://thirumaleshp.github.io/hapticjs/examples/) -- Real-world integration examples
- [Changelog](https://github.com/thirumaleshp/hapticjs/blob/main/CHANGELOG.md)
- [Contributing](https://github.com/thirumaleshp/hapticjs/blob/main/CONTRIBUTING.md)

---

MIT License
