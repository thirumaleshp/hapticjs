---
layout: home

hero:
  name: '@hapticjs'
  text: Universal Haptics Engine
  tagline: Tiny, zero-dependency haptics library with a beautiful API, a novel pattern language, and first-class framework integrations.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/thirumaleshp/hapticjs

features:
  - icon: "\U0001F50A"
    title: One API Everywhere
    details: Web Vibration API, Gamepad rumble, React Native, iOS audio -- one consistent interface across all platforms.
  - icon: "\U0001F3B5"
    title: Haptic Pattern Language
    details: 'Describe complex patterns as tiny strings: ~~..##..@@. Easy to read, easy to share.'
  - icon: "\U0001F3A8"
    title: Multi-Sensory Feedback
    details: Combine haptic, sound, and visual feedback into themed multi-sensory experiences with SensoryEngine.
  - icon: "\U0001F9E9"
    title: 55+ Built-in Presets
    details: UI, notifications, gaming, accessibility, system, and emotion presets ready to use out of the box.
  - icon: "\U0001F4E6"
    title: Framework Integrations
    details: First-class support for React hooks, Vue composables/directives, Svelte actions, Angular, and Web Components.
  - icon: "\U0001F680"
    title: Tiny & Tree-shakeable
    details: '<3KB gzipped, zero dependencies, full TypeScript support, dual ESM/CJS.'
---

## Quick Start

Install the core package:

```bash
npm install @hapticjs/core
```

Add haptic feedback in three lines:

```typescript
import { haptic } from '@hapticjs/core';

haptic.tap();
haptic.success();
haptic.play('~~..##..@@');
```

<div style="text-align: center; margin-top: 2rem;">
  <a href="/guide/getting-started" style="display: inline-block; padding: 0.75rem 2rem; background: var(--vp-c-brand-1); color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Read the full guide</a>
</div>
