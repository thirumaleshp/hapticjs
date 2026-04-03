/**
 * @hapticjs/core performance benchmarks
 *
 * Measures parsing, compilation, composition, physics generation,
 * and middleware pipeline processing speed.
 *
 * Run: npx tsx benchmarks/index.ts
 */

import { parseHPL, compile } from '../src/patterns';
import { PatternComposer } from '../src/composer';
import { spring, bounce, friction, impact, gravity, elastic, wave, pendulum } from '../src/physics';
import {
  MiddlewareManager,
  intensityScaler,
  durationScaler,
  intensityClamper,
  patternRepeater,
  reverser,
} from '../src/middleware';

// ─── Helpers ──────────────────────────────────────────────────

interface BenchResult {
  name: string;
  iterations: number;
  totalMs: number;
  avgMs: number;
  opsPerSec: number;
}

function bench(name: string, iterations: number, fn: () => void): BenchResult {
  // Warmup
  for (let i = 0; i < Math.min(100, iterations); i++) {
    fn();
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const totalMs = performance.now() - start;
  const avgMs = totalMs / iterations;
  const opsPerSec = Math.round(1000 / avgMs);

  return { name, iterations, totalMs, avgMs, opsPerSec };
}

function printTable(results: BenchResult[]): void {
  const nameWidth = Math.max(40, ...results.map((r) => r.name.length));
  const sep = '-'.repeat(nameWidth + 52);

  console.log();
  console.log(sep);
  console.log(
    pad('Benchmark', nameWidth) +
      pad('Iterations', 12) +
      pad('Total (ms)', 12) +
      pad('Avg (ms)', 12) +
      pad('Ops/sec', 12),
  );
  console.log(sep);

  for (const r of results) {
    console.log(
      pad(r.name, nameWidth) +
        pad(String(r.iterations), 12) +
        pad(r.totalMs.toFixed(2), 12) +
        pad(r.avgMs.toFixed(4), 12) +
        pad(formatNumber(r.opsPerSec), 12),
    );
  }

  console.log(sep);
  console.log();
}

function pad(str: string, width: number): string {
  return str.padEnd(width);
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

// ─── Test Patterns ──────────────────────────────────────────

const HPL_PATTERNS = [
  '~~..##',
  '@@..~~..##',
  '~~..~~..~~',
  '[~~..##]x3',
  '@@##~~..~~##@@',
  '~~--##--@@',
  '[@@..~~]x2..##',
  '~~..##..@@..~~..##',
  '[~~]x5',
  '##..##..##..@@..@@',
];

// ─── Benchmarks ─────────────────────────────────────────────

const results: BenchResult[] = [];

// 1. HPL Parsing Speed
console.log('Running benchmarks...\n');

results.push(
  bench('HPL parse: simple pattern (~~..##)', 1000, () => {
    parseHPL('~~..##');
  }),
);

results.push(
  bench('HPL parse: complex pattern ([~~..##]x3..@@)', 1000, () => {
    parseHPL('[~~..##]x3..@@##~~--');
  }),
);

results.push(
  bench('HPL parse: 10 diverse patterns x100', 1000, () => {
    for (const pattern of HPL_PATTERNS) {
      parseHPL(pattern);
    }
  }),
);

// 2. Pattern Compilation Speed
const simpleAST = parseHPL('~~..##');
const complexAST = parseHPL('[~~..##..@@]x5..~~--##');

results.push(
  bench('Compile: simple AST', 1000, () => {
    compile(simpleAST);
  }),
);

results.push(
  bench('Compile: complex AST with repeats', 1000, () => {
    compile(complexAST);
  }),
);

// 3. Parse + Compile (full pipeline)
results.push(
  bench('Parse + Compile: 10 patterns', 1000, () => {
    for (const pattern of HPL_PATTERNS) {
      compile(parseHPL(pattern));
    }
  }),
);

// 4. Composer Build Speed
results.push(
  bench('Composer: simple build (tap + pause + vibrate)', 1000, () => {
    new PatternComposer().tap(0.5).pause(50).vibrate(100, 0.8).build();
  }),
);

results.push(
  bench('Composer: complex build (ramp + pulse + repeat)', 1000, () => {
    new PatternComposer()
      .tap(0.5)
      .pause(30)
      .ramp(0.2, 1.0, 200)
      .pause(50)
      .pulse(3, 40, 30)
      .buzz(100, 0.7)
      .repeat(2)
      .build();
  }),
);

// 5. Physics Pattern Generation
results.push(
  bench('Physics: spring()', 1000, () => {
    spring();
  }),
);

results.push(
  bench('Physics: bounce()', 1000, () => {
    bounce();
  }),
);

results.push(
  bench('Physics: all 8 generators', 1000, () => {
    spring();
    bounce();
    friction();
    impact();
    gravity();
    elastic();
    wave();
    pendulum();
  }),
);

results.push(
  bench('Physics: spring with custom options', 1000, () => {
    spring({ stiffness: 0.9, damping: 0.5, duration: 800 });
  }),
);

// 6. Middleware Pipeline Speed
const middlewareManager = new MiddlewareManager();
middlewareManager.use(intensityScaler(0.8));
middlewareManager.use(durationScaler(1.5));
middlewareManager.use(intensityClamper(0.1, 0.9));
middlewareManager.use(reverser());

const sampleSteps = compile(parseHPL('[~~..##..@@]x3'));

results.push(
  bench('Middleware: 4-stage pipeline (small pattern)', 1000, () => {
    middlewareManager.process(sampleSteps);
  }),
);

const largeSteps = compile(parseHPL('[~~..##..@@..~~..##]x5'));

results.push(
  bench('Middleware: 4-stage pipeline (large pattern)', 1000, () => {
    middlewareManager.process(largeSteps);
  }),
);

const heavyManager = new MiddlewareManager();
heavyManager.use(intensityScaler(0.9));
heavyManager.use(durationScaler(1.2));
heavyManager.use(intensityClamper(0.05, 0.95));
heavyManager.use(patternRepeater(2));
heavyManager.use(reverser());
heavyManager.use(intensityScaler(1.1));

results.push(
  bench('Middleware: 6-stage pipeline (large pattern)', 1000, () => {
    heavyManager.process(largeSteps);
  }),
);

// ─── Output ─────────────────────────────────────────────────

printTable(results);

console.log(`Total benchmarks: ${results.length}`);
console.log(`Environment: ${typeof process !== 'undefined' ? `Node ${process.version}` : 'Unknown'}`);
console.log();
