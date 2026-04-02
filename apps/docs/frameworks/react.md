# React

`@hapticjs/react` provides React hooks, a context provider, and pre-built components for haptic feedback.

## Installation

::: code-group

```bash [npm]
npm install @hapticjs/core @hapticjs/react
```

```bash [pnpm]
pnpm add @hapticjs/core @hapticjs/react
```

:::

## useHaptic

The primary hook for haptic feedback:

```tsx
import { useHaptic } from '@hapticjs/react';

function SubmitButton() {
  const { trigger, isSupported } = useHaptic('success');

  return (
    <button onClick={trigger}>
      Submit {!isSupported && '(no haptics)'}
    </button>
  );
}
```

### With Full API Access

```tsx
function MyComponent() {
  const haptic = useHaptic();

  return (
    <div>
      <button onClick={() => haptic.tap()}>Tap</button>
      <button onClick={() => haptic.success()}>Success</button>
      <button onClick={() => haptic.play('~~..##')}>Pattern</button>
      <button onClick={() => haptic.impact('heavy')}>Heavy Impact</button>
    </div>
  );
}
```

### Return Type

```typescript
interface UseHapticReturn {
  trigger: () => void;           // Trigger the specified effect
  isSupported: boolean;          // Whether haptics are supported
  // Plus all HapticEngine methods: tap, success, error, play, etc.
}
```

## HapticProvider

Provides a shared `HapticEngine` instance to all child components via context:

```tsx
import { HapticProvider } from '@hapticjs/react';

function App() {
  return (
    <HapticProvider>
      <MyComponent />
    </HapticProvider>
  );
}
```

### Props

```typescript
interface HapticProviderProps {
  children: React.ReactNode;
  config?: Partial<HapticConfig>;  // Engine configuration
}
```

### useHapticEngine

Access the engine directly from context:

```tsx
import { useHapticEngine } from '@hapticjs/react';

function DeepComponent() {
  const engine = useHapticEngine();
  return <button onClick={() => engine.tap()}>Tap</button>;
}
```

## HapticButton

A pre-built button component with haptic feedback:

```tsx
import { HapticButton } from '@hapticjs/react';

function Form() {
  return (
    <div>
      <HapticButton effect="tap" onClick={handleClick}>
        Click Me
      </HapticButton>

      <HapticButton effect="success" onClick={handleSubmit}>
        Submit
      </HapticButton>

      <HapticButton effect="error" onClick={handleDelete}>
        Delete
      </HapticButton>
    </div>
  );
}
```

### Props

```typescript
interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  effect: SemanticEffect;     // 'tap' | 'success' | 'error' | etc.
  children: React.ReactNode;
}
```

## useHapticGesture

Hook for binding haptic feedback to gesture events:

```tsx
import { useHapticGesture } from '@hapticjs/react';

function SwipeableCard() {
  const gestureRef = useHapticGesture({
    onTap: 'tap',
    onLongPress: 'longPress',
    onSwipe: 'swipe',
  });

  return <div ref={gestureRef}>Swipeable content</div>;
}
```

## Pattern Example

```tsx
import { useHaptic, HapticProvider } from '@hapticjs/react';
import { presets } from '@hapticjs/core';

function GameButton({ preset, label }: { preset: string; label: string }) {
  const haptic = useHaptic();

  return (
    <button onClick={() => haptic.play(presets.gaming[preset])}>
      {label}
    </button>
  );
}

function Game() {
  return (
    <HapticProvider config={{ intensity: 1.0 }}>
      <GameButton preset="explosion" label="Explode" />
      <GameButton preset="powerUp" label="Power Up" />
      <GameButton preset="swordClash" label="Attack" />
    </HapticProvider>
  );
}
```

## Related

- [Getting Started](/guide/getting-started) -- Core setup
- [Vue](/frameworks/vue) -- Vue integration
- [Svelte](/frameworks/svelte) -- Svelte integration
