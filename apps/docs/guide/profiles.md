# Intensity Profiles

Profiles let users control how strong haptic feedback feels. Each profile scales intensity, duration, sound volume, and visual feedback. The `ProfileManager` converts profiles into middleware for easy integration.

## Built-in Profiles

| Profile | Haptic Scale | Duration Scale | Sound Volume | Visual |
|---------|-------------|----------------|--------------|--------|
| `off` | 0 | 0 | 0 | Off |
| `subtle` | 0.5 | 0.7 | 0.1 | On |
| `normal` | 1.0 | 1.0 | 0.3 | On |
| `strong` | 1.3 | 1.2 | 0.5 | On |
| `intense` | 1.8 | 1.5 | 0.7 | On |
| `accessible` | 1.5 | 1.3 | 0.6 | On |

## ProfileManager

```typescript
import { ProfileManager } from '@hapticjs/core';

const pm = new ProfileManager();

// Apply a built-in profile
pm.setProfile('strong');

// Get current profile
const profile = pm.getProfile();
console.log(profile.hapticScale);    // 1.3
console.log(profile.soundVolume);    // 0.5

// Current profile name
pm.current;                          // 'strong'

// List available profiles
pm.listProfiles();                   // ['off', 'subtle', 'normal', ...]
```

## Converting to Middleware

Profiles convert to `HapticMiddleware` for use with the middleware pipeline:

```typescript
import { ProfileManager, MiddlewareManager } from '@hapticjs/core';

const pm = new ProfileManager();
pm.setProfile('accessible');

const manager = new MiddlewareManager();
manager.use(pm.toMiddleware());

// Now all patterns go through the profile's intensity/duration scaling
const adjusted = manager.process(steps);
```

## Custom Profiles

Register your own profiles:

```typescript
import { ProfileManager } from '@hapticjs/core';
import type { IntensityProfile } from '@hapticjs/core';

const pm = new ProfileManager();

const custom: IntensityProfile = {
  name: 'gaming-mode',
  hapticScale: 1.5,
  durationScale: 1.0,
  soundEnabled: true,
  soundVolume: 0.8,
  visualEnabled: true,
};

pm.registerProfile(custom);
pm.setProfile('gaming-mode');
```

You can also pass a profile object directly to `setProfile`:

```typescript
pm.setProfile({
  name: 'custom',
  hapticScale: 0.7,
  durationScale: 0.9,
  soundEnabled: false,
  soundVolume: 0,
  visualEnabled: true,
});
```

## IntensityProfile Interface

```typescript
type IntensityProfile = {
  name: string;
  /** 0-2 multiplier for vibration intensity */
  hapticScale: number;
  /** 0-2 multiplier for durations */
  durationScale: number;
  /** Whether sound feedback is enabled */
  soundEnabled: boolean;
  /** Sound volume from 0-1 */
  soundVolume: number;
  /** Whether visual feedback is enabled */
  visualEnabled: boolean;
};
```

## User Settings Example

```typescript
import { ProfileManager, MiddlewareManager } from '@hapticjs/core';

const pm = new ProfileManager();
const mw = new MiddlewareManager();

// User selects their preference from a settings UI
function onProfileChange(profileName: string) {
  pm.setProfile(profileName);

  // Replace the profile middleware
  mw.remove(`profile:${pm.current}`);
  mw.use(pm.toMiddleware());
}
```

::: tip
The middleware created by `toMiddleware()` is named `profile:<name>` (e.g., `profile:strong`), making it easy to identify and replace.
:::

## Related

- [Middleware](/guide/middleware) -- The middleware pipeline
- [Accessibility](/guide/accessibility) -- Accessible profiles and features
- [Themes](/guide/themes) -- Theme system for multi-sensory configuration
