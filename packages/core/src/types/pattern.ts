/** HPL Token types */
export type HPLTokenType =
  | 'LIGHT'      // ~
  | 'MEDIUM'     // #
  | 'HEAVY'      // @
  | 'PAUSE'      // .
  | 'TAP'        // |
  | 'SUSTAIN'    // -
  | 'GROUP_START' // [
  | 'GROUP_END'   // ]
  | 'REPEAT';     // xN

/** A single HPL token */
export interface HPLToken {
  type: HPLTokenType;
  value: string;
  /** For REPEAT tokens, the repeat count */
  repeatCount?: number;
}

/** AST node types */
export type HPLNodeType = 'vibrate' | 'pause' | 'tap' | 'sustain' | 'group' | 'sequence';

/** Base AST node */
export interface HPLBaseNode {
  type: HPLNodeType;
}

/** Vibrate node — ~, #, or @ */
export interface HPLVibrateNode extends HPLBaseNode {
  type: 'vibrate';
  intensity: number; // 0.3, 0.6, or 1.0
  duration: number;  // default 50ms
}

/** Pause node — . */
export interface HPLPauseNode extends HPLBaseNode {
  type: 'pause';
  duration: number; // 50ms per dot
}

/** Tap node — | */
export interface HPLTapNode extends HPLBaseNode {
  type: 'tap';
  duration: number;  // 10ms
  intensity: number; // 1.0
}

/** Sustain node — - */
export interface HPLSustainNode extends HPLBaseNode {
  type: 'sustain';
  extension: number; // 50ms per dash
}

/** Group node — [...] with optional repeat */
export interface HPLGroupNode extends HPLBaseNode {
  type: 'group';
  children: HPLNode[];
  repeat: number; // default 1
}

/** Sequence node — the root */
export interface HPLSequenceNode extends HPLBaseNode {
  type: 'sequence';
  children: HPLNode[];
}

/** Any HPL AST node */
export type HPLNode =
  | HPLVibrateNode
  | HPLPauseNode
  | HPLTapNode
  | HPLSustainNode
  | HPLGroupNode
  | HPLSequenceNode;
