import { describe, it, expect } from 'vitest';
import { parseHPL } from '../src/patterns/parser';
import { compile } from '../src/patterns/compiler';
import { tokenize } from '../src/patterns/tokenizer';

describe('HPL Tokenizer', () => {
  it('tokenizes simple pattern', () => {
    const tokens = tokenize('~.#');
    expect(tokens).toEqual([
      { type: 'LIGHT', value: '~' },
      { type: 'PAUSE', value: '.' },
      { type: 'MEDIUM', value: '#' },
    ]);
  });

  it('tokenizes repeat modifier', () => {
    const tokens = tokenize('[~.]x3');
    expect(tokens).toHaveLength(5);
    expect(tokens[4]).toEqual({
      type: 'REPEAT',
      value: 'x3',
      repeatCount: 3,
    });
  });

  it('skips whitespace', () => {
    const tokens = tokenize('~ . #');
    expect(tokens).toHaveLength(3);
  });

  it('throws on invalid character', () => {
    expect(() => tokenize('~z#')).toThrow('Unexpected character');
  });
});

describe('HPL Parser', () => {
  it('parses empty string', () => {
    const ast = parseHPL('');
    expect(ast.type).toBe('sequence');
    expect(ast.children).toHaveLength(0);
  });

  it('parses single light vibrate', () => {
    const ast = parseHPL('~');
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0]).toEqual({
      type: 'vibrate',
      intensity: 0.3,
      duration: 50,
    });
  });

  it('parses medium and heavy vibrates', () => {
    const ast = parseHPL('#@');
    expect(ast.children[0]).toMatchObject({ type: 'vibrate', intensity: 0.6 });
    expect(ast.children[1]).toMatchObject({ type: 'vibrate', intensity: 1.0 });
  });

  it('parses pause', () => {
    const ast = parseHPL('..');
    expect(ast.children).toHaveLength(2);
    expect(ast.children[0]).toMatchObject({ type: 'pause', duration: 50 });
  });

  it('parses tap', () => {
    const ast = parseHPL('|');
    expect(ast.children[0]).toMatchObject({
      type: 'tap',
      duration: 10,
      intensity: 1.0,
    });
  });

  it('parses sustain', () => {
    const ast = parseHPL('-');
    expect(ast.children[0]).toMatchObject({
      type: 'sustain',
      extension: 50,
    });
  });

  it('parses groups', () => {
    const ast = parseHPL('[~.]');
    expect(ast.children).toHaveLength(1);
    const group = ast.children[0]!;
    expect(group.type).toBe('group');
    if (group.type === 'group') {
      expect(group.children).toHaveLength(2);
      expect(group.repeat).toBe(1);
    }
  });

  it('parses groups with repeat', () => {
    const ast = parseHPL('[~.]x3');
    const group = ast.children[0]!;
    if (group.type === 'group') {
      expect(group.repeat).toBe(3);
    }
  });

  it('throws on unclosed group', () => {
    expect(() => parseHPL('[~.')).toThrow('Unclosed group');
  });

  it('parses complex pattern', () => {
    const ast = parseHPL('~~..##..@@');
    expect(ast.children).toHaveLength(10);
  });
});

describe('HPL Compiler', () => {
  it('compiles simple vibrate', () => {
    const ast = parseHPL('~');
    const steps = compile(ast);
    expect(steps).toEqual([
      { type: 'vibrate', duration: 50, intensity: 0.3 },
    ]);
  });

  it('compiles pattern with pause', () => {
    const ast = parseHPL('~.#');
    const steps = compile(ast);
    expect(steps).toHaveLength(3);
    expect(steps[1]).toMatchObject({ type: 'pause', duration: 50 });
  });

  it('compiles tap as vibrate step', () => {
    const ast = parseHPL('|');
    const steps = compile(ast);
    expect(steps).toEqual([
      { type: 'vibrate', duration: 10, intensity: 1.0 },
    ]);
  });

  it('compiles sustain by extending previous step', () => {
    const ast = parseHPL('@--');
    const steps = compile(ast);
    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      type: 'vibrate',
      duration: 150, // 50 + 50 + 50
      intensity: 1.0,
    });
  });

  it('compiles group with repeat', () => {
    const ast = parseHPL('[|.]x3');
    const steps = compile(ast);
    // |. repeated 3 times = 6 steps
    expect(steps).toHaveLength(6);
  });

  it('compiles full escalating pattern', () => {
    const ast = parseHPL('~~..##..@@');
    const steps = compile(ast);
    const vibrations = steps.filter((s) => s.type === 'vibrate');
    // 2 light, 2 medium, 2 heavy
    expect(vibrations).toHaveLength(6);
    expect(vibrations[0]!.intensity).toBe(0.3);
    expect(vibrations[2]!.intensity).toBe(0.6);
    expect(vibrations[4]!.intensity).toBe(1.0);
  });
});
