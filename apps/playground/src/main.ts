import {
  HapticEngine,
  parseHPL,
  compile,
  ui,
  notifications,
  gaming,
  accessibility,
  system,
} from '@hapticjs/core';
import type { HapticStep, HapticPattern } from '@hapticjs/core';

// ─── Engine Setup ────────────────────────────────────────────

const engine = HapticEngine.create();

// ─── Helpers ─────────────────────────────────────────────────

const $ = <T extends HTMLElement>(sel: string): T =>
  document.querySelector(sel) as T;

const $$ = <T extends HTMLElement>(sel: string): T[] =>
  Array.from(document.querySelectorAll(sel)) as T[];

const BLOCK_CHARS = [' ', '\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];

function intensityToBlock(intensity: number): string {
  const idx = Math.round(Math.max(0, Math.min(1, intensity)) * (BLOCK_CHARS.length - 1));
  return BLOCK_CHARS[idx]!;
}

function visualizeSteps(steps: HapticStep[]): { bars: string; stats: string } {
  if (steps.length === 0) {
    return { bars: '', stats: 'Empty pattern' };
  }

  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
  const width = Math.min(50, Math.max(16, Math.floor(totalDuration / 10)));

  // Build intensity timeline
  const timeline: number[] = new Array(width).fill(0);
  let currentMs = 0;

  for (const step of steps) {
    const startCol = Math.floor((currentMs / totalDuration) * width);
    const endCol = Math.floor(((currentMs + step.duration) / totalDuration) * width);

    for (let col = startCol; col < endCol && col < width; col++) {
      if (step.type === 'vibrate') {
        timeline[col] = Math.max(timeline[col]!, step.intensity);
      }
    }
    currentMs += step.duration;
  }

  const bars = timeline.map((v) => intensityToBlock(v)).join('');
  const vibrateSteps = steps.filter((s) => s.type === 'vibrate');
  const stats = `${totalDuration}ms total \u00b7 ${steps.length} steps \u00b7 ${vibrateSteps.length} vibrations`;

  return { bars, stats };
}

function flashButton(btn: HTMLElement): void {
  btn.classList.add('playing');
  setTimeout(() => btn.classList.remove('playing'), 400);
}

// ─── Status Detection ────────────────────────────────────────

function initStatus(): void {
  const dot = $('#statusDot');
  const text = $('#statusText');

  if (engine.isSupported) {
    dot.classList.add('supported');
    text.textContent = `Haptics: Supported \u00b7 ${engine.adapterName}`;
  } else {
    text.textContent = `Haptics: Not Supported \u00b7 ${engine.adapterName}`;
  }
}

// ─── Copy Button ─────────────────────────────────────────────

function initCopy(): void {
  const btn = $('#copyInstall') as HTMLButtonElement;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('npm install @hapticjs/core');
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      engine.tap();
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    } catch {
      // Fallback for insecure contexts
      btn.textContent = 'Copy';
    }
  });
}

// ─── Semantic Effects ────────────────────────────────────────

function initSemanticEffects(): void {
  const grid = $('#semanticGrid');

  grid.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.haptic-btn') as HTMLElement | null;
    if (!btn) return;

    const effect = btn.dataset.effect;
    if (!effect) return;

    flashButton(btn);

    switch (effect) {
      case 'tap': engine.tap(); break;
      case 'doubleTap': engine.doubleTap(); break;
      case 'longPress': engine.longPress(); break;
      case 'success': engine.success(); break;
      case 'warning': engine.warning(); break;
      case 'error': engine.error(); break;
      case 'selection': engine.selection(); break;
      case 'impact-light': engine.impact('light'); break;
      case 'impact-medium': engine.impact('medium'); break;
      case 'impact-heavy': engine.impact('heavy'); break;
    }
  });
}

// ─── HPL Editor ──────────────────────────────────────────────

function initHPLEditor(): void {
  const input = $('#hplInput') as HTMLInputElement;
  const playBtn = $('#playHpl') as HTMLButtonElement;
  const vizBars = $('#vizBars');
  const vizStats = $('#vizStats');

  function updateViz(): void {
    const raw = input.value.trim();
    if (!raw) {
      vizBars.textContent = '';
      vizStats.textContent = '';
      return;
    }

    try {
      const ast = parseHPL(raw);
      const steps = compile(ast);
      const { bars, stats } = visualizeSteps(steps);
      vizBars.textContent = bars;
      vizStats.textContent = stats;
      vizStats.className = 'viz-stats';
    } catch (err) {
      vizBars.textContent = '';
      vizStats.textContent = (err as Error).message;
      vizStats.className = 'viz-error';
    }
  }

  input.addEventListener('input', updateViz);

  playBtn.addEventListener('click', () => {
    const raw = input.value.trim();
    if (!raw) return;

    try {
      engine.play(raw);
      flashButton(playBtn);
    } catch (err) {
      vizBars.textContent = '';
      vizStats.textContent = (err as Error).message;
      vizStats.className = 'viz-error';
    }
  });

  // Enter key plays
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      playBtn.click();
    }
  });

  // Example buttons
  const exampleBtns = $('#exampleBtns');
  exampleBtns.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.example-btn') as HTMLElement | null;
    if (!btn) return;

    const pattern = btn.dataset.pattern;
    if (!pattern) return;

    input.value = pattern;
    updateViz();
    engine.play(pattern);
    flashButton(btn);
  });
}

// ─── Presets Explorer ────────────────────────────────────────

interface PresetCategory {
  [key: string]: HapticPattern;
}

const presetCategories: Record<string, PresetCategory> = {
  ui: ui as unknown as PresetCategory,
  notifications: notifications as unknown as PresetCategory,
  gaming: gaming as unknown as PresetCategory,
  accessibility: accessibility as unknown as PresetCategory,
  system: system as unknown as PresetCategory,
};

function formatPresetName(key: string): string {
  // camelCase to Title Case
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

function renderPresetGrid(category: string): void {
  const grid = $('#presetGrid');
  const presets = presetCategories[category];
  if (!presets) return;

  grid.innerHTML = '';

  for (const key of Object.keys(presets)) {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.dataset.presetKey = key;
    btn.dataset.presetCategory = category;
    btn.textContent = formatPresetName(key);
    grid.appendChild(btn);
  }
}

function initPresets(): void {
  const tabBar = $('#tabBar');
  const presetViz = $('#presetViz');
  const presetVizBars = $('#presetVizBars');
  const presetVizStats = $('#presetVizStats');

  // Tab switching
  tabBar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.tab-btn') as HTMLElement | null;
    if (!btn) return;

    $$('.tab-btn').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.dataset.category!;
    renderPresetGrid(category);
    presetViz.style.display = 'none';
  });

  // Preset play
  document.getElementById('presetGrid')!.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.preset-btn') as HTMLElement | null;
    if (!btn) return;

    const category = btn.dataset.presetCategory!;
    const key = btn.dataset.presetKey!;
    const preset = presetCategories[category]?.[key];
    if (!preset) return;

    flashButton(btn);
    engine.play(preset.steps);

    // Show visualization
    const { bars, stats } = visualizeSteps(preset.steps);
    presetVizBars.textContent = bars;
    presetVizStats.textContent = `${formatPresetName(key)} \u00b7 ${stats}`;
    presetViz.style.display = '';
  });

  // Initial render
  renderPresetGrid('ui');
}

// ─── Composer ────────────────────────────────────────────────

interface ComposerStep {
  id: number;
  type: 'vibrate' | 'pause';
  label: string;
  duration: number;
  intensity: number;
}

let composerSteps: ComposerStep[] = [];
let nextStepId = 0;

function getStepTemplates(name: string): ComposerStep[] {
  const id = nextStepId++;
  switch (name) {
    case 'tap':
      return [{ id, type: 'vibrate', label: 'Tap', duration: 10, intensity: 0.6 }];
    case 'buzz':
      return [{ id, type: 'vibrate', label: 'Buzz', duration: 100, intensity: 0.7 }];
    case 'pause':
      return [{ id, type: 'pause', label: 'Pause', duration: 50, intensity: 0 }];
    case 'ramp':
      return [
        { id: nextStepId++, type: 'vibrate', label: 'Ramp 20%', duration: 40, intensity: 0.2 },
        { id: nextStepId++, type: 'vibrate', label: 'Ramp 50%', duration: 40, intensity: 0.5 },
        { id: nextStepId++, type: 'vibrate', label: 'Ramp 80%', duration: 40, intensity: 0.8 },
        { id: nextStepId++, type: 'vibrate', label: 'Ramp 100%', duration: 40, intensity: 1.0 },
      ];
    case 'pulse':
      return [
        { id: nextStepId++, type: 'vibrate', label: 'Pulse', duration: 30, intensity: 0.8 },
        { id: nextStepId++, type: 'pause', label: 'Gap', duration: 30, intensity: 0 },
        { id: nextStepId++, type: 'vibrate', label: 'Pulse', duration: 30, intensity: 0.8 },
      ];
    default:
      return [];
  }
}

function renderComposerSteps(): void {
  const container = $('#composerSteps');

  if (composerSteps.length === 0) {
    container.innerHTML = '<span class="composer-empty">Add steps above to build a pattern</span>';
    return;
  }

  container.innerHTML = '';
  for (const step of composerSteps) {
    const el = document.createElement('span');
    el.className = `composer-step ${step.type}`;
    el.innerHTML = `${step.label} <span class="step-detail">${step.duration}ms${step.type === 'vibrate' ? ' @' + Math.round(step.intensity * 100) + '%' : ''}</span> <button class="remove-step" data-step-id="${step.id}">\u00d7</button>`;
    container.appendChild(el);
  }
}

function initComposer(): void {
  const controls = $('#composerControls');
  const playBtn = $('#playComposer') as HTMLButtonElement;
  const clearBtn = $('#clearComposer') as HTMLButtonElement;
  const stepsContainer = $('#composerSteps');

  controls.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.composer-add-btn') as HTMLElement | null;
    if (!btn) return;

    const addType = btn.dataset.add;
    if (!addType) return;

    const newSteps = getStepTemplates(addType);
    composerSteps.push(...newSteps);
    renderComposerSteps();
    engine.tap();
  });

  // Remove step
  stepsContainer.addEventListener('click', (e) => {
    const removeBtn = (e.target as HTMLElement).closest('.remove-step') as HTMLElement | null;
    if (!removeBtn) return;

    const stepId = parseInt(removeBtn.dataset.stepId!, 10);
    composerSteps = composerSteps.filter((s) => s.id !== stepId);
    renderComposerSteps();
  });

  playBtn.addEventListener('click', () => {
    if (composerSteps.length === 0) return;

    const hapticSteps: HapticStep[] = composerSteps.map((s) => ({
      type: s.type,
      duration: s.duration,
      intensity: s.intensity,
    }));

    engine.play(hapticSteps);
    flashButton(playBtn);
  });

  clearBtn.addEventListener('click', () => {
    composerSteps = [];
    nextStepId = 0;
    renderComposerSteps();
  });
}

// ─── Init ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initStatus();
  initCopy();
  initSemanticEffects();
  initHPLEditor();
  initPresets();
  initComposer();
});
