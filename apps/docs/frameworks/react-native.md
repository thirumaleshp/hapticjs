# React Native

`@hapticjs/react-native` provides a native haptic adapter that bridges @hapticjs to React Native's native haptic APIs.

## Installation

::: code-group

```bash [npm]
npm install @hapticjs/core @hapticjs/react-native
```

```bash [pnpm]
pnpm add @hapticjs/core @hapticjs/react-native
```

:::

## Setup

Create a `HapticEngine` with the React Native adapter:

```typescript
import { HapticEngine } from '@hapticjs/core';
import { ReactNativeHapticAdapter } from '@hapticjs/react-native';

const adapter = new ReactNativeHapticAdapter();
const engine = HapticEngine.create({ adapter });

// Use the same API as everywhere else
engine.tap();
engine.success();
engine.play('~~..##..@@');
```

## Usage with React Hooks

Combine with `@hapticjs/react` for hook-based access:

```tsx
import { HapticProvider } from '@hapticjs/react';
import { ReactNativeHapticAdapter } from '@hapticjs/react-native';

function App() {
  return (
    <HapticProvider config={{ adapter: new ReactNativeHapticAdapter() }}>
      <HomeScreen />
    </HapticProvider>
  );
}
```

```tsx
import { useHaptic } from '@hapticjs/react';
import { TouchableOpacity, Text } from 'react-native';

function SubmitButton() {
  const { trigger } = useHaptic('success');

  return (
    <TouchableOpacity onPress={trigger}>
      <Text>Submit</Text>
    </TouchableOpacity>
  );
}
```

## Platform Differences

| Platform | Backend |
|----------|---------|
| iOS | `UIImpactFeedbackGenerator`, `UINotificationFeedbackGenerator` |
| Android | `Vibrator` API via React Native's `Vibration` module |

The adapter automatically maps semantic effects to the best native API available on the platform.

## Impact Styles on iOS

The `impact()` method maps directly to iOS `UIImpactFeedbackGenerator` styles:

```typescript
engine.impact('light');    // UIImpactFeedbackStyle.light
engine.impact('medium');   // UIImpactFeedbackStyle.medium
engine.impact('heavy');    // UIImpactFeedbackStyle.heavy
engine.impact('rigid');    // UIImpactFeedbackStyle.rigid
engine.impact('soft');     // UIImpactFeedbackStyle.soft
```

## Example: Full App

```tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { HapticEngine } from '@hapticjs/core';
import { ReactNativeHapticAdapter } from '@hapticjs/react-native';

const engine = HapticEngine.create({
  adapter: new ReactNativeHapticAdapter(),
});

export default function App() {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => engine.tap()}
      >
        <Text>Tap</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => engine.success()}
      >
        <Text>Success</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => engine.play('~~..##..@@')}
      >
        <Text>Pattern</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { padding: 16, margin: 8, backgroundColor: '#3b82f6', borderRadius: 8 },
});
```

## Related

- [Getting Started](/guide/getting-started) -- Core setup
- [React](/frameworks/react) -- React hooks and components
- [Gamepad](/frameworks/gamepad) -- Gamepad haptics
