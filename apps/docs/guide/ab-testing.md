# A/B Testing

`HapticExperiment` lets you A/B test different haptic patterns to determine which users prefer. It handles variant assignment, event tracking, and results aggregation.

## Setup

```typescript
import { HapticExperiment, haptic } from '@hapticjs/core';

const experiment = new HapticExperiment('checkout-feedback', {
  a: '~~..##',          // HPL string
  b: '@@',              // Another HPL string
  c: '|..|..|',         // A third variant
});
```

Variants can be HPL strings, `HapticPattern` objects, or `HapticStep[]` arrays.

## Assigning Variants

```typescript
// Deterministic assignment based on user ID (consistent via hash)
const variant = experiment.assign('user-123');  // 'a', 'b', or 'c'

// Same user always gets the same variant
experiment.assign('user-123'); // Same result as above

// Anonymous assignment (random)
const anonVariant = experiment.assign();
```

## Playing the Assigned Pattern

```typescript
const userId = 'user-123';
experiment.assign(userId);

const pattern = experiment.getVariant(userId);
if (pattern) {
  haptic.play(pattern);
}
```

## Tracking Events

Track user actions to measure which variant performs better:

```typescript
// Track conversion
experiment.track('user-123', 'conversion');

// Track engagement
experiment.track('user-123', 'button-click');

// Track with a numeric value
experiment.track('user-123', 'satisfaction', 4.5);
```

## Getting Results

```typescript
const results = experiment.getResults();
// {
//   a: { assignments: 15, events: { conversion: 8, 'button-click': 12 } },
//   b: { assignments: 14, events: { conversion: 11, 'button-click': 10 } },
//   c: { assignments: 13, events: { conversion: 6, 'button-click': 9 } },
// }
```

## Properties and Methods

| Member | Description |
|--------|-------------|
| `name` | Experiment name |
| `assign(userId?)` | Assign a variant (deterministic per user ID) |
| `getVariant(userId)` | Get the pattern for an assigned user |
| `track(userId, event, value?)` | Track an event |
| `getResults()` | Get aggregated results per variant |
| `reset()` | Clear all assignments and tracking data |

## Full Example

```typescript
import { HapticExperiment, haptic, presets } from '@hapticjs/core';

// Test which notification pattern leads to more conversions
const experiment = new HapticExperiment('notification-haptic', {
  subtle: presets.notifications.info,
  standard: presets.notifications.success,
  strong: presets.notifications.alarm,
});

function onCheckout(userId: string) {
  // Assign and play the variant
  const variant = experiment.assign(userId);
  const pattern = experiment.getVariant(userId);
  if (pattern) {
    haptic.play(pattern);
  }

  console.log(`User ${userId} assigned to variant: ${variant}`);
}

function onPurchaseComplete(userId: string) {
  // Track the conversion
  experiment.track(userId, 'purchase');
}

// Later, analyze results
function analyzeExperiment() {
  const results = experiment.getResults();

  for (const [variant, data] of Object.entries(results)) {
    const conversionRate = (data.events.purchase ?? 0) / data.assignments;
    console.log(`${variant}: ${(conversionRate * 100).toFixed(1)}% conversion`);
  }
}
```

::: tip
The assignment hash is deterministic -- the same `userId` always maps to the same variant within the same experiment. This ensures consistent user experiences across sessions.
:::

::: info
`HapticExperiment` stores data in-memory. For production, persist `getResults()` to your analytics backend.
:::

## Related

- [Presets](/guide/presets) -- Use presets as experiment variants
- [Pattern Recorder](/guide/pattern-recorder) -- Record custom patterns to test
- [Middleware](/guide/middleware) -- Transform patterns before playback
