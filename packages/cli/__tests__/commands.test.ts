import { describe, it, expect } from 'vitest';
import { preview } from '../src/commands/preview';
import { validate } from '../src/commands/validate';
import { list } from '../src/commands/list';

describe('preview command', () => {
  it('renders valid pattern', () => {
    const result = preview('~~..##');
    expect(result).toContain('Timeline');
    expect(result).toContain('ms');
  });

  it('shows error for invalid pattern', () => {
    const result = preview('~~z##');
    expect(result).toContain('Error');
  });
});

describe('validate command', () => {
  it('validates correct pattern', () => {
    const result = validate('~~..##..@@');
    expect(result).toContain('Valid');
    expect(result).toContain('pulses');
  });

  it('reports invalid pattern', () => {
    const result = validate('[~.');
    expect(result.toLowerCase()).toContain('unclosed');
  });
});

describe('list command', () => {
  it('lists all categories', () => {
    const result = list();
    expect(result).toContain('UI');
    expect(result).toContain('NOTIFICATIONS');
    expect(result).toContain('GAMING');
    expect(result).toContain('ACCESSIBILITY');
    expect(result).toContain('SYSTEM');
  });

  it('lists single category', () => {
    const result = list('gaming');
    expect(result).toContain('GAMING');
    expect(result).toContain('explosion');
  });

  it('handles unknown category', () => {
    const result = list('nonexistent');
    expect(result).toContain('Unknown');
  });
});
