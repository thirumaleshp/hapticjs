import type { HPLToken, HPLTokenType } from '../types';

const TOKEN_MAP: Record<string, HPLTokenType> = {
  '~': 'LIGHT',
  '#': 'MEDIUM',
  '@': 'HEAVY',
  '.': 'PAUSE',
  '|': 'TAP',
  '-': 'SUSTAIN',
  '[': 'GROUP_START',
  ']': 'GROUP_END',
};

export class HPLTokenizerError extends Error {
  constructor(
    message: string,
    public readonly position: number,
  ) {
    super(`HPL Tokenizer Error at position ${position}: ${message}`);
    this.name = 'HPLTokenizerError';
  }
}

/** Tokenize an HPL pattern string into tokens */
export function tokenize(input: string): HPLToken[] {
  const tokens: HPLToken[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i]!;

    // Skip whitespace
    if (char === ' ' || char === '\t' || char === '\n') {
      i++;
      continue;
    }

    // Check for repeat modifier: xN
    if (char === 'x' && i + 1 < input.length) {
      let numStr = '';
      let j = i + 1;
      while (j < input.length && input[j]! >= '0' && input[j]! <= '9') {
        numStr += input[j];
        j++;
      }
      if (numStr.length > 0) {
        tokens.push({
          type: 'REPEAT',
          value: `x${numStr}`,
          repeatCount: parseInt(numStr, 10),
        });
        i = j;
        continue;
      }
    }

    // Check known tokens
    const tokenType = TOKEN_MAP[char];
    if (tokenType) {
      tokens.push({ type: tokenType, value: char });
      i++;
      continue;
    }

    throw new HPLTokenizerError(`Unexpected character '${char}'`, i);
  }

  return tokens;
}
