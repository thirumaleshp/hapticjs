# @hapticjs/react

React hooks and components for the @hapticjs haptic engine.

```bash
npm install @hapticjs/react @hapticjs/core
```

## Usage

```tsx
import { useHaptic, HapticProvider, HapticButton } from '@hapticjs/react';

// With a preset effect
function LikeButton() {
  const { trigger, isSupported } = useHaptic('success');
  return <button onClick={trigger}>Like</button>;
}

// Full API
function App() {
  const haptic = useHaptic();

  return (
    <HapticProvider>
      <button onClick={() => haptic.tap()}>Tap</button>
      <button onClick={() => haptic.play('~~..##')}>Pattern</button>
      <HapticButton effect="success">Submit</HapticButton>
    </HapticProvider>
  );
}
```

## Gesture Hook

```tsx
import { useHapticGesture } from '@hapticjs/react';

function Card() {
  const gestureProps = useHapticGesture({
    onTap: 'tap',
    onLongPress: 'success',
  });

  return <div {...gestureProps}>Press me</div>;
}
```

## License

MIT
