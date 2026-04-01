/** Validate an HPL pattern string and return human-readable errors */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_CHARS = new Set('~#@.|\\-[] \t\nx0123456789');

export function validateHPL(input: string): ValidationResult {
  const errors: string[] = [];

  if (input.length === 0) {
    return { valid: true, errors: [] };
  }

  // Check for invalid characters
  for (let i = 0; i < input.length; i++) {
    if (!VALID_CHARS.has(input[i]!)) {
      errors.push(`Invalid character '${input[i]}' at position ${i}`);
    }
  }

  // Check bracket matching
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '[') depth++;
    if (input[i] === ']') depth--;
    if (depth < 0) {
      errors.push(`Unmatched ']' at position ${i}`);
    }
  }
  if (depth > 0) {
    errors.push(`${depth} unclosed '[' bracket(s)`);
  }

  // Check for empty groups
  for (let i = 0; i < input.length - 1; i++) {
    if (input[i] === '[' && input[i + 1] === ']') {
      errors.push(`Empty group at position ${i}`);
    }
  }

  // Check repeat modifiers are after groups or atoms
  for (let i = 0; i < input.length; i++) {
    if (input[i] === 'x' && i + 1 < input.length && /\d/.test(input[i + 1]!)) {
      if (i === 0) {
        errors.push(`Repeat modifier 'x' at position ${i} must follow a group or atom`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
