# Accessibility

@hapticjs provides built-in accessibility features to ensure haptic feedback enhances rather than hinders the user experience for people with different abilities.

## HapticA11y

`HapticA11y` auto-attaches haptic feedback to common accessibility interactions. It listens to DOM events and uses `MutationObserver` to watch for dynamically added elements.

### Setup

```typescript
import { HapticEngine, HapticA11y } from '@hapticjs/core';

const engine = HapticEngine.create();
const a11y = new HapticA11y(engine, {
  focusChange: true,     // Haptic on focus changes
  formErrors: true,      // Haptic on form validation errors
  navigation: true,      // Haptic on link clicks
  announcements: true,   // Haptic on alert/notification elements
});

// Attach to the DOM (defaults to document.body)
a11y.attach();

// Or attach to a specific root element
a11y.attach(document.getElementById('app'));
```

### Automatic Haptic Mapping

| DOM Event / Element | Haptic Effect |
|---------------------|---------------|
| Focus change (`focusin`) | `selection()` |
| Form validation error (`invalid`) | `error()` |
| Button click | `tap()` |
| Link click | `selection()` |
| Checkbox / radio toggle | `toggle(checked)` |
| `role="alert"` added | `warning()` |
| `role="status"` or `aria-live` added | `selection()` |
| `<dialog>` or `role="dialog"` added | `toggle(true)` |
| `<dialog>` or `role="dialog"` removed | `toggle(false)` |

### Custom Handlers

Override the default behavior for focus and form errors:

```typescript
a11y.onFocusChange((event) => {
  // Custom haptic logic for focus changes
  engine.impact('light');
});

a11y.onFormError((event) => {
  // Custom haptic logic for form errors
  engine.impact('heavy');
});
```

### Cleanup

```typescript
// Stop listening
a11y.detach();

// Full cleanup (detach + clear callbacks)
a11y.dispose();

// Check status
a11y.isAttached; // boolean
```

### Options

```typescript
interface HapticA11yOptions {
  focusChange?: boolean;      // default: true
  formErrors?: boolean;       // default: true
  navigation?: boolean;       // default: true
  announcements?: boolean;    // default: true
}
```

## Accessible Profile

Use the built-in `accessible` profile for stronger, longer feedback:

```typescript
import { ProfileManager } from '@hapticjs/core';

const pm = new ProfileManager();
pm.setProfile('accessible');
// hapticScale: 1.5, durationScale: 1.3, soundVolume: 0.6
```

## Accessibility Booster Middleware

The `accessibilityBooster` middleware increases all intensities by 30% and durations by 20%:

```typescript
import { MiddlewareManager, accessibilityBooster } from '@hapticjs/core';

const mw = new MiddlewareManager();
mw.use(accessibilityBooster());
```

## Accessible Theme

The `accessible` theme maximizes feedback across all channels:

```typescript
import { SensoryEngine } from '@hapticjs/core';

const engine = SensoryEngine.create({ theme: 'accessible' });
// hapticIntensity: 1.0, soundVolume: 0.6, high-contrast colors
```

## Best Practices

::: tip
- Always provide the option to disable haptics
- Use the `accessible` profile or theme for users who need stronger feedback
- Combine haptic with visual and audio feedback for multi-modal accessibility
- Keep haptic feedback subtle for frequent interactions (focus, selection)
- Use stronger feedback for important state changes (errors, confirmations)
:::

::: warning
Excessive or unexpected haptic feedback can be disorienting. Always respect user preferences and system settings (`respectSystemSettings: true`).
:::

## Related

- [Profiles](/guide/profiles) -- Intensity profile system
- [Middleware](/guide/middleware) -- The `accessibilityBooster` middleware
- [Themes](/guide/themes) -- The `accessible` theme
- [Multi-Sensory](/guide/multi-sensory) -- Combined haptic + sound + visual
