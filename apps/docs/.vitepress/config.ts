import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@hapticjs',
  description: 'Universal Haptics Engine for JavaScript & TypeScript',
  lang: 'en-US',

  head: [
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: '@hapticjs — Universal Haptics Engine' }],
    ['meta', { name: 'og:description', content: 'Tiny, zero-dependency haptics library with a beautiful API and first-class framework integrations.' }],
  ],

  appearance: 'dark',

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '@hapticjs',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Frameworks', link: '/frameworks/react' },
      { text: 'API', link: '/api/core' },
      {
        text: 'v0.4.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/thirumaleshp/hapticjs/releases' },
          { text: 'npm', link: 'https://www.npmjs.com/org/hapticjs' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Semantic Effects', link: '/guide/semantic-effects' },
          ],
        },
        {
          text: 'Patterns',
          items: [
            { text: 'HPL Pattern Language', link: '/guide/hpl' },
            { text: 'Composer API', link: '/guide/composer' },
            { text: 'Presets', link: '/guide/presets' },
            { text: 'Emotions', link: '/guide/emotions' },
            { text: 'Physics Patterns', link: '/guide/physics' },
          ],
        },
        {
          text: 'Multi-Sensory',
          items: [
            { text: 'SensoryEngine', link: '/guide/multi-sensory' },
            { text: 'Themes', link: '/guide/themes' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Middleware', link: '/guide/middleware' },
            { text: 'Intensity Profiles', link: '/guide/profiles' },
            { text: 'Accessibility', link: '/guide/accessibility' },
            { text: 'Rhythm Sync', link: '/guide/rhythm-sync' },
            { text: 'Motion Detection', link: '/guide/motion-detection' },
            { text: 'Pattern Recorder', link: '/guide/pattern-recorder' },
            { text: 'A/B Testing', link: '/guide/ab-testing' },
          ],
        },
      ],
      '/frameworks/': [
        {
          text: 'Framework Integrations',
          items: [
            { text: 'React', link: '/frameworks/react' },
            { text: 'Vue', link: '/frameworks/vue' },
            { text: 'Svelte', link: '/frameworks/svelte' },
            { text: 'Angular', link: '/frameworks/angular' },
            { text: 'Web Components', link: '/frameworks/web-components' },
            { text: 'React Native', link: '/frameworks/react-native' },
            { text: 'Gamepad', link: '/frameworks/gamepad' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'HapticEngine', link: '/api/core' },
            { text: 'Types', link: '/api/types' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/thirumaleshp/hapticjs' },
      { icon: 'npm', link: 'https://www.npmjs.com/org/hapticjs' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2024-present @hapticjs contributors',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/thirumaleshp/hapticjs/edit/main/apps/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
