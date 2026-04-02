# Web Components

`@hapticjs/web-components` provides custom elements that add haptic feedback to any HTML page or framework.

## Installation

::: code-group

```bash [npm]
npm install @hapticjs/core @hapticjs/web-components
```

```bash [pnpm]
pnpm add @hapticjs/core @hapticjs/web-components
```

:::

## Setup

Import the package to register the custom elements:

```typescript
import '@hapticjs/web-components';
```

## Haptic Button

```html
<haptic-button effect="tap">Click me</haptic-button>
<haptic-button effect="success">Submit</haptic-button>
<haptic-button effect="error">Delete</haptic-button>
```

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `effect` | `string` | Semantic effect name (`tap`, `success`, `error`, etc.) |
| `pattern` | `string` | HPL pattern string |
| `intensity` | `number` | Intensity override (0.0 - 1.0) |

### With HPL Patterns

```html
<haptic-button pattern="~~..##..@@">Pattern</haptic-button>
<haptic-button pattern="[~.]x3">Pulse</haptic-button>
```

## Using in Plain HTML

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@hapticjs/web-components';
  </script>
</head>
<body>
  <haptic-button effect="tap">Tap Me</haptic-button>
  <haptic-button effect="success">Submit</haptic-button>
</body>
</html>
```

## Using with Any Framework

Web Components work with any framework:

```tsx
// React
function App() {
  return <haptic-button effect="tap">Click</haptic-button>;
}
```

```vue
<!-- Vue -->
<template>
  <haptic-button effect="success">Submit</haptic-button>
</template>
```

```svelte
<!-- Svelte -->
<haptic-button effect="tap">Click</haptic-button>
```

::: info
Web Components are a good choice when you need haptic feedback in a framework-agnostic way or in a micro-frontend architecture.
:::

## Related

- [Getting Started](/guide/getting-started) -- Core setup
- [Angular](/frameworks/angular) -- Angular integration
- [React](/frameworks/react) -- React integration
