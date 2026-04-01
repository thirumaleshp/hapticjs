import type {
  HPLToken,
  HPLNode,
  HPLSequenceNode,
  HPLGroupNode,
  HPLVibrateNode,
  HPLPauseNode,
  HPLTapNode,
  HPLSustainNode,
} from '../types';
import { tokenize } from './tokenizer';

/** Duration constants in milliseconds */
const UNIT_DURATION = 50;
const TAP_DURATION = 10;

/** Intensity levels for vibrate tokens */
const INTENSITY_MAP: Record<string, number> = {
  LIGHT: 0.3,
  MEDIUM: 0.6,
  HEAVY: 1.0,
};

export class HPLParserError extends Error {
  constructor(message: string) {
    super(`HPL Parser Error: ${message}`);
    this.name = 'HPLParserError';
  }
}

/**
 * Recursive descent parser for the Haptic Pattern Language (HPL).
 *
 * Grammar:
 *   Pattern   := Segment+
 *   Segment   := Group | Atom
 *   Group     := '[' Segment+ ']' Repeat?
 *   Atom      := '~' | '#' | '@' | '.' | '|' | '-'
 *   Repeat    := 'x' Number
 */
export class HPLParser {
  private tokens: HPLToken[] = [];
  private pos = 0;

  parse(input: string): HPLSequenceNode {
    this.tokens = tokenize(input);
    this.pos = 0;

    if (this.tokens.length === 0) {
      return { type: 'sequence', children: [] };
    }

    const children = this._parseSegments();

    if (this.pos < this.tokens.length) {
      throw new HPLParserError(
        `Unexpected token '${this.tokens[this.pos]!.value}' at position ${this.pos}`,
      );
    }

    return { type: 'sequence', children };
  }

  private _parseSegments(): HPLNode[] {
    const nodes: HPLNode[] = [];
    while (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos]!;

      if (token.type === 'GROUP_END') {
        break; // Let parent group handle this
      }

      nodes.push(this._parseSegment());
    }
    return nodes;
  }

  private _parseSegment(): HPLNode {
    const token = this.tokens[this.pos]!;

    if (token.type === 'GROUP_START') {
      return this._parseGroup();
    }

    return this._parseAtom();
  }

  private _parseGroup(): HPLGroupNode {
    this.pos++; // consume '['

    const children = this._parseSegments();

    if (this.pos >= this.tokens.length || this.tokens[this.pos]!.type !== 'GROUP_END') {
      throw new HPLParserError('Unclosed group — expected "]"');
    }
    this.pos++; // consume ']'

    // Check for repeat modifier
    let repeat = 1;
    if (this.pos < this.tokens.length && this.tokens[this.pos]!.type === 'REPEAT') {
      repeat = this.tokens[this.pos]!.repeatCount ?? 1;
      this.pos++;
    }

    return { type: 'group', children, repeat };
  }

  private _parseAtom(): HPLNode {
    const token = this.tokens[this.pos]!;
    this.pos++;

    switch (token.type) {
      case 'LIGHT':
      case 'MEDIUM':
      case 'HEAVY':
        return this._makeVibrate(token.type);
      case 'PAUSE':
        return this._makePause();
      case 'TAP':
        return this._makeTap();
      case 'SUSTAIN':
        return this._makeSustain();
      default:
        throw new HPLParserError(`Unexpected token type '${token.type}'`);
    }
  }

  private _makeVibrate(level: string): HPLVibrateNode {
    return {
      type: 'vibrate',
      intensity: INTENSITY_MAP[level] ?? 0.5,
      duration: UNIT_DURATION,
    };
  }

  private _makePause(): HPLPauseNode {
    return { type: 'pause', duration: UNIT_DURATION };
  }

  private _makeTap(): HPLTapNode {
    return { type: 'tap', duration: TAP_DURATION, intensity: 1.0 };
  }

  private _makeSustain(): HPLSustainNode {
    return { type: 'sustain', extension: UNIT_DURATION };
  }
}

/** Convenience function to parse an HPL string */
export function parseHPL(input: string): HPLSequenceNode {
  const parser = new HPLParser();
  return parser.parse(input);
}
