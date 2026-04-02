# @hapticjs/react-native

React Native adapter for the @hapticjs haptic engine.

```bash
npm install @hapticjs/react-native @hapticjs/core
```

## Backends

Automatically detects and uses the best available haptic backend:

1. **react-native-haptic-feedback** (preferred) — rich haptic types on iOS/Android
2. **expo-haptics** — Expo-compatible haptics
3. **React Native Vibration** — basic vibration fallback

Install at least one:

```bash
npm install react-native-haptic-feedback
# or
npx expo install expo-haptics
```

## Usage

```tsx
import { useHaptic } from '@hapticjs/react-native';

// With a preset
function LikeButton() {
  const { trigger, isSupported } = useHaptic('success');
  return <Pressable onPress={trigger}><Text>Like</Text></Pressable>;
}

// Full API
function App() {
  const haptic = useHaptic();

  return (
    <Pressable onPress={() => haptic.tap()}>
      <Text>Tap me</Text>
    </Pressable>
  );
}
```

## License

MIT
