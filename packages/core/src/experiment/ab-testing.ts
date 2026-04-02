import type { HapticStep, HapticPattern } from '../types';

/** A tracked event entry */
interface TrackingEntry {
  userId: string;
  variant: string;
  event: string;
  value?: number;
  timestamp: number;
}

/** Aggregated results per variant */
interface VariantResult {
  assignments: number;
  events: Record<string, number>;
}

/**
 * A/B test different haptic patterns to see which users prefer.
 *
 * Usage:
 *   const exp = new HapticExperiment('checkout', { a: 'tap', b: 'success' });
 *   const variant = exp.assign('user-123');
 *   const pattern = exp.getVariant('user-123');
 *   exp.track('user-123', 'conversion');
 */
export class HapticExperiment {
  private _name: string;
  private variants: Record<string, string | HapticPattern | HapticStep[]>;
  private variantNames: string[];
  private assignments: Map<string, string> = new Map();
  private tracking: TrackingEntry[] = [];

  constructor(
    name: string,
    variants: Record<string, string | HapticPattern | HapticStep[]>,
  ) {
    this._name = name;
    this.variants = variants;
    this.variantNames = Object.keys(variants);

    if (this.variantNames.length === 0) {
      throw new Error('Experiment must have at least one variant');
    }
  }

  /** Experiment name */
  get name(): string {
    return this._name;
  }

  /**
   * Randomly assign a variant (consistent for same userId via simple hash).
   * If no userId is provided, generates a random assignment.
   */
  assign(userId?: string): string {
    const id = userId ?? `anon-${Math.random().toString(36).slice(2)}`;

    // Return existing assignment for this user
    const existing = this.assignments.get(id);
    if (existing) return existing;

    // Hash-based deterministic assignment for consistent results
    const hash = this._hash(id);
    const index = hash % this.variantNames.length;
    const variant = this.variantNames[index]!;

    this.assignments.set(id, variant);
    return variant;
  }

  /** Get the assigned variant pattern for a user */
  getVariant(userId?: string): string | HapticPattern | HapticStep[] | undefined {
    const id = userId ?? undefined;
    if (!id) return undefined;

    const variant = this.assignments.get(id);
    if (!variant) return undefined;

    return this.variants[variant];
  }

  /** Track an event for a user */
  track(userId: string, event: string, value?: number): void {
    const variant = this.assignments.get(userId);
    if (!variant) return;

    this.tracking.push({
      userId,
      variant,
      event,
      value,
      timestamp: Date.now(),
    });
  }

  /** Get aggregated results per variant */
  getResults(): Record<string, VariantResult> {
    const results: Record<string, VariantResult> = {};

    // Initialize all variants
    for (const name of this.variantNames) {
      results[name] = { assignments: 0, events: {} };
    }

    // Count assignments
    for (const variant of this.assignments.values()) {
      if (results[variant]) {
        results[variant].assignments++;
      }
    }

    // Aggregate events
    for (const entry of this.tracking) {
      if (results[entry.variant]) {
        const events = results[entry.variant]!.events;
        events[entry.event] = (events[entry.event] ?? 0) + 1;
      }
    }

    return results;
  }

  /** Clear all tracking data and assignments */
  reset(): void {
    this.assignments.clear();
    this.tracking = [];
  }

  /** Simple string hash for deterministic variant assignment */
  private _hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
