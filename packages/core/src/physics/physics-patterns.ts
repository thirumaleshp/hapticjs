import type { HapticPattern, HapticStep } from '../types';

// ─── Option types ───────────────────────────────────────────

export interface SpringOptions {
  /** Spring stiffness 0.5-1.0 */
  stiffness?: number;
  /** Damping factor 0.1-0.9 */
  damping?: number;
  /** Total duration in ms */
  duration?: number;
}

export interface BounceOptions {
  /** Initial height 0.5-1.0 */
  height?: number;
  /** Bounciness factor 0.3-0.9 */
  bounciness?: number;
  /** Number of bounces */
  bounces?: number;
}

export interface FrictionOptions {
  /** Surface roughness 0.1-1.0 */
  roughness?: number;
  /** Sliding speed 0.1-1.0 */
  speed?: number;
  /** Total duration in ms */
  duration?: number;
}

export interface ImpactOptions {
  /** Object mass 0.1-1.0 */
  mass?: number;
  /** Surface hardness 0.1-1.0 */
  hardness?: number;
}

export interface GravityOptions {
  /** Fall distance 0.3-1.0 */
  distance?: number;
  /** Total duration in ms */
  duration?: number;
}

export interface ElasticOptions {
  /** Stretch amount 0.3-1.0 */
  stretch?: number;
  /** Snap-back speed 0.3-1.0 */
  snapSpeed?: number;
}

export interface WaveOptions {
  /** Wave amplitude 0.3-1.0 */
  amplitude?: number;
  /** Wave frequency 0.5-2.0 */
  frequency?: number;
  /** Number of full cycles */
  cycles?: number;
}

export interface PendulumOptions {
  /** Swing energy 0.3-1.0 */
  energy?: number;
  /** Number of swings */
  swings?: number;
}

// ─── Helpers ────────────────────────────────────────────────

const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

const step = (
  type: 'vibrate' | 'pause',
  duration: number,
  intensity: number,
): HapticStep => ({
  type,
  duration: Math.max(25, Math.round(duration)),
  intensity: clamp(Math.round(intensity * 100) / 100, 0, 1),
});

// ─── Physics patterns ───────────────────────────────────────

/** Bouncy spring oscillation — starts heavy, bounces with decreasing intensity */
export function spring(options?: SpringOptions): HapticPattern {
  const stiffness = clamp(options?.stiffness ?? 0.7, 0.5, 1.0);
  const damping = clamp(options?.damping ?? 0.3, 0.1, 0.9);
  const duration = options?.duration ?? 500;

  const numSteps = Math.round(10 + stiffness * 5); // 10-15 steps
  const stepDuration = duration / numSteps;
  const steps: HapticStep[] = [];

  for (let i = 0; i < numSteps; i++) {
    const t = i / (numSteps - 1);
    const decay = Math.exp(-damping * t * 5);
    const oscillation = Math.abs(Math.cos(t * Math.PI * stiffness * 4));
    const intensity = decay * oscillation * stiffness;

    if (intensity > 0.05) {
      steps.push(step('vibrate', stepDuration, intensity));
    } else {
      steps.push(step('pause', stepDuration, 0));
    }
  }

  return { name: 'physics.spring', steps };
}

/** Ball bouncing — each bounce is shorter and lighter */
export function bounce(options?: BounceOptions): HapticPattern {
  const height = clamp(options?.height ?? 1.0, 0.5, 1.0);
  const bounciness = clamp(options?.bounciness ?? 0.6, 0.3, 0.9);
  const bounces = options?.bounces ?? 5;

  const steps: HapticStep[] = [];
  let currentHeight = height;

  for (let i = 0; i < bounces; i++) {
    const vibDuration = 40 + currentHeight * 60;
    const pauseDuration = 30 + currentHeight * 70;

    steps.push(step('vibrate', vibDuration, currentHeight));
    if (i < bounces - 1) {
      steps.push(step('pause', pauseDuration, 0));
    }

    currentHeight *= bounciness;
  }

  return { name: 'physics.bounce', steps };
}

/** Rough surface sliding — continuous but slightly irregular vibration */
export function friction(options?: FrictionOptions): HapticPattern {
  const roughness = clamp(options?.roughness ?? 0.5, 0.1, 1.0);
  const speed = clamp(options?.speed ?? 0.5, 0.1, 1.0);
  const duration = options?.duration ?? 300;

  const pulseCount = Math.round(4 + speed * 8);
  const pulseDuration = duration / pulseCount;
  const steps: HapticStep[] = [];

  for (let i = 0; i < pulseCount; i++) {
    // Irregular intensity based on roughness
    const variation = ((Math.sin(i * 7.3) + 1) / 2) * roughness * 0.4;
    const baseIntensity = 0.3 + roughness * 0.4;
    const intensity = baseIntensity + variation;

    steps.push(step('vibrate', pulseDuration * 0.7, intensity));
    steps.push(step('pause', pulseDuration * 0.3, 0));
  }

  return { name: 'physics.friction', steps };
}

/** Collision with surface — sharp initial hit followed by resonance */
export function impact(options?: ImpactOptions): HapticPattern {
  const mass = clamp(options?.mass ?? 0.5, 0.1, 1.0);
  const hardness = clamp(options?.hardness ?? 0.7, 0.1, 1.0);

  const steps: HapticStep[] = [];

  // Initial heavy hit
  const hitDuration = 30 + mass * 50;
  const hitIntensity = 0.5 + mass * 0.5;
  steps.push(step('vibrate', hitDuration, hitIntensity));

  // Resonance — decaying smaller vibrations
  const resonanceCount = Math.round(2 + hardness * 4);
  let decayIntensity = hitIntensity * 0.6;

  for (let i = 0; i < resonanceCount; i++) {
    const pauseDur = 25 + (1 - hardness) * 30;
    steps.push(step('pause', pauseDur, 0));
    steps.push(step('vibrate', 25 + mass * 20, decayIntensity));
    decayIntensity *= 0.5;
  }

  return { name: 'physics.impact', steps };
}

/** Falling sensation — accelerating intensity */
export function gravity(options?: GravityOptions): HapticPattern {
  const distance = clamp(options?.distance ?? 1.0, 0.3, 1.0);
  const duration = options?.duration ?? 400;

  const numSteps = Math.round(6 + distance * 4);
  const stepDuration = duration / numSteps;
  const steps: HapticStep[] = [];

  for (let i = 0; i < numSteps; i++) {
    const t = i / (numSteps - 1);
    // Quadratic acceleration like gravity: v = g*t, intensity ~ t^2
    const intensity = t * t * distance;
    steps.push(step('vibrate', stepDuration, Math.max(0.1, intensity)));
  }

  return { name: 'physics.gravity', steps };
}

/** Rubber band snap — stretch and snap back */
export function elastic(options?: ElasticOptions): HapticPattern {
  const stretch = clamp(options?.stretch ?? 0.7, 0.3, 1.0);
  const snapSpeed = clamp(options?.snapSpeed ?? 0.8, 0.3, 1.0);

  const steps: HapticStep[] = [];

  // Building tension — increasing intensity
  const tensionSteps = Math.round(3 + stretch * 3);
  for (let i = 0; i < tensionSteps; i++) {
    const t = (i + 1) / tensionSteps;
    const intensity = t * stretch * 0.6;
    steps.push(step('vibrate', 40 + (1 - snapSpeed) * 30, intensity));
  }

  // Sharp snap
  steps.push(step('vibrate', 25 + (1 - snapSpeed) * 20, 0.8 + stretch * 0.2));

  // Snap recoil — quick decay
  const recoilIntensity = 0.4 * snapSpeed;
  steps.push(step('vibrate', 30, recoilIntensity));
  steps.push(step('vibrate', 25, recoilIntensity * 0.4));

  return { name: 'physics.elastic', steps };
}

/** Ocean wave motion — smooth sine-wave-like intensity */
export function wave(options?: WaveOptions): HapticPattern {
  const amplitude = clamp(options?.amplitude ?? 0.7, 0.3, 1.0);
  const frequency = clamp(options?.frequency ?? 1.0, 0.5, 2.0);
  const cycles = options?.cycles ?? 2;

  const stepsPerCycle = Math.round(8 / frequency);
  const totalSteps = stepsPerCycle * cycles;
  const stepDuration = (400 / frequency) / stepsPerCycle;
  const steps: HapticStep[] = [];

  for (let i = 0; i < totalSteps; i++) {
    const t = i / stepsPerCycle;
    const sineValue = (Math.sin(t * 2 * Math.PI) + 1) / 2;
    const intensity = 0.1 + sineValue * amplitude * 0.9;
    steps.push(step('vibrate', stepDuration, intensity));
  }

  return { name: 'physics.wave', steps };
}

/** Swinging motion — intensity peaks at ends, quiet in middle */
export function pendulum(options?: PendulumOptions): HapticPattern {
  const energy = clamp(options?.energy ?? 0.8, 0.3, 1.0);
  const swings = options?.swings ?? 3;

  const stepsPerSwing = 6;
  const steps: HapticStep[] = [];

  for (let s = 0; s < swings; s++) {
    const swingEnergy = energy * Math.pow(0.8, s); // decay per swing

    for (let i = 0; i < stepsPerSwing; i++) {
      const t = i / (stepsPerSwing - 1);
      // Peaks at 0 and 1 (ends), low in middle
      const swing = Math.abs(Math.cos(t * Math.PI));
      const intensity = swing * swingEnergy;

      if (intensity > 0.05) {
        steps.push(step('vibrate', 35, intensity));
      } else {
        steps.push(step('pause', 35, 0));
      }
    }
  }

  return { name: 'physics.pendulum', steps };
}
