# Gamepad

`@hapticjs/gamepad` provides a haptic adapter for game controllers with rumble support, including spatial haptics and dual-motor control.

## Installation

::: code-group

```bash [npm]
npm install @hapticjs/core @hapticjs/gamepad
```

```bash [pnpm]
pnpm add @hapticjs/core @hapticjs/gamepad
```

:::

## Basic Setup

```typescript
import { HapticEngine } from '@hapticjs/core';
import { GamepadHapticAdapter } from '@hapticjs/gamepad';

const adapter = new GamepadHapticAdapter({ gamepadIndex: 0 });
const engine = HapticEngine.create({ adapter });

// Use the same API
engine.tap();
engine.success();
engine.play('@@..@@..@@'); // Rumble!
```

## Adapter Options

```typescript
interface GamepadAdapterOptions {
  gamepadIndex?: number;           // Which gamepad (default: 0)
  motorMapping?: MotorMappingFn;   // How to split intensity across motors
}
```

## Dual-Motor Control

Game controllers typically have two motors: a heavy (low-frequency) motor and a light (high-frequency) motor. Use motor mappings to control how intensity is distributed:

```typescript
import { GamepadHapticAdapter, defaultMotorMapping, equalMotorMapping, heavyMotorMapping } from '@hapticjs/gamepad';

// Default: balanced between motors
const adapter1 = new GamepadHapticAdapter({
  motorMapping: defaultMotorMapping,
});

// Equal: same intensity on both motors
const adapter2 = new GamepadHapticAdapter({
  motorMapping: equalMotorMapping,
});

// Heavy: more intensity on the heavy motor
const adapter3 = new GamepadHapticAdapter({
  motorMapping: heavyMotorMapping,
});
```

### Custom Motor Mapping

```typescript
import type { DualMotorParams, MotorMappingFn } from '@hapticjs/gamepad';

const customMapping: MotorMappingFn = (intensity: number): DualMotorParams => ({
  strongMagnitude: intensity * 0.8,  // Heavy motor
  weakMagnitude: intensity * 0.3,    // Light motor
});

const adapter = new GamepadHapticAdapter({
  motorMapping: customMapping,
});
```

### DualMotorParams

```typescript
interface DualMotorParams {
  strongMagnitude: number;  // 0.0 - 1.0, heavy/low-frequency motor
  weakMagnitude: number;    // 0.0 - 1.0, light/high-frequency motor
}
```

## Spatial Haptics

`SpatialHaptics` maps spatial positions to motor intensities, useful for directional feedback in games:

```typescript
import { SpatialHaptics } from '@hapticjs/gamepad';

const spatial = new SpatialHaptics();

// Map position to motor intensities
// x: -1 (left) to 1 (right)
spatial.setPosition(-0.8); // Stronger on left motor
spatial.setPosition(0.5);  // Stronger on right motor
spatial.setPosition(0);    // Equal on both
```

## GamepadManager

Utility for detecting and managing connected gamepads:

```typescript
import { GamepadManager } from '@hapticjs/gamepad';

const manager = new GamepadManager();

// Get connected gamepad
const gamepad = manager.getGamepad(0);

// Check if gamepad supports haptics
if (gamepad?.vibrationActuator) {
  console.log('Haptics supported!');
}
```

## Gaming Example

```typescript
import { HapticEngine, presets } from '@hapticjs/core';
import { GamepadHapticAdapter, heavyMotorMapping } from '@hapticjs/gamepad';

const adapter = new GamepadHapticAdapter({
  gamepadIndex: 0,
  motorMapping: heavyMotorMapping,
});
const engine = HapticEngine.create({ adapter });

// Game events
function onExplosion() {
  engine.play(presets.gaming.explosion);
}

function onCollision() {
  engine.play(presets.gaming.collision);
}

function onPowerUp() {
  engine.play(presets.gaming.powerUp);
}

function onEngineRumble() {
  engine.play(presets.gaming.engineRumble);
}
```

::: tip
For the best gaming experience, use the `gaming` theme with `SensoryEngine` to combine rumble with sound effects:

```typescript
import { SensoryEngine } from '@hapticjs/core';
import { GamepadHapticAdapter } from '@hapticjs/gamepad';

const engine = SensoryEngine.create({
  haptic: { adapter: new GamepadHapticAdapter() },
  theme: 'gaming',
});
```
:::

## Related

- [Getting Started](/guide/getting-started) -- Core setup
- [Physics Patterns](/guide/physics) -- Physics-based rumble patterns
- [Presets](/guide/presets) -- Gaming presets
- [React Native](/frameworks/react-native) -- Mobile native haptics
