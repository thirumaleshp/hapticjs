import {
  presets,
  spring,
  bounce,
  friction,
  impact,
  gravity,
  elastic,
  wave,
  pendulum,
  exportPattern,
  importPattern,
  patternToJSON,
  parseHPL,
  compile,
  haptic,
} from '@hapticjs/core';
import type { HapticPattern, HapticStep } from '@hapticjs/core';
import './style.css';

// ── Types ─────────────────────────────────────────────────

interface GalleryItem {
  id: string;
  name: string;
  category: string;
  steps: HapticStep[];
  hpl?: string;
  description?: string;
  custom?: boolean;
}

type SectionId = 'browse' | 'create' | 'import';

// ── State ─────────────────────────────────────────────────

let allPatterns: GalleryItem[] = [];
let filteredPatterns: GalleryItem[] = [];
let activeCategory = 'all';
let searchQuery = '';
let activeSection: SectionId = 'browse';
let playingId: string | null = null;
let nextId = 1000;

// ── Build built-in collection ─────────────────────────────

function buildBuiltInPatterns(): GalleryItem[] {
  const items: GalleryItem[] = [];

  const addCategory = (
    category: string,
    pats: Record<string, HapticPattern>,
  ) => {
    for (const [key, pattern] of Object.entries(pats)) {
      items.push({
        id: `${category}.${key}`,
        name: pattern.name || `${category}.${key}`,
        category,
        steps: pattern.steps,
        description: describeSteps(pattern.steps),
      });
    }
  };

  addCategory('ui', presets.ui);
  addCategory('notifications', presets.notifications);
  addCategory('gaming', presets.gaming);
  addCategory('accessibility', presets.accessibility);
  addCategory('system', presets.system);
  addCategory('emotions', presets.emotions);

  // Physics patterns with default params
  const physicsPatterns: Record<string, HapticPattern> = {
    spring: spring(),
    bounce: bounce(),
    friction: friction(),
    impact: impact(),
    gravity: gravity(),
    elastic: elastic(),
    wave: wave(),
    pendulum: pendulum(),
  };

  addCategory('physics', physicsPatterns);

  return items;
}

function describeSteps(steps: HapticStep[]): string {
  const totalDuration = steps.reduce((s, st) => s + st.duration, 0);
  const vibrateCount = steps.filter((s) => s.type === 'vibrate').length;
  const maxIntensity = Math.max(...steps.map((s) => s.intensity));
  return `${vibrateCount} pulses, ${totalDuration}ms, peak ${Math.round(maxIntensity * 100)}%`;
}

// ── Waveform Rendering ───────────────────────────────────

function renderWaveform(
  canvas: HTMLCanvasElement,
  steps: HapticStep[],
  opts: { color?: string; height?: number } = {},
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = (opts.height || rect.height) * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = opts.height || rect.height;

  ctx.clearRect(0, 0, w, h);

  if (steps.length === 0) return;

  const totalDuration = steps.reduce((s, st) => s + st.duration, 0);
  if (totalDuration === 0) return;

  const barGap = 1;
  const padding = 4;
  const drawW = w - padding * 2;
  const drawH = h - padding * 2;

  let x = padding;

  for (const step of steps) {
    const stepWidth = (step.duration / totalDuration) * drawW;
    if (stepWidth < 1) continue;

    const barHeight = step.type === 'vibrate'
      ? step.intensity * drawH
      : 0;

    if (step.type === 'vibrate') {
      const gradient = ctx.createLinearGradient(0, h - padding, 0, h - padding - barHeight);
      const baseColor = opts.color || '#7c5cfc';
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, adjustAlpha(baseColor, 0.5));
      ctx.fillStyle = gradient;

      const barW = Math.max(1, stepWidth - barGap);
      const radius = Math.min(3, barW / 2);

      roundedRect(ctx, x, h - padding - barHeight, barW, barHeight, radius);
      ctx.fill();
    }

    x += stepWidth;
  }
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function adjustAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CATEGORY_COLORS: Record<string, string> = {
  ui: '#5ca0fc',
  notifications: '#fc8c5c',
  gaming: '#fc5c8a',
  accessibility: '#5cfca0',
  system: '#a0a0b8',
  emotions: '#d05cfc',
  physics: '#fcd05c',
  custom: '#5cfcfc',
};

// ── Play Pattern ─────────────────────────────────────────

async function playPattern(steps: HapticStep[], id: string) {
  if (playingId) return;

  playingId = id;
  updatePlayButtons();

  try {
    await haptic.play(steps);
  } catch {
    // Vibration API may not be available
  }

  // Simulate playback duration for visual feedback
  const totalDuration = steps.reduce((s, st) => s + st.duration, 0);
  await new Promise((resolve) => setTimeout(resolve, totalDuration));

  playingId = null;
  updatePlayButtons();
}

function updatePlayButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-play-id]').forEach((btn) => {
    const id = btn.dataset.playId!;
    if (id === playingId) {
      btn.classList.add('playing');
      btn.textContent = 'Playing...';
    } else {
      btn.classList.remove('playing');
      btn.textContent = 'Play';
    }
  });
}

// ── Clipboard & Share ────────────────────────────────────

async function copyToClipboard(text: string, btn: HTMLButtonElement) {
  try {
    await navigator.clipboard.writeText(text);
    btn.classList.add('copied');
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.textContent = orig;
    }, 1500);
  } catch {
    showToast('Copy failed', 'error');
  }
}

function generateShareURL(item: GalleryItem): string {
  const exportData = exportPattern(item.steps, {
    name: item.name,
    tags: [item.category],
  });
  const json = JSON.stringify(exportData);
  const encoded = btoa(json);
  return `${window.location.origin}${window.location.pathname}#pattern=${encoded}`;
}

// ── Toast ────────────────────────────────────────────────

let toastTimeout: number | undefined;

function showToast(message: string, type: 'success' | 'error' = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast ${type}`;

  clearTimeout(toastTimeout);
  requestAnimationFrame(() => {
    toast!.classList.add('show');
  });

  toastTimeout = window.setTimeout(() => {
    toast!.classList.remove('show');
  }, 2500);
}

// ── URL Hash Handling ────────────────────────────────────

function checkURLForPattern() {
  const hash = window.location.hash;
  if (!hash.startsWith('#pattern=')) return;

  try {
    const encoded = hash.slice('#pattern='.length);
    const json = atob(encoded);
    const pattern = importPattern(json);

    const item: GalleryItem = {
      id: `shared-${nextId++}`,
      name: pattern.name || 'Shared Pattern',
      category: 'custom',
      steps: pattern.steps,
      description: describeSteps(pattern.steps),
      custom: true,
    };

    allPatterns.unshift(item);
    applyFilters();
    renderCards();
    showToast(`Loaded shared pattern: ${item.name}`, 'success');

    // Clear hash
    history.replaceState(null, '', window.location.pathname);
  } catch {
    showToast('Failed to load shared pattern', 'error');
  }
}

// ── Render Functions ─────────────────────────────────────

function renderApp() {
  const app = document.getElementById('app')!;
  app.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'app';

  // Header
  container.innerHTML = `
    <header class="header">
      <h1>HapticJS Pattern Gallery</h1>
      <p>Browse, preview, and share haptic patterns</p>
      <div class="stats">
        <span>${allPatterns.length}</span> patterns across
        <span>7</span> categories
      </div>
    </header>

    <div class="section-tabs" id="section-tabs">
      <button class="section-tab active" data-section="browse">Browse</button>
      <button class="section-tab" data-section="create">Create</button>
      <button class="section-tab" data-section="import">Import</button>
    </div>

    <div id="browse-section">
      <div class="toolbar">
        <input type="text" class="search-input" id="search-input"
          placeholder="Search patterns..." value="${searchQuery}" />
        <div class="filter-chips" id="filter-chips"></div>
      </div>
      <div class="card-grid" id="card-grid"></div>
      <div class="empty-state" id="empty-state" style="display:none">
        <p>No patterns found</p>
        <p class="hint">Try a different search or filter</p>
      </div>
    </div>

    <div class="creator" id="create-section">
      <div class="creator-editor">
        <label class="editor-label">HPL Editor</label>
        <div class="editor-container">
          <textarea class="hpl-editor" id="hpl-editor"
            placeholder="Type HPL here... e.g. ~~..##..@@"
            spellcheck="false"></textarea>
        </div>
        <div class="creator-actions">
          <input type="text" class="creator-name-input" id="creator-name"
            placeholder="Pattern name" />
          <button class="btn btn-play" id="creator-play">Play</button>
          <button class="btn btn-primary" id="creator-add">Add to Gallery</button>
          <button class="btn" id="creator-export-json">Export JSON</button>
        </div>
      </div>
      <div class="creator-preview">
        <label class="editor-label">Waveform Preview</label>
        <canvas class="preview-canvas" id="creator-canvas"></canvas>
        <div id="creator-info" style="font-size:0.8rem;color:var(--text-muted)"></div>
      </div>
    </div>

    <div class="import-section" id="import-section">
      <label class="editor-label">Paste JSON or HPL to import</label>
      <textarea class="import-textarea" id="import-textarea"
        placeholder='Paste HPL string (e.g. ~~..##) or JSON export...'
        spellcheck="false"></textarea>
      <div class="import-actions">
        <button class="btn btn-primary" id="import-btn">Import Pattern</button>
      </div>
    </div>
  `;

  app.appendChild(container);

  renderFilterChips();
  applyFilters();
  renderCards();
  bindEvents();
  updateSectionVisibility();
}

function renderFilterChips() {
  const container = document.getElementById('filter-chips')!;
  const categories = ['all', 'ui', 'notifications', 'gaming', 'accessibility', 'system', 'emotions', 'physics', 'custom'];

  container.innerHTML = categories
    .map(
      (cat) =>
        `<button class="chip ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">${cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`,
    )
    .join('');
}

function applyFilters() {
  filteredPatterns = allPatterns.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    return true;
  });
}

function renderCards() {
  const grid = document.getElementById('card-grid')!;
  const empty = document.getElementById('empty-state')!;

  if (filteredPatterns.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  grid.innerHTML = filteredPatterns
    .map((item) => {
      const tagClass = `tag-${item.category}`;
      return `
        <div class="card" data-id="${item.id}">
          <div class="card-header">
            <span class="card-name" title="${item.name}">${item.name}</span>
            <span class="card-tag ${tagClass}">${item.category}</span>
          </div>
          <div class="card-description" title="${item.description || ''}">${item.description || ''}</div>
          <canvas class="card-canvas" data-canvas-id="${item.id}"></canvas>
          <div class="card-actions">
            <button class="btn btn-play" data-play-id="${item.id}">Play</button>
            <button class="btn" data-copy-json="${item.id}">Copy JSON</button>
            <button class="btn" data-share="${item.id}">Share</button>
            ${item.custom ? `<button class="btn" data-remove="${item.id}" style="color:var(--error)">Remove</button>` : ''}
          </div>
        </div>
      `;
    })
    .join('');

  // Render waveforms after DOM update
  requestAnimationFrame(() => {
    filteredPatterns.forEach((item) => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        `[data-canvas-id="${item.id}"]`,
      );
      if (canvas) {
        renderWaveform(canvas, item.steps, {
          color: CATEGORY_COLORS[item.category] || '#7c5cfc',
        });
      }
    });
  });
}

function updateSectionVisibility() {
  const browseSection = document.getElementById('browse-section')!;
  const createSection = document.getElementById('create-section')!;
  const importSection = document.getElementById('import-section')!;

  browseSection.style.display = activeSection === 'browse' ? 'block' : 'none';
  createSection.className = `creator ${activeSection === 'create' ? 'visible' : ''}`;
  importSection.className = `import-section ${activeSection === 'import' ? 'visible' : ''}`;

  // Update tabs
  document.querySelectorAll('.section-tab').forEach((tab) => {
    const tabEl = tab as HTMLElement;
    tabEl.classList.toggle('active', tabEl.dataset.section === activeSection);
  });
}

// ── Event Binding ────────────────────────────────────────

function bindEvents() {
  // Section tabs
  document.getElementById('section-tabs')!.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-section]') as HTMLElement;
    if (!target) return;
    activeSection = target.dataset.section as SectionId;
    updateSectionVisibility();

    if (activeSection === 'create') {
      requestAnimationFrame(() => updateCreatorPreview());
    }
  });

  // Search
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    applyFilters();
    renderCards();
  });

  // Filter chips
  document.getElementById('filter-chips')!.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-category]') as HTMLElement;
    if (!target) return;
    activeCategory = target.dataset.category!;
    renderFilterChips();
    applyFilters();
    renderCards();
  });

  // Card actions (delegated)
  document.getElementById('card-grid')!.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('button') as HTMLButtonElement;
    if (!btn) return;

    // Play
    if (btn.dataset.playId) {
      const item = allPatterns.find((p) => p.id === btn.dataset.playId);
      if (item) playPattern(item.steps, item.id);
      return;
    }

    // Copy JSON
    if (btn.dataset.copyJson) {
      const item = allPatterns.find((p) => p.id === btn.dataset.copyJson);
      if (item) {
        const json = patternToJSON(item.steps, { name: item.name, tags: [item.category] });
        copyToClipboard(json, btn);
      }
      return;
    }

    // Share
    if (btn.dataset.share) {
      const item = allPatterns.find((p) => p.id === btn.dataset.share);
      if (item) {
        const url = generateShareURL(item);
        copyToClipboard(url, btn);
        showToast('Share URL copied to clipboard', 'success');
      }
      return;
    }

    // Remove
    if (btn.dataset.remove) {
      allPatterns = allPatterns.filter((p) => p.id !== btn.dataset.remove);
      applyFilters();
      renderCards();
      showToast('Pattern removed', 'success');
    }
  });

  // Creator
  const hplEditor = document.getElementById('hpl-editor') as HTMLTextAreaElement;
  hplEditor.addEventListener('input', () => {
    updateCreatorPreview();
  });

  document.getElementById('creator-play')!.addEventListener('click', () => {
    const hpl = hplEditor.value.trim();
    if (!hpl) return;
    try {
      const ast = parseHPL(hpl);
      const steps = compile(ast);
      playPattern(steps, 'creator');
    } catch (e) {
      showToast(`Invalid HPL: ${(e as Error).message}`, 'error');
    }
  });

  document.getElementById('creator-add')!.addEventListener('click', () => {
    const hpl = hplEditor.value.trim();
    const nameInput = document.getElementById('creator-name') as HTMLInputElement;
    const name = nameInput.value.trim() || `Custom Pattern ${nextId}`;

    if (!hpl) {
      showToast('Enter some HPL first', 'error');
      return;
    }

    try {
      const ast = parseHPL(hpl);
      const steps = compile(ast);

      const item: GalleryItem = {
        id: `custom-${nextId++}`,
        name,
        category: 'custom',
        steps,
        hpl,
        description: describeSteps(steps),
        custom: true,
      };

      allPatterns.unshift(item);
      activeCategory = 'all';
      activeSection = 'browse';
      applyFilters();
      renderFilterChips();
      renderCards();
      updateSectionVisibility();
      showToast(`Added "${name}" to gallery`, 'success');

      hplEditor.value = '';
      nameInput.value = '';
    } catch (e) {
      showToast(`Invalid HPL: ${(e as Error).message}`, 'error');
    }
  });

  document.getElementById('creator-export-json')!.addEventListener('click', () => {
    const hpl = hplEditor.value.trim();
    const nameInput = document.getElementById('creator-name') as HTMLInputElement;
    const name = nameInput.value.trim() || 'Untitled Pattern';

    if (!hpl) {
      showToast('Enter some HPL first', 'error');
      return;
    }

    try {
      const json = patternToJSON(hpl, { name });
      copyToClipboard(json, document.getElementById('creator-export-json') as HTMLButtonElement);
      showToast('JSON copied to clipboard', 'success');
    } catch (e) {
      showToast(`Invalid HPL: ${(e as Error).message}`, 'error');
    }
  });

  // Import
  document.getElementById('import-btn')!.addEventListener('click', () => {
    const textarea = document.getElementById('import-textarea') as HTMLTextAreaElement;
    const input = textarea.value.trim();

    if (!input) {
      showToast('Paste some content first', 'error');
      return;
    }

    try {
      let steps: HapticStep[];
      let name = `Imported ${nextId}`;

      // Try JSON first
      if (input.startsWith('{')) {
        const pattern = importPattern(input);
        steps = pattern.steps;
        name = pattern.name || name;
      } else {
        // Try HPL
        const ast = parseHPL(input);
        steps = compile(ast);
      }

      const item: GalleryItem = {
        id: `import-${nextId++}`,
        name,
        category: 'custom',
        steps,
        description: describeSteps(steps),
        custom: true,
      };

      allPatterns.unshift(item);
      activeCategory = 'all';
      activeSection = 'browse';
      applyFilters();
      renderFilterChips();
      renderCards();
      updateSectionVisibility();
      showToast(`Imported "${name}"`, 'success');
      textarea.value = '';
    } catch (e) {
      showToast(`Import failed: ${(e as Error).message}`, 'error');
    }
  });

  // Resize handler for waveforms
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      renderCards();
      updateCreatorPreview();
    }, 150);
  });
}

function updateCreatorPreview() {
  const hplEditor = document.getElementById('hpl-editor') as HTMLTextAreaElement | null;
  const canvas = document.getElementById('creator-canvas') as HTMLCanvasElement | null;
  const info = document.getElementById('creator-info') as HTMLElement | null;

  if (!hplEditor || !canvas || !info) return;

  const hpl = hplEditor.value.trim();

  if (!hpl) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
    info.textContent = '';
    return;
  }

  try {
    const ast = parseHPL(hpl);
    const steps = compile(ast);
    renderWaveform(canvas, steps, { color: '#5cfcfc', height: 120 });
    info.textContent = describeSteps(steps);
    info.style.color = 'var(--text-muted)';
  } catch (e) {
    info.textContent = `Error: ${(e as Error).message}`;
    info.style.color = 'var(--error)';
  }
}

// ── Initialize ───────────────────────────────────────────

function init() {
  allPatterns = buildBuiltInPatterns();
  renderApp();
  checkURLForPattern();
}

init();
