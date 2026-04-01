import type { HapticStep, HapticPattern } from '../types/haptic-effect';
import { parseHPL } from './parser';
import { compile } from './compiler';

/** Portable JSON-serializable format for sharing haptic patterns */
export interface HapticPatternExport {
  version: 1;
  name: string;
  description?: string;
  /** Original HPL string if pattern was created from HPL */
  hpl?: string;
  /** Compiled haptic steps */
  steps: HapticStep[];
  metadata?: {
    /** Total duration in milliseconds */
    duration: number;
    author?: string;
    tags?: string[];
    /** ISO date string */
    createdAt?: string;
  };
}

/** Options for exporting a pattern */
export interface ExportOptions {
  name?: string;
  description?: string;
  author?: string;
  tags?: string[];
}

/** Input types accepted by exportPattern */
type ExportInput = HapticPattern | HapticStep[] | string;

/**
 * Calculate total duration of a step sequence.
 */
function totalDuration(steps: HapticStep[]): number {
  return steps.reduce((sum, s) => sum + s.duration, 0);
}

/**
 * Resolve input to steps and optional HPL source string.
 */
function resolveInput(input: ExportInput): { steps: HapticStep[]; hpl?: string; name?: string } {
  // HPL string
  if (typeof input === 'string') {
    const ast = parseHPL(input);
    return { steps: compile(ast), hpl: input };
  }

  // HapticStep[]
  if (Array.isArray(input)) {
    return { steps: input };
  }

  // HapticPattern
  return { steps: input.steps, name: input.name };
}

/**
 * Export a haptic pattern as a portable JSON-serializable object.
 *
 * Accepts a HapticPattern, HapticStep[], or HPL string.
 */
export function exportPattern(
  input: ExportInput,
  options: ExportOptions = {},
): HapticPatternExport {
  const resolved = resolveInput(input);
  const steps = resolved.steps;
  const name = options.name ?? resolved.name ?? 'Untitled Pattern';

  const result: HapticPatternExport = {
    version: 1,
    name,
    steps,
  };

  if (options.description) {
    result.description = options.description;
  }

  if (resolved.hpl) {
    result.hpl = resolved.hpl;
  }

  const hasMetadataFields = options.author || options.tags;
  if (hasMetadataFields || steps.length > 0) {
    result.metadata = {
      duration: totalDuration(steps),
      createdAt: new Date().toISOString(),
    };

    if (options.author) {
      result.metadata.author = options.author;
    }

    if (options.tags) {
      result.metadata.tags = options.tags;
    }
  }

  return result;
}

/**
 * Validate that a value looks like a valid HapticPatternExport.
 * Throws descriptive errors for invalid data.
 */
function validateExport(data: unknown): asserts data is HapticPatternExport {
  if (data === null || typeof data !== 'object') {
    throw new Error('Invalid pattern data: expected an object');
  }

  const obj = data as Record<string, unknown>;

  if (obj.version !== 1) {
    throw new Error(
      `Unsupported pattern version: ${String(obj.version)}. Expected version 1`,
    );
  }

  if (typeof obj.name !== 'string' || obj.name.length === 0) {
    throw new Error('Invalid pattern data: "name" must be a non-empty string');
  }

  if (!Array.isArray(obj.steps)) {
    throw new Error('Invalid pattern data: "steps" must be an array');
  }

  for (let i = 0; i < obj.steps.length; i++) {
    const step = obj.steps[i] as Record<string, unknown>;

    if (step.type !== 'vibrate' && step.type !== 'pause') {
      throw new Error(
        `Invalid step at index ${i}: "type" must be "vibrate" or "pause"`,
      );
    }

    if (typeof step.duration !== 'number' || step.duration < 0) {
      throw new Error(
        `Invalid step at index ${i}: "duration" must be a non-negative number`,
      );
    }

    if (typeof step.intensity !== 'number' || step.intensity < 0 || step.intensity > 1) {
      throw new Error(
        `Invalid step at index ${i}: "intensity" must be a number between 0 and 1`,
      );
    }
  }
}

/**
 * Import a pattern from a HapticPatternExport object or JSON string.
 * Validates the data and returns a HapticPattern.
 */
export function importPattern(data: HapticPatternExport | string): HapticPattern {
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  validateExport(parsed);

  const pattern: HapticPattern = {
    name: parsed.name,
    steps: parsed.steps.map((s) => ({ ...s })),
  };

  if (parsed.metadata) {
    pattern.metadata = { ...parsed.metadata };
  }

  return pattern;
}

/**
 * Serialize a pattern to a pretty-printed JSON string.
 */
export function patternToJSON(
  input: ExportInput,
  options: ExportOptions = {},
): string {
  const exported = exportPattern(input, options);
  return JSON.stringify(exported, null, 2);
}

/**
 * Parse a JSON string into a HapticPattern.
 */
export function patternFromJSON(json: string): HapticPattern {
  return importPattern(json);
}

/**
 * Encode a pattern as a data: URL for easy sharing via links.
 */
export function patternToDataURL(
  input: ExportInput,
  options: ExportOptions = {},
): string {
  const json = patternToJSON(input, options);
  const encoded = btoa(json);
  return `data:application/haptic+json;base64,${encoded}`;
}

/**
 * Decode a data: URL back to a HapticPattern.
 */
export function patternFromDataURL(url: string): HapticPattern {
  const prefix = 'data:application/haptic+json;base64,';

  if (!url.startsWith(prefix)) {
    throw new Error(
      'Invalid haptic data URL: expected "data:application/haptic+json;base64," prefix',
    );
  }

  const encoded = url.slice(prefix.length);
  const json = atob(encoded);
  return patternFromJSON(json);
}
