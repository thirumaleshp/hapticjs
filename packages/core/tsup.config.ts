import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/presets/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    splitting: false,
  },
  {
    entry: { 'hapticjs.global': 'src/index.ts' },
    format: ['iife'],
    globalName: 'HapticJS',
    minify: true,
    sourcemap: false,
    treeshake: true,
    splitting: false,
    outExtension: () => ({ js: '.min.js' }),
  },
]);
