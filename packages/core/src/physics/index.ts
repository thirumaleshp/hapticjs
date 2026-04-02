export {
  spring,
  bounce,
  friction,
  impact,
  gravity,
  elastic,
  wave,
  pendulum,
} from './physics-patterns';

export type {
  SpringOptions,
  BounceOptions,
  FrictionOptions,
  ImpactOptions,
  GravityOptions,
  ElasticOptions,
  WaveOptions,
  PendulumOptions,
} from './physics-patterns';

import {
  spring,
  bounce,
  friction,
  impact,
  gravity,
  elastic,
  wave,
  pendulum,
} from './physics-patterns';

/** All physics-based haptic pattern generators */
export const physics = {
  spring,
  bounce,
  friction,
  impact,
  gravity,
  elastic,
  wave,
  pendulum,
} as const;
