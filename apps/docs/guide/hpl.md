# Haptic Pattern Language (HPL)

HPL is a concise string syntax for describing haptic patterns. Instead of constructing arrays of step objects, you write a short string that encodes vibrations, pauses, and repeats.

## Character Reference

| Character | Effect | Duration | Intensity |
|-----------|--------|----------|-----------|
| `~` | Light vibration | 50ms | 0.3 |
| `#` | Medium vibration | 50ms | 0.6 |
| `@` | Heavy vibration | 50ms | 1.0 |
| `.` | Pause | 50ms | -- |
| `\|` | Sharp tap | 10ms | 1.0 |
| `-` | Sustain (extend previous) | 50ms | -- |

## Basic Patterns

```typescript
import { haptic } from '@hapticjs/core';

haptic.play('|');                // Quick tap
haptic.play('~~');               // Two light vibrations (100ms total)
haptic.play('##');               // Two medium vibrations
haptic.play('@@');               // Two heavy vibrations
haptic.play('~~..##..@@');       // Light -> pause -> medium -> pause -> heavy
```

## Sustain

The `-` character extends the duration of the previous vibration without adding a new step:

```typescript
haptic.play('@@--');             // Heavy vibration sustained for 200ms
haptic.play('~~---');            // Light vibration sustained for 250ms
```

## Groups and Repeats

Wrap a sub-pattern in `[...]` and add `xN` to repeat it:

```typescript
haptic.play('[~.]x3');           // 3 quick pulses: ~.~.~.
haptic.play('[##..]x2[@@]');     // Two medium double-pulses, then one heavy
haptic.play('[|..]x3..@@');      // 3 taps, pause, then heavy boom
```

## Parsing HPL Directly

You can parse HPL strings into AST nodes or compile them to `HapticStep[]`:

```typescript
import { parseHPL, compile } from '@hapticjs/core';

const ast = parseHPL('~~..##');
const steps = compile(ast);
// steps: [
//   { type: 'vibrate', duration: 50, intensity: 0.3 },
//   { type: 'vibrate', duration: 50, intensity: 0.3 },
//   { type: 'pause',   duration: 50, intensity: 0 },
//   { type: 'pause',   duration: 50, intensity: 0 },
//   { type: 'vibrate', duration: 50, intensity: 0.6 },
//   { type: 'vibrate', duration: 50, intensity: 0.6 },
// ]
```

## Tokenizer

For lower-level access, tokenize an HPL string:

```typescript
import { tokenize } from '@hapticjs/core';

const tokens = tokenize('~~..##');
// HPLToken[] with type, value, position info
```

## Validation

Validate an HPL string before playing:

```typescript
import { validateHPL } from '@hapticjs/core';

const result = validateHPL('[~.]x3');
if (result.valid) {
  console.log(`Valid: ${result.stepCount} steps, ${result.totalDuration}ms`);
} else {
  console.error(result.errors);
}
```

::: info
The `ValidationResult` includes `valid`, `errors`, `stepCount`, and `totalDuration` fields.
:::

## Pattern Examples

| Pattern | Description |
|---------|-------------|
| `\|` | Quick single tap |
| `~~..##..@@` | Gentle ramp up |
| `[~.]x5` | 5 quick pulses |
| `@@--` | Heavy sustained |
| `[&#124;..]x3..@@` | 3 taps then a boom |
| `~#@#~` | Crescendo and decrescendo |
| `[@@..]x2[~~]` | Two heavy hits, then light |

## CLI Preview

Preview patterns in the terminal with the CLI:

```bash
npx @hapticjs/cli preview "~~..##..@@"
# Output: ▃▃░░▅▅░░█████

npx @hapticjs/cli validate "[~.]x3"
# Output: Valid pattern -- 6 steps, 300ms total
```

## Related

- [Composer API](/guide/composer) -- Build patterns programmatically instead
- [Presets](/guide/presets) -- 55+ pre-built HPL patterns
- [Pattern Recorder](/guide/pattern-recorder) -- Record taps and export as HPL
