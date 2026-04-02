# Contributing to @hapticjs

Thanks for your interest in contributing to **@hapticjs**! Whether you're fixing a bug, adding a preset, building a new adapter, or improving docs, your help is welcome.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/thirumaleshp/hapticjs.git
cd hapticjs

# Install dependencies (pnpm required)
pnpm install

# Build all packages
pnpm build

# Run the full test suite
pnpm test

# Type check everything
pnpm typecheck
```

---

## Project Structure

This is a **pnpm monorepo**. All packages live under `packages/` and share a common build/test setup.

```
packages/
  core/             Main engine — HPL parser, presets, composer, physics,
                    sound engine, visual engine, themes, recorder, sharing
  react/            React hooks, provider, components
  vue/              Vue composables, directives
  svelte/           Svelte actions, stores
  angular/          Angular directives, services
  gamepad/          Gamepad haptics adapter
  cli/              CLI preview, validation, preset listing
  react-native/     React Native adapter (iOS/Android native haptics)
  web-components/   Custom elements (<haptic-button>, etc.)

apps/
  playground/       Interactive demo site for testing patterns
```

### Core internals

The `packages/core/src/` directory is organized by feature:

| Directory | What it contains |
|-----------|-----------------|
| `engine/` | `HapticEngine`, `AdaptiveEngine`, `SensoryEngine`, `FallbackManager` |
| `patterns/` | HPL parser, tokenizer, compiler, validator, sharing/export |
| `composer/` | `PatternComposer` — fluent chainable API |
| `presets/` | Built-in presets (UI, notifications, gaming, accessibility, system, emotions) |
| `physics/` | Physics-based patterns (spring, bounce, friction, wave, etc.) |
| `sound/` | `SoundEngine` — procedural Web Audio API sounds |
| `visual/` | `VisualEngine` — CSS-based visual effects |
| `themes/` | `ThemeManager` and 8 built-in theme presets |
| `recorder/` | `PatternRecorder` — record tap rhythms to HPL |
| `adapters/` | `WebVibrationAdapter`, `NoopAdapter`, `IoSAudioAdapter` |
| `types/` | Shared TypeScript types and interfaces |
| `utils/` | Platform detection utilities |

---

## Development Workflow

### Adding a feature

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes in the relevant package(s)
3. Add or update tests
4. Run `pnpm build && pnpm test` to verify everything passes
5. Open a pull request

### Running tests

```bash
# Run all tests
pnpm test

# Run tests for a specific package
cd packages/core && pnpm test

# Run tests in watch mode (if supported)
pnpm test -- --watch
```

### Building

```bash
# Build all packages
pnpm build

# Build a single package
cd packages/core && pnpm build
```

All packages produce **dual ESM + CJS** output with TypeScript declarations.

---

## Code Style

- **TypeScript** throughout. All public APIs must have JSDoc comments.
- **Dual ESM + CJS** — ensure all packages export both formats.
- **Minimum 25ms vibration durations** — Android ignores vibrations shorter than ~25ms. All vibrate steps must use `Math.max(25, duration)`.
- **Intensity range 0.0--1.0** — always clamp intensity values.
- **No runtime dependencies** — the core package must remain zero-dependency.
- **Tree-shakeable** — use named exports, avoid side effects in module scope.
- **Naming conventions**:
  - Files: `kebab-case.ts`
  - Classes: `PascalCase`
  - Functions/variables: `camelCase`
  - Types/interfaces: `PascalCase`

---

## Adding a Preset

Presets live in `packages/core/src/presets/`. Each category has its own file.

### Step-by-step

1. Choose the right category file (e.g., `ui.ts`, `gaming.ts`, `emotions.ts`) or create a new one.

2. Add your preset as a `HapticPattern` object:

```typescript
/** MyEffect — short description of what it feels like */
myEffect: {
  name: 'category.myEffect',
  steps: [
    { type: 'vibrate', duration: 40, intensity: 0.6 },
    { type: 'pause', duration: 50, intensity: 0 },
    { type: 'vibrate', duration: 30, intensity: 0.8 },
  ],
},
```

3. Guidelines for preset design:
   - Keep total duration under 2 seconds for UI presets
   - Use minimum 25ms for all vibrate step durations
   - Make the pattern feel distinct from existing presets
   - Add a JSDoc comment describing the tactile sensation
   - Name the preset with `category.presetName` format

4. Export from `packages/core/src/presets/index.ts` if you created a new category.

5. Add tests in the corresponding test file.

---

## Adding an Adapter

Adapters connect the engine to different haptic hardware. All adapters implement the `HapticAdapter` interface.

### Step-by-step

1. Create a new file in the appropriate package (or create a new package under `packages/`).

2. Implement the `HapticAdapter` interface:

```typescript
import type { HapticAdapter, AdapterCapabilities, HapticStep } from '@hapticjs/core';

export class MyAdapter implements HapticAdapter {
  get capabilities(): AdapterCapabilities {
    return {
      vibration: true,
      intensityControl: true,
      // ... other capabilities
    };
  }

  async vibrate(duration: number, intensity: number): Promise<void> {
    // Your hardware-specific vibration logic
  }

  async playPattern(steps: HapticStep[]): Promise<void> {
    // Play a sequence of steps
    for (const step of steps) {
      if (step.type === 'vibrate') {
        await this.vibrate(step.duration, step.intensity);
      } else {
        await new Promise(r => setTimeout(r, step.duration));
      }
    }
  }

  dispose(): void {
    // Clean up resources
  }
}
```

3. Register your adapter with the engine:

```typescript
const adapter = new MyAdapter();
const engine = HapticEngine.create({ adapter });
```

4. Add tests that verify your adapter handles edge cases (zero duration, intensity clamping, disposal).

---

## Pull Requests

### Guidelines

- Keep PRs focused on a single change.
- Include tests for new features and bug fixes.
- Update relevant documentation if the public API changes.
- Ensure `pnpm build && pnpm test && pnpm typecheck` all pass.

### Commit messages

We use **conventional commits**:

```
feat: add rubberBand physics pattern
fix: clamp intensity to 0-1 range in spring()
docs: add physics patterns section to README
test: add SoundEngine disposal tests
refactor: extract step helper in physics-patterns
chore: update tsconfig paths
```

Prefixes: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`, `ci`, `style`.

---

## Issues

### Bug reports

When filing a bug, please include:

- **Device/browser** -- e.g., "Pixel 7, Chrome 120"
- **Package and version** -- e.g., `@hapticjs/core@1.2.0`
- **Steps to reproduce** -- minimal code snippet
- **Expected behavior** vs. **actual behavior**
- **Console errors** if any

### Feature requests

When requesting a feature, please include:

- **Use case** -- what problem does this solve?
- **Proposed API** -- how would you like to use it?
- **Alternatives considered** -- what have you tried instead?

---

## License

By contributing to @hapticjs, you agree that your contributions will be licensed under the [MIT License](LICENSE).
