# Getting Started

@hapticjs is a universal haptics engine for JavaScript and TypeScript. It provides semantic haptic effects, a pattern language (HPL), 55+ presets, and framework integrations -- all in under 3KB gzipped with zero dependencies.

## Installation

::: code-group

```bash [npm]
npm install @hapticjs/core
```

```bash [pnpm]
pnpm add @hapticjs/core
```

```bash [yarn]
yarn add @hapticjs/core
```

:::

## Your First Haptic

The fastest way to get started is with the pre-configured `haptic` singleton:

```typescript
import { haptic } from '@hapticjs/core';

// Semantic effects
haptic.tap();
haptic.success();
haptic.error();

// Play an HPL pattern
haptic.play('~~..##..@@');
```

The `haptic` singleton auto-detects the best adapter for the current platform -- Web Vibration API on Android, audio haptics on iOS, visual fallback on desktop, and no-op on the server.

## Creating a Custom Engine

For more control, create your own `HapticEngine` instance:

```typescript
import { HapticEngine } from '@hapticjs/core';

const engine = HapticEngine.create({
  enabled: true,
  intensity: 0.8,
  fallback: {
    type: 'visual',
    visual: {
      style: 'flash',
    },
  },
});

engine.tap();
engine.play('~~..##..@@');
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether haptics are enabled |
| `intensity` | `number` | `1.0` | Global intensity multiplier (0.0 - 1.0) |
| `adapter` | `HapticAdapter` | auto-detected | Override the adapter |
| `fallback` | `FallbackConfig` | `{ type: 'none' }` | Fallback when haptics unavailable |
| `respectSystemSettings` | `boolean` | `true` | Respect OS haptic preferences |

## Platform Support

| Platform | API | Status |
|----------|-----|--------|
| Android Chrome | Vibration API | Full support |
| Android Firefox | Vibration API | Full support |
| iOS Safari | iOS Audio Adapter | Audio haptic fallback |
| Desktop Chrome | -- | Visual/audio fallback |
| Gamepad | GamepadHapticActuator | Dual-motor rumble |
| React Native | Native adapter | Native haptics |
| Node.js / SSR | NoopAdapter | Safe no-op |

## What's Next?

- [Semantic Effects](/guide/semantic-effects) -- Built-in `tap()`, `success()`, `error()`, and more
- [HPL Pattern Language](/guide/hpl) -- Describe patterns as strings
- [Presets](/guide/presets) -- 55+ ready-to-use patterns
- [React Integration](/frameworks/react) -- Hooks, provider, and components
