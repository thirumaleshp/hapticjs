import {
  HapticEngine,
  parseHPL,
  compile,
  ui,
  notifications,
  gaming,
  accessibility,
  system,
  emotions,
  PatternRecorder,
  ThemeManager,
  SoundEngine,
  VisualEngine,
  MiddlewareManager,
  intensityScaler,
  durationScaler,
  ProfileManager,
  profiles,
  RhythmSync,
  patternToJSON,
  patternFromJSON,
  patternToDataURL,
  patternFromDataURL,
  spring,
  bounce,
  friction,
  impact as physicsImpact,
  gravity,
  elastic,
  wave,
  pendulum,
} from '@hapticjs/core';
import type { HapticStep, HapticPattern } from '@hapticjs/core';

// ─── Global Instances ───────────────────────────────────────

const engine = HapticEngine.create();
const themeManager = new ThemeManager();
const soundEngine = new SoundEngine({ volume: 0.5 });
const profileManager = new ProfileManager();
const rhythmSync = new RhythmSync({ bpm: 120 });

// ─── Helpers ────────────────────────────────────────────────

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
  if (steps.length === 0) return { bars: '', stats: 'Empty pattern' };

  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
  const width = Math.min(50, Math.max(12, Math.floor(totalDuration / 10)));
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
  const stats = `${totalDuration}ms \u00b7 ${steps.length} steps \u00b7 ${vibrateSteps.length} vibrations`;
  return { bars, stats };
}

function flashButton(btn: HTMLElement): void {
  btn.classList.add('playing');
  setTimeout(() => btn.classList.remove('playing'), 400);
}

function formatName(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

function show(el: HTMLElement): void { el.classList.remove('hidden'); }
function hide(el: HTMLElement): void { el.classList.add('hidden'); }

// ─── Tab Navigation ─────────────────────────────────────────

function initTabs(): void {
  const nav = $('#navTabs');
  nav.addEventListener('click', (e) => {
    const tab = (e.target as HTMLElement).closest('.nav-tab') as HTMLElement | null;
    if (!tab) return;
    const target = tab.dataset.tab;
    if (!target) return;

    $$('.nav-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    $$('.section').forEach((s) => s.classList.remove('active'));
    $(`#section-${target}`).classList.add('active');
  });
}

// ─── Status & Copy ──────────────────────────────────────────

function initStatus(): void {
  const dot = $('#statusDot');
  const text = $('#statusText');
  if (engine.isSupported) {
    dot.classList.add('supported');
    text.textContent = `Haptics: ${engine.adapterName}`;
  } else {
    text.textContent = `No Haptics: ${engine.adapterName}`;
  }
}

function initCopy(): void {
  const btn = $('#copyInstall') as HTMLButtonElement;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('npm install @hapticjs/core');
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      engine.tap();
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    } catch { /* noop */ }
  });
}

// ─── 1. Semantic Effects ────────────────────────────────────

function initSemanticEffects(): void {
  const grid = $('#semanticGrid');
  const effects: Array<{ id: string; label: string; sub: string }> = [
    { id: 'tap', label: 'tap()', sub: 'Light touch' },
    { id: 'doubleTap', label: 'doubleTap()', sub: 'Double pulse' },
    { id: 'longPress', label: 'longPress()', sub: 'Firm hold' },
    { id: 'success', label: 'success()', sub: 'Ascending' },
    { id: 'warning', label: 'warning()', sub: 'Triple pulse' },
    { id: 'error', label: 'error()', sub: 'Heavy double' },
    { id: 'selection', label: 'selection()', sub: 'Subtle tick' },
    { id: 'impact-light', label: "impact('light')", sub: 'Soft' },
    { id: 'impact-medium', label: "impact('medium')", sub: 'Medium' },
    { id: 'impact-heavy', label: "impact('heavy')", sub: 'Strong' },
  ];

  grid.innerHTML = effects.map((e) =>
    `<button class="haptic-btn" data-effect="${e.id}">${e.label}<span class="btn-label">${e.sub}</span></button>`
  ).join('');

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

// ─── 2. HPL Editor ──────────────────────────────────────────

function initHPLEditor(): void {
  const input = $('#hplInput') as HTMLInputElement;
  const playBtn = $('#playHpl') as HTMLButtonElement;
  const vizBars = $('#vizBars');
  const vizStats = $('#vizStats');

  const examples = [
    { name: 'Heartbeat', pattern: '##..@@..##..@@' },
    { name: 'SOS', pattern: '[@@@@@@....]x3...[@@@@@@....]x3...[@@@@@@....]x3' },
    { name: 'Drum Roll', pattern: '[|.]x12' },
    { name: 'Alarm', pattern: '[@@..@@..]x4' },
    { name: 'Gentle Wave', pattern: '~.~.#.#.~.~.' },
  ];

  const exBtns = $('#exampleBtns');
  exBtns.innerHTML = examples.map((ex) =>
    `<button class="example-btn" data-pattern="${ex.pattern}">${ex.name}</button>`
  ).join('');

  const syntaxItems = [
    { ch: '~', desc: 'Light vibration<br/>50ms @ 30%' },
    { ch: '#', desc: 'Medium vibration<br/>50ms @ 60%' },
    { ch: '@', desc: 'Heavy vibration<br/>50ms @ 100%' },
    { ch: '.', desc: 'Pause<br/>50ms silence' },
    { ch: '|', desc: 'Sharp tap<br/>10ms @ 100%' },
    { ch: '-', desc: 'Sustain<br/>Extend previous 50ms' },
    { ch: '[\u2009]', desc: 'Group<br/>Wrap a sequence' },
    { ch: 'xN', desc: 'Repeat<br/>Repeat group N times' },
  ];
  $('#syntaxRef').innerHTML = syntaxItems.map((s) =>
    `<div class="syntax-item"><span class="syntax-char">${s.ch}</span><span class="syntax-desc">${s.desc}</span></div>`
  ).join('');

  function updateViz(): void {
    const raw = input.value.trim();
    if (!raw) { vizBars.textContent = ''; vizStats.textContent = ''; return; }
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
    try { engine.play(raw); flashButton(playBtn); }
    catch (err) { vizBars.textContent = ''; vizStats.textContent = (err as Error).message; vizStats.className = 'viz-error'; }
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') playBtn.click(); });

  exBtns.addEventListener('click', (e) => {
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

// ─── 3. Presets Explorer ────────────────────────────────────

interface PresetCategory { [key: string]: HapticPattern; }

const presetCategories: Record<string, PresetCategory> = {
  ui: ui as unknown as PresetCategory,
  notifications: notifications as unknown as PresetCategory,
  gaming: gaming as unknown as PresetCategory,
  accessibility: accessibility as unknown as PresetCategory,
  system: system as unknown as PresetCategory,
};

function initPresets(): void {
  const tabBar = $('#presetTabs');
  const grid = $('#presetGrid');
  const viz = $('#presetViz');
  const vizBars = $('#presetVizBars');
  const vizStats = $('#presetVizStats');

  const categories = Object.keys(presetCategories);
  tabBar.innerHTML = categories.map((c, i) =>
    `<button class="sub-tab${i === 0 ? ' active' : ''}" data-category="${c}">${formatName(c)}</button>`
  ).join('');

  function renderGrid(cat: string): void {
    const presets = presetCategories[cat];
    if (!presets) return;
    grid.innerHTML = Object.keys(presets).map((key) =>
      `<button class="preset-btn" data-cat="${cat}" data-key="${key}">${formatName(key)}</button>`
    ).join('');
    hide(viz);
  }

  tabBar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.sub-tab') as HTMLElement | null;
    if (!btn) return;
    tabBar.querySelectorAll('.sub-tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    renderGrid(btn.dataset.category!);
  });

  grid.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.preset-btn') as HTMLElement | null;
    if (!btn) return;
    const cat = btn.dataset.cat!;
    const key = btn.dataset.key!;
    const preset = presetCategories[cat]?.[key];
    if (!preset) return;
    flashButton(btn);
    engine.play(preset.steps);
    const { bars, stats } = visualizeSteps(preset.steps);
    vizBars.textContent = bars;
    vizStats.textContent = `${formatName(key)} \u00b7 ${stats}`;
    show(viz);
  });

  renderGrid('ui');
}

// ─── 4. Composer ────────────────────────────────────────────

interface CStep { id: number; type: 'vibrate' | 'pause'; label: string; duration: number; intensity: number; }
let composerSteps: CStep[] = [];
let nextStepId = 0;

function initComposer(): void {
  const controls = $('#composerControls');
  const stepsEl = $('#composerSteps');
  const playBtn = $('#playComposer') as HTMLButtonElement;
  const clearBtn = $('#clearComposer') as HTMLButtonElement;

  const addButtons = [
    { name: 'tap', label: '+ Tap' },
    { name: 'buzz', label: '+ Buzz' },
    { name: 'pause', label: '+ Pause' },
    { name: 'ramp', label: '+ Ramp' },
    { name: 'pulse', label: '+ Pulse' },
  ];
  controls.innerHTML = addButtons.map((b) =>
    `<button class="action-btn secondary" data-add="${b.name}">${b.label}</button>`
  ).join('');

  function getTemplates(name: string): CStep[] {
    const id = nextStepId++;
    switch (name) {
      case 'tap': return [{ id, type: 'vibrate', label: 'Tap', duration: 10, intensity: 0.6 }];
      case 'buzz': return [{ id, type: 'vibrate', label: 'Buzz', duration: 100, intensity: 0.7 }];
      case 'pause': return [{ id, type: 'pause', label: 'Pause', duration: 50, intensity: 0 }];
      case 'ramp': return [
        { id: nextStepId++, type: 'vibrate', label: 'Ramp 20%', duration: 40, intensity: 0.2 },
        { id: nextStepId++, type: 'vibrate', label: 'Ramp 50%', duration: 40, intensity: 0.5 },
        { id: nextStepId++, type: 'vibrate', label: 'Ramp 80%', duration: 40, intensity: 0.8 },
        { id: nextStepId++, type: 'vibrate', label: 'Ramp 100%', duration: 40, intensity: 1.0 },
      ];
      case 'pulse': return [
        { id: nextStepId++, type: 'vibrate', label: 'Pulse', duration: 30, intensity: 0.8 },
        { id: nextStepId++, type: 'pause', label: 'Gap', duration: 30, intensity: 0 },
        { id: nextStepId++, type: 'vibrate', label: 'Pulse', duration: 30, intensity: 0.8 },
      ];
      default: return [];
    }
  }

  function render(): void {
    if (composerSteps.length === 0) {
      stepsEl.innerHTML = '<span class="composer-empty">Add steps above to build a pattern</span>';
      return;
    }
    stepsEl.innerHTML = composerSteps.map((s) =>
      `<span class="composer-step ${s.type}">${s.label} <span style="opacity:0.6">${s.duration}ms${s.type === 'vibrate' ? ' @' + Math.round(s.intensity * 100) + '%' : ''}</span> <button class="remove-step" data-step-id="${s.id}">\u00d7</button></span>`
    ).join('');
  }

  controls.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-add]') as HTMLElement | null;
    if (!btn) return;
    composerSteps.push(...getTemplates(btn.dataset.add!));
    render();
    engine.tap();
  });

  stepsEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.remove-step') as HTMLElement | null;
    if (!btn) return;
    composerSteps = composerSteps.filter((s) => s.id !== parseInt(btn.dataset.stepId!, 10));
    render();
  });

  playBtn.addEventListener('click', () => {
    if (composerSteps.length === 0) return;
    engine.play(composerSteps.map((s) => ({ type: s.type, duration: s.duration, intensity: s.intensity })));
    flashButton(playBtn);
  });

  clearBtn.addEventListener('click', () => { composerSteps = []; nextStepId = 0; render(); });
}

// ─── 5. Theme Switcher ──────────────────────────────────────

function initThemes(): void {
  const select = $('#themeSelect') as HTMLSelectElement;
  const info = $('#themeInfo');

  const themeNames = themeManager.listThemes();
  select.innerHTML = themeNames.map((n) =>
    `<option value="${n}"${n === 'default' ? ' selected' : ''}>${n.charAt(0).toUpperCase() + n.slice(1)}</option>`
  ).join('');

  function renderInfo(): void {
    const t = themeManager.getTheme();
    info.innerHTML = `
      <div class="theme-card">
        <h4>${t.name} Theme</h4>
        <div class="theme-props">
          <div class="theme-prop"><span class="label">Haptic Intensity</span><span class="value">${t.hapticIntensity}</span></div>
          <div class="theme-prop"><span class="label">Sound</span><span class="value">${t.soundEnabled ? 'On (' + t.soundVolume + ')' : 'Off'}</span></div>
          <div class="theme-prop"><span class="label">Visual</span><span class="value">${t.visualEnabled ? t.visualStyle : 'Off'}</span></div>
          <div class="theme-prop"><span class="label">Primary</span><span class="color-dot" style="background:${t.colors.primary}"></span></div>
          <div class="theme-prop"><span class="label">Success</span><span class="color-dot" style="background:${t.colors.success}"></span></div>
          <div class="theme-prop"><span class="label">Error</span><span class="color-dot" style="background:${t.colors.error}"></span></div>
          <div class="theme-prop"><span class="label">Warning</span><span class="color-dot" style="background:${t.colors.warning}"></span></div>
        </div>
      </div>`;
  }

  select.addEventListener('change', () => {
    themeManager.setTheme(select.value);
    renderInfo();
  });

  $('#themeTestTap').addEventListener('click', () => { engine.tap(); });
  $('#themeTestSuccess').addEventListener('click', () => { engine.success(); });
  $('#themeTestError').addEventListener('click', () => { engine.error(); });

  renderInfo();
}

// ─── 6. Pattern Recorder ────────────────────────────────────

function initRecorder(): void {
  const recorder = new PatternRecorder();
  const startStopBtn = $('#recStartStop') as HTMLButtonElement;
  const replayBtn = $('#recReplay') as HTMLButtonElement;
  const clearBtn = $('#recClear') as HTMLButtonElement;
  const tapArea = $('#tapArea');
  const tapLabel = $('#tapLabel');
  const tapDots = $('#tapDots');
  const hplInput = $('#recHpl') as HTMLInputElement;
  const vizBars = $('#recVizBars');
  const vizStats = $('#recVizStats');

  let lastHpl = '';

  recorder.onTap(() => {
    const dot = document.createElement('div');
    dot.className = 'tap-dot';
    tapDots.appendChild(dot);
    engine.tap();
  });

  function updateOutput(): void {
    const hpl = recorder.toHPL();
    lastHpl = hpl;
    hplInput.value = hpl;
    if (hpl) {
      try {
        const ast = parseHPL(hpl);
        const steps = compile(ast);
        const { bars, stats } = visualizeSteps(steps);
        vizBars.textContent = bars;
        vizStats.textContent = `Recorded \u00b7 ${recorder.tapCount} taps \u00b7 ${stats}`;
      } catch {
        vizBars.textContent = '';
        vizStats.textContent = `${recorder.tapCount} taps recorded`;
      }
    } else {
      vizBars.textContent = '';
      vizStats.textContent = 'No taps recorded';
    }
    replayBtn.disabled = !hpl;
  }

  startStopBtn.addEventListener('click', () => {
    if (recorder.isRecording) {
      recorder.stop();
      recorder.quantize(50);
      tapArea.classList.remove('recording');
      startStopBtn.textContent = 'Start Recording';
      tapLabel.textContent = 'Recording stopped';
      updateOutput();
    } else {
      recorder.clear();
      tapDots.innerHTML = '';
      recorder.start();
      tapArea.classList.add('recording');
      startStopBtn.textContent = 'Stop Recording';
      tapLabel.textContent = 'Tap here!';
      hplInput.value = '';
      vizBars.textContent = '';
      vizStats.textContent = 'Recording...';
      replayBtn.disabled = true;
    }
  });

  tapArea.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (recorder.isRecording) {
      recorder.tap(0.6);
    }
  });

  replayBtn.addEventListener('click', () => {
    if (lastHpl) {
      try { engine.play(lastHpl); flashButton(replayBtn); } catch { /* noop */ }
    }
  });

  clearBtn.addEventListener('click', () => {
    recorder.clear();
    tapArea.classList.remove('recording');
    startStopBtn.textContent = 'Start Recording';
    tapLabel.textContent = 'Press Start, then tap here';
    tapDots.innerHTML = '';
    hplInput.value = '';
    vizBars.textContent = '';
    vizStats.textContent = 'No recording yet';
    replayBtn.disabled = true;
    lastHpl = '';
  });
}

// ─── 7. Physics Patterns ────────────────────────────────────

function initPhysics(): void {
  const tabs = $('#physicsTabs');
  const paramsEl = $('#physicsParams');
  const playBtn = $('#playPhysics') as HTMLButtonElement;
  const vizBars = $('#physicsVizBars');
  const vizStats = $('#physicsVizStats');

  interface PhysicsDef {
    name: string;
    params: Array<{ key: string; label: string; min: number; max: number; step: number; default: number }>;
    fn: (params: Record<string, number>) => HapticPattern;
  }

  const physicsDefs: PhysicsDef[] = [
    {
      name: 'Spring',
      params: [
        { key: 'stiffness', label: 'Stiffness', min: 0.5, max: 1, step: 0.05, default: 0.7 },
        { key: 'damping', label: 'Damping', min: 0.1, max: 0.9, step: 0.05, default: 0.3 },
        { key: 'duration', label: 'Duration (ms)', min: 200, max: 1000, step: 50, default: 500 },
      ],
      fn: (p) => spring({ stiffness: p.stiffness, damping: p.damping, duration: p.duration }),
    },
    {
      name: 'Bounce',
      params: [
        { key: 'height', label: 'Height', min: 0.5, max: 1, step: 0.05, default: 1.0 },
        { key: 'bounciness', label: 'Bounciness', min: 0.3, max: 0.9, step: 0.05, default: 0.6 },
        { key: 'bounces', label: 'Bounces', min: 2, max: 10, step: 1, default: 5 },
      ],
      fn: (p) => bounce({ height: p.height, bounciness: p.bounciness, bounces: p.bounces }),
    },
    {
      name: 'Friction',
      params: [
        { key: 'roughness', label: 'Roughness', min: 0.1, max: 1, step: 0.05, default: 0.5 },
        { key: 'speed', label: 'Speed', min: 0.1, max: 1, step: 0.05, default: 0.5 },
        { key: 'duration', label: 'Duration (ms)', min: 100, max: 600, step: 50, default: 300 },
      ],
      fn: (p) => friction({ roughness: p.roughness, speed: p.speed, duration: p.duration }),
    },
    {
      name: 'Impact',
      params: [
        { key: 'mass', label: 'Mass', min: 0.1, max: 1, step: 0.05, default: 0.5 },
        { key: 'hardness', label: 'Hardness', min: 0.1, max: 1, step: 0.05, default: 0.7 },
      ],
      fn: (p) => physicsImpact({ mass: p.mass, hardness: p.hardness }),
    },
    {
      name: 'Gravity',
      params: [
        { key: 'distance', label: 'Distance', min: 0.3, max: 1, step: 0.05, default: 1.0 },
        { key: 'duration', label: 'Duration (ms)', min: 200, max: 800, step: 50, default: 400 },
      ],
      fn: (p) => gravity({ distance: p.distance, duration: p.duration }),
    },
    {
      name: 'Elastic',
      params: [
        { key: 'stretch', label: 'Stretch', min: 0.3, max: 1, step: 0.05, default: 0.7 },
        { key: 'snapSpeed', label: 'Snap Speed', min: 0.3, max: 1, step: 0.05, default: 0.8 },
      ],
      fn: (p) => elastic({ stretch: p.stretch, snapSpeed: p.snapSpeed }),
    },
    {
      name: 'Wave',
      params: [
        { key: 'amplitude', label: 'Amplitude', min: 0.3, max: 1, step: 0.05, default: 0.7 },
        { key: 'frequency', label: 'Frequency', min: 0.5, max: 2, step: 0.1, default: 1.0 },
        { key: 'cycles', label: 'Cycles', min: 1, max: 5, step: 1, default: 2 },
      ],
      fn: (p) => wave({ amplitude: p.amplitude, frequency: p.frequency, cycles: p.cycles }),
    },
    {
      name: 'Pendulum',
      params: [
        { key: 'energy', label: 'Energy', min: 0.3, max: 1, step: 0.05, default: 0.8 },
        { key: 'swings', label: 'Swings', min: 1, max: 6, step: 1, default: 3 },
      ],
      fn: (p) => pendulum({ energy: p.energy, swings: p.swings }),
    },
  ];

  let activePhysics = 0;
  const paramValues: Record<string, number>[] = physicsDefs.map((d) => {
    const obj: Record<string, number> = {};
    d.params.forEach((p) => { obj[p.key] = p.default; });
    return obj;
  });

  tabs.innerHTML = physicsDefs.map((d, i) =>
    `<button class="sub-tab${i === 0 ? ' active' : ''}" data-idx="${i}">${d.name}</button>`
  ).join('');

  function renderParams(): void {
    const def = physicsDefs[activePhysics]!;
    const vals = paramValues[activePhysics]!;
    paramsEl.innerHTML = def.params.map((p) =>
      `<div class="slider-row">
        <span class="slider-label">${p.label}</span>
        <input type="range" data-key="${p.key}" min="${p.min}" max="${p.max}" step="${p.step}" value="${vals[p.key]}" />
        <span class="slider-value" data-valkey="${p.key}">${vals[p.key]}</span>
      </div>`
    ).join('');
    updatePhysicsViz();
  }

  function updatePhysicsViz(): void {
    const def = physicsDefs[activePhysics]!;
    const vals = paramValues[activePhysics]!;
    const pattern = def.fn(vals);
    const { bars, stats } = visualizeSteps(pattern.steps);
    vizBars.textContent = bars;
    vizStats.textContent = `${def.name} \u00b7 ${stats}`;
  }

  tabs.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.sub-tab') as HTMLElement | null;
    if (!btn) return;
    tabs.querySelectorAll('.sub-tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    activePhysics = parseInt(btn.dataset.idx!, 10);
    renderParams();
  });

  paramsEl.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    const key = input.dataset.key;
    if (!key) return;
    const val = parseFloat(input.value);
    paramValues[activePhysics]![key] = val;
    const valDisplay = paramsEl.querySelector(`[data-valkey="${key}"]`) as HTMLElement;
    if (valDisplay) valDisplay.textContent = String(val);
    updatePhysicsViz();
  });

  playBtn.addEventListener('click', () => {
    const def = physicsDefs[activePhysics]!;
    const pattern = def.fn(paramValues[activePhysics]!);
    engine.play(pattern.steps);
    flashButton(playBtn);
  });

  renderParams();
}

// ─── 8. Rhythm Sync ─────────────────────────────────────────

function initRhythm(): void {
  const bpmDisplay = $('#bpmDisplay');
  const bpmSlider = $('#bpmSlider') as HTMLInputElement;
  const bpmValue = $('#bpmValue');
  const tapBtn = $('#tapTempo') as HTMLButtonElement;
  const startStopBtn = $('#rhythmStartStop') as HTMLButtonElement;
  const beatDots = $$('#beatDots .beat-dot');

  function updateBpmUI(bpm: number): void {
    bpmDisplay.textContent = String(bpm);
    bpmSlider.value = String(bpm);
    bpmValue.textContent = String(bpm);
  }

  bpmSlider.addEventListener('input', () => {
    const bpm = parseInt(bpmSlider.value, 10);
    rhythmSync.setBPM(bpm);
    updateBpmUI(bpm);
  });

  tapBtn.addEventListener('click', () => {
    const bpm = rhythmSync.tapTempo();
    updateBpmUI(bpm);
    engine.tap();
    flashButton(tapBtn);
  });

  rhythmSync.onBeat((beat) => {
    const idx = (beat - 1) % 4;
    beatDots.forEach((d, i) => {
      if (i === idx) { d.classList.add('on'); }
      else { d.classList.remove('on'); }
    });
    engine.tap();
  });

  startStopBtn.addEventListener('click', () => {
    if (rhythmSync.isPlaying) {
      rhythmSync.stop();
      startStopBtn.textContent = 'Start';
      beatDots.forEach((d) => d.classList.remove('on'));
    } else {
      rhythmSync.start();
      startStopBtn.textContent = 'Stop';
    }
  });
}

// ─── 9. Sound Engine ────────────────────────────────────────

function initSound(): void {
  const volumeSlider = $('#soundVolume') as HTMLInputElement;
  const volumeVal = $('#soundVolumeVal');
  const grid = $('#soundGrid');

  const sounds: Array<{ id: string; label: string; sub: string }> = [
    { id: 'click', label: 'Click', sub: 'Short click' },
    { id: 'tick', label: 'Tick', sub: 'Ultra-short' },
    { id: 'pop', label: 'Pop', sub: 'Bubbly sweep' },
    { id: 'whoosh', label: 'Whoosh', sub: 'Swipe/swoosh' },
    { id: 'chime', label: 'Chime', sub: 'Musical tone' },
    { id: 'error', label: 'Error', sub: 'Descending buzz' },
    { id: 'success', label: 'Success', sub: 'Ascending tone' },
    { id: 'tap', label: 'Tap', sub: 'Subtle tap' },
  ];

  grid.innerHTML = sounds.map((s) =>
    `<button class="haptic-btn" data-sound="${s.id}">${s.label}<span class="btn-label">${s.sub}</span></button>`
  ).join('');

  volumeSlider.addEventListener('input', () => {
    const vol = parseInt(volumeSlider.value, 10);
    volumeVal.textContent = vol + '%';
    soundEngine.setVolume(vol / 100);
  });

  grid.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest('.haptic-btn') as HTMLElement | null;
    if (!btn) return;
    const sound = btn.dataset.sound;
    if (!sound) return;
    flashButton(btn);
    switch (sound) {
      case 'click': await soundEngine.click(); break;
      case 'tick': await soundEngine.tick(); break;
      case 'pop': await soundEngine.pop(); break;
      case 'whoosh': await soundEngine.whoosh(); break;
      case 'chime': await soundEngine.chime(); break;
      case 'error': await soundEngine.error(); break;
      case 'success': await soundEngine.success(); break;
      case 'tap': await soundEngine.tap(); break;
    }
  });
}

// ─── 10. Visual Effects ─────────────────────────────────────

function initVisual(): void {
  const target = $('#visualTarget');
  const grid = $('#visualGrid');
  const visualEngine = new VisualEngine({ target });

  const effects: Array<{ id: string; label: string; sub: string }> = [
    { id: 'flash', label: 'Flash', sub: 'Screen flash' },
    { id: 'shake', label: 'Shake', sub: 'CSS shake' },
    { id: 'pulse', label: 'Pulse', sub: 'Scale pulse' },
    { id: 'ripple', label: 'Ripple', sub: 'Material ripple' },
    { id: 'glow', label: 'Glow', sub: 'Box shadow' },
    { id: 'bounce', label: 'Bounce', sub: 'Bounce up' },
    { id: 'jello', label: 'Jello', sub: 'Wobble/skew' },
    { id: 'rubber', label: 'Rubber', sub: 'Rubber band' },
    { id: 'highlight', label: 'Highlight', sub: 'BG color' },
  ];

  grid.innerHTML = effects.map((e) =>
    `<button class="haptic-btn" data-visual="${e.id}">${e.label}<span class="btn-label">${e.sub}</span></button>`
  ).join('');

  grid.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.haptic-btn') as HTMLElement | null;
    if (!btn) return;
    const id = btn.dataset.visual;
    if (!id) return;
    flashButton(btn);
    engine.tap();

    switch (id) {
      case 'flash': visualEngine.flash({ color: '#6366f1', opacity: 0.2 }); break;
      case 'shake': visualEngine.shake({ intensity: 5, duration: 300 }); break;
      case 'pulse': visualEngine.pulse({ scale: 1.08, duration: 200 }); break;
      case 'ripple': {
        const rect = target.getBoundingClientRect();
        visualEngine.ripple(rect.left + rect.width / 2, rect.top + rect.height / 2, { color: 'rgba(99,102,241,0.5)' });
        break;
      }
      case 'glow': visualEngine.glow({ color: 'rgba(99,102,241,0.6)', size: 20, duration: 400 }); break;
      case 'bounce': visualEngine.bounce({ height: 12, duration: 400 }); break;
      case 'jello': visualEngine.jello({ intensity: 8, duration: 500 }); break;
      case 'rubber': visualEngine.rubber({ scaleX: 1.2, scaleY: 0.8, duration: 350 }); break;
      case 'highlight': visualEngine.highlight({ color: 'rgba(99,102,241,0.3)', duration: 400 }); break;
    }
  });
}

// ─── 11. Emotion Presets ────────────────────────────────────

function initEmotions(): void {
  const grid = $('#emotionGrid');
  const viz = $('#emotionViz');
  const vizBars = $('#emotionVizBars');
  const vizStats = $('#emotionVizStats');

  const emotionList: Array<{ key: string; emoji: string; label: string }> = [
    { key: 'excited', emoji: '\u{1F929}', label: 'Excited' },
    { key: 'calm', emoji: '\u{1F60C}', label: 'Calm' },
    { key: 'tense', emoji: '\u{1F616}', label: 'Tense' },
    { key: 'happy', emoji: '\u{1F604}', label: 'Happy' },
    { key: 'sad', emoji: '\u{1F622}', label: 'Sad' },
    { key: 'angry', emoji: '\u{1F621}', label: 'Angry' },
    { key: 'surprised', emoji: '\u{1F632}', label: 'Surprised' },
    { key: 'anxious', emoji: '\u{1F630}', label: 'Anxious' },
    { key: 'confident', emoji: '\u{1F60E}', label: 'Confident' },
    { key: 'playful', emoji: '\u{1F61C}', label: 'Playful' },
    { key: 'romantic', emoji: '\u{1F970}', label: 'Romantic' },
    { key: 'peaceful', emoji: '\u{1F54A}\uFE0F', label: 'Peaceful' },
  ];

  grid.innerHTML = emotionList.map((e) =>
    `<button class="emotion-btn" data-emotion="${e.key}"><span class="emoji">${e.emoji}</span>${e.label}</button>`
  ).join('');

  const emotionPresets = emotions as unknown as Record<string, HapticPattern>;

  grid.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.emotion-btn') as HTMLElement | null;
    if (!btn) return;
    const key = btn.dataset.emotion!;
    const preset = emotionPresets[key];
    if (!preset) return;
    flashButton(btn);
    engine.play(preset.steps);
    const { bars, stats } = visualizeSteps(preset.steps);
    vizBars.textContent = bars;
    vizStats.textContent = `${formatName(key)} \u00b7 ${stats}`;
    show(viz);
  });
}

// ─── 12. Middleware Demo ────────────────────────────────────

function initMiddleware(): void {
  const intSlider = $('#mwIntensity') as HTMLInputElement;
  const intVal = $('#mwIntensityVal');
  const durSlider = $('#mwDuration') as HTMLInputElement;
  const durVal = $('#mwDurationVal');
  const beforeBars = $('#mwBeforeBars');
  const beforeStats = $('#mwBeforeStats');
  const afterBars = $('#mwAfterBars');
  const afterStats = $('#mwAfterStats');
  const playBefore = $('#mwPlayBefore') as HTMLButtonElement;
  const playAfter = $('#mwPlayAfter') as HTMLButtonElement;

  // Use a sample pattern for the demo
  const sampleHPL = '##..@@..##..@@';
  let sampleSteps: HapticStep[] = [];
  try {
    const ast = parseHPL(sampleHPL);
    sampleSteps = compile(ast);
  } catch { /* noop */ }

  function update(): void {
    const intScale = parseInt(intSlider.value, 10) / 100;
    const durScale = parseInt(durSlider.value, 10) / 100;
    intVal.textContent = intScale.toFixed(1) + 'x';
    durVal.textContent = durScale.toFixed(1) + 'x';

    // Before
    const { bars: bBars, stats: bStats } = visualizeSteps(sampleSteps);
    beforeBars.textContent = bBars;
    beforeStats.textContent = `Original \u00b7 ${bStats}`;

    // After middleware
    const mw = new MiddlewareManager();
    mw.use(intensityScaler(intScale));
    mw.use(durationScaler(durScale));
    const transformed = mw.process(sampleSteps.map((s) => ({ ...s })));

    const { bars: aBars, stats: aStats } = visualizeSteps(transformed);
    afterBars.textContent = aBars;
    afterStats.textContent = `Transformed \u00b7 ${aStats}`;
  }

  intSlider.addEventListener('input', update);
  durSlider.addEventListener('input', update);

  playBefore.addEventListener('click', () => {
    engine.play(sampleSteps);
    flashButton(playBefore);
  });

  playAfter.addEventListener('click', () => {
    const intScale = parseInt(intSlider.value, 10) / 100;
    const durScale = parseInt(durSlider.value, 10) / 100;
    const mw = new MiddlewareManager();
    mw.use(intensityScaler(intScale));
    mw.use(durationScaler(durScale));
    const transformed = mw.process(sampleSteps.map((s) => ({ ...s })));
    engine.play(transformed);
    flashButton(playAfter);
  });

  update();
}

// ─── 13. Profile Manager ────────────────────────────────────

function initProfiles(): void {
  const grid = $('#profileGrid');
  const testBtn = $('#profileTest') as HTMLButtonElement;
  const vizBars = $('#profileVizBars');
  const vizStats = $('#profileVizStats');

  const profileNames = profileManager.listProfiles();

  function render(): void {
    const active = profileManager.current;
    grid.innerHTML = profileNames.map((name) => {
      const p = profiles[name]!;
      return `<div class="profile-card${name === active ? ' active' : ''}" data-profile="${name}">
        <div class="name">${name}</div>
        <div class="detail">Haptic: ${p.hapticScale}x</div>
        <div class="detail">Duration: ${p.durationScale}x</div>
        <div class="detail">Sound: ${p.soundEnabled ? p.soundVolume : 'off'}</div>
      </div>`;
    }).join('');
  }

  grid.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest('.profile-card') as HTMLElement | null;
    if (!card) return;
    const name = card.dataset.profile!;
    profileManager.setProfile(name);
    render();
    engine.tap();

    // Show what the profile does to a sample pattern
    const sampleSteps: HapticStep[] = [
      { type: 'vibrate', duration: 50, intensity: 0.5 },
      { type: 'pause', duration: 50, intensity: 0 },
      { type: 'vibrate', duration: 50, intensity: 0.8 },
      { type: 'pause', duration: 50, intensity: 0 },
      { type: 'vibrate', duration: 50, intensity: 1.0 },
    ];
    const mw = profileManager.toMiddleware();
    const transformed = mw.process(sampleSteps.map((s) => ({ ...s })));
    const { bars, stats } = visualizeSteps(transformed);
    vizBars.textContent = bars;
    vizStats.textContent = `Profile: ${name} \u00b7 ${stats}`;
  });

  testBtn.addEventListener('click', () => {
    const sampleSteps: HapticStep[] = [
      { type: 'vibrate', duration: 30, intensity: 0.5 },
      { type: 'pause', duration: 40, intensity: 0 },
      { type: 'vibrate', duration: 40, intensity: 0.7 },
      { type: 'pause', duration: 40, intensity: 0 },
      { type: 'vibrate', duration: 50, intensity: 1.0 },
    ];
    const mw = profileManager.toMiddleware();
    const transformed = mw.process(sampleSteps.map((s) => ({ ...s })));
    engine.play(transformed);
    flashButton(testBtn);
  });

  render();
}

// ─── 14. Pattern Sharing ────────────────────────────────────

function initSharing(): void {
  const input = $('#shareInput') as HTMLInputElement;
  const exportJsonBtn = $('#exportJson') as HTMLButtonElement;
  const exportUrlBtn = $('#exportDataUrl') as HTMLButtonElement;
  const output = $('#shareOutput');
  const copyBtn = $('#copyShare') as HTMLButtonElement;
  const playBtn = $('#playShare') as HTMLButtonElement;
  const importInput = $('#importInput') as HTMLTextAreaElement;
  const importBtn = $('#importBtn') as HTMLButtonElement;
  const importViz = $('#importViz');
  const importVizBars = $('#importVizBars');
  const importVizStats = $('#importVizStats');

  let lastExportedSteps: HapticStep[] = [];

  function doExport(mode: 'json' | 'url'): void {
    const hpl = input.value.trim();
    if (!hpl) return;
    try {
      const result = mode === 'json'
        ? patternToJSON(hpl, { name: 'Playground Pattern' })
        : patternToDataURL(hpl, { name: 'Playground Pattern' });
      output.textContent = result;
      show(output);
      show(copyBtn);
      show(playBtn);

      const ast = parseHPL(hpl);
      lastExportedSteps = compile(ast);
    } catch (err) {
      output.textContent = 'Error: ' + (err as Error).message;
      show(output);
      hide(copyBtn);
      hide(playBtn);
    }
  }

  exportJsonBtn.addEventListener('click', () => doExport('json'));
  exportUrlBtn.addEventListener('click', () => doExport('url'));

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.textContent || '');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy to Clipboard'; }, 2000);
    } catch { /* noop */ }
  });

  playBtn.addEventListener('click', () => {
    if (lastExportedSteps.length > 0) {
      engine.play(lastExportedSteps);
      flashButton(playBtn);
    }
  });

  importBtn.addEventListener('click', () => {
    const raw = importInput.value.trim();
    if (!raw) return;
    try {
      let pattern: HapticPattern;
      if (raw.startsWith('data:')) {
        pattern = patternFromDataURL(raw);
      } else {
        pattern = patternFromJSON(raw);
      }
      engine.play(pattern.steps);
      const { bars, stats } = visualizeSteps(pattern.steps);
      importVizBars.textContent = bars;
      importVizStats.textContent = `${pattern.name} \u00b7 ${stats}`;
      show(importViz);
      flashButton(importBtn);
    } catch (err) {
      importVizBars.textContent = '';
      importVizStats.textContent = 'Error: ' + (err as Error).message;
      importVizStats.className = 'viz-error';
      show(importViz);
    }
  });
}

// ─── Init ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initStatus();
  initCopy();
  initSemanticEffects();
  initHPLEditor();
  initPresets();
  initComposer();
  initThemes();
  initRecorder();
  initPhysics();
  initRhythm();
  initSound();
  initVisual();
  initEmotions();
  initMiddleware();
  initProfiles();
  initSharing();
});
