# @hapticjs/gamepad

Gamepad haptics adapter for the @hapticjs haptic engine. Supports dual-motor rumble on controllers.

```bash
npm install @hapticjs/gamepad @hapticjs/core
```

## Usage

```typescript
import { HapticEngine } from '@hapticjs/core';
import { GamepadHapticAdapter, GamepadManager } from '@hapticjs/gamepad';

const adapter = new GamepadHapticAdapter({ gamepadIndex: 0 });
const engine = HapticEngine.create({ adapter });

// Play haptic patterns on the controller
engine.play('@@..@@..@@');
engine.impact('heavy');
```

## Motor Mapping

```typescript
import { defaultMotorMapping, heavyMotorMapping, equalMotorMapping } from '@hapticjs/gamepad';

const adapter = new GamepadHapticAdapter({
  gamepadIndex: 0,
  motorMapping: heavyMotorMapping, // Emphasize the heavy motor
});
```

## License

MIT
