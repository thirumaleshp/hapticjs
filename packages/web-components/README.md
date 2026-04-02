# @hapticjs/web-components

Framework-agnostic custom elements for [Haptic.js](https://github.com/thirumaleshp/Feelback) -- the universal haptic feedback engine. Works with plain HTML, or any framework.

## Installation

```bash
npm install @hapticjs/web-components
```

Note: `@hapticjs/core` is bundled in, so you do not need to install it separately.

## Usage

Import once to register all custom elements:

```html
<script type="module">
  import '@hapticjs/web-components';
</script>
```

### `<haptic-button>`

A button that triggers haptic feedback on click.

```html
<!-- Semantic effects -->
<haptic-button effect="tap">Tap me</haptic-button>
<haptic-button effect="success">Submit</haptic-button>
<haptic-button effect="error">Delete</haptic-button>
<haptic-button effect="warning">Careful</haptic-button>

<!-- Custom HPL pattern -->
<haptic-button pattern="~~..##..@@">Custom pattern</haptic-button>

<!-- With intensity -->
<haptic-button effect="tap" intensity="0.3">Soft tap</haptic-button>

<!-- Disabled -->
<haptic-button effect="tap" disabled>Disabled</haptic-button>
```

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `effect` | Semantic effect name: `tap`, `doubleTap`, `success`, `warning`, `error`, `selection`, `impact` |
| `pattern` | HPL pattern string (takes precedence over `effect`) |
| `intensity` | Intensity value (0-1) for effects that support it |
| `disabled` | Disables the button and haptic feedback |

### `<haptic-surface>`

Wraps any content and adds haptic feedback on pointer interactions.

```html
<haptic-surface on-tap="tap" on-press="success" on-hover="selection">
  <div class="card">
    <h2>Interactive card</h2>
    <p>Tap, press, or hover for feedback</p>
  </div>
</haptic-surface>

<!-- With HPL pattern -->
<haptic-surface on-tap="~~..##">
  <img src="photo.jpg" alt="Photo" />
</haptic-surface>
```

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `on-tap` | Effect or HPL pattern on pointerdown |
| `on-press` | Effect or HPL pattern on pointerup |
| `on-hover` | Effect or HPL pattern on pointerenter |

### `<haptic-toggle>`

A toggle switch with built-in haptic feedback.

```html
<!-- Basic toggle -->
<haptic-toggle></haptic-toggle>

<!-- Pre-checked -->
<haptic-toggle checked></haptic-toggle>

<!-- Custom effects for on/off states -->
<haptic-toggle on-effect="success" off-effect="tap"></haptic-toggle>
```

Listen for changes:

```javascript
document.querySelector('haptic-toggle').addEventListener('change', (e) => {
  console.log('Toggled:', e.detail.checked);
});
```

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `checked` | Whether the toggle is on |
| `on-effect` | Effect or HPL pattern when toggled on |
| `off-effect` | Effect or HPL pattern when toggled off |
| `disabled` | Disables the toggle |

**CSS Parts:**

| Part | Description |
|------|-------------|
| `track` | The toggle track |
| `thumb` | The toggle thumb/knob |

## Styling

All elements use Shadow DOM. You can style them with CSS custom properties or `::part()`:

```css
haptic-button::part(button) {
  background: #4caf50;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}

haptic-toggle::part(track) {
  background: #ddd;
}
```

## Programmatic Use

You can also import the element classes directly:

```javascript
import { HapticButtonElement, HapticSurfaceElement, HapticToggleElement } from '@hapticjs/web-components';
```
