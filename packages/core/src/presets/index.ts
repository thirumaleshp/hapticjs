export { ui } from './ui';
export { notifications } from './notifications';
export { gaming } from './gaming';
export { accessibility } from './accessibility';
export { system } from './system';

import { ui } from './ui';
import { notifications } from './notifications';
import { gaming } from './gaming';
import { accessibility } from './accessibility';
import { system } from './system';

/** All presets grouped by category */
export const presets = {
  ui,
  notifications,
  gaming,
  accessibility,
  system,
} as const;
