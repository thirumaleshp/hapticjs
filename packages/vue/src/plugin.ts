import type { App, InjectionKey } from 'vue';
import { HapticEngine } from '@feelback/core';
import type { HapticConfig } from '@feelback/core';
import { vHaptic } from './directives/v-haptic';

export const HAPTIC_ENGINE_KEY: InjectionKey<HapticEngine> = Symbol('feelback-engine');

export interface FeelbackPluginOptions {
  config?: Partial<HapticConfig>;
  engine?: HapticEngine;
  /** Register v-haptic directive globally (default: true) */
  directive?: boolean;
}

/**
 * Vue plugin for Feelback haptic engine.
 *
 * Usage:
 *   import { FeelbackPlugin } from '@feelback/vue';
 *   app.use(FeelbackPlugin, { config: { intensity: 0.8 } });
 */
export const FeelbackPlugin = {
  install(app: App, options: FeelbackPluginOptions = {}) {
    const engine = options.engine ?? HapticEngine.create(options.config);
    app.provide(HAPTIC_ENGINE_KEY, engine);

    if (options.directive !== false) {
      app.directive('haptic', vHaptic);
    }
  },
};
