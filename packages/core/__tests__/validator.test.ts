import { describe, it, expect } from 'vitest';
import { validateHPL } from '../src/patterns/validator';

describe('HPL Validator', () => {
  it('validates empty string', () => {
    expect(validateHPL('')).toEqual({ valid: true, errors: [] });
  });

  it('validates simple pattern', () => {
    expect(validateHPL('~~..##')).toEqual({ valid: true, errors: [] });
  });

  it('validates pattern with groups', () => {
    expect(validateHPL('[~.]x3')).toEqual({ valid: true, errors: [] });
  });

  it('detects invalid characters', () => {
    const result = validateHPL('~z#');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Invalid character 'z'");
  });

  it('detects unmatched closing bracket', () => {
    const result = validateHPL('~]#');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Unmatched ']'");
  });

  it('detects unclosed bracket', () => {
    const result = validateHPL('[~.');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('unclosed');
  });

  it('detects empty groups', () => {
    const result = validateHPL('[]');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Empty group');
  });
});
