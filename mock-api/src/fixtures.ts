/**
 * In-memory mock content. Small on purpose — enough to exercise every port
 * (documents, associated files, collections, a navigable graph, wallpapers).
 */
import type { Collection, Document, Wallpaper } from './types.js';
import { hash, paletteFor } from './generators.js';

const now = '2026-07-12T00:00:00.000Z';

// ── Wallpapers: 50-entry cache (25 dark + 25 light), generated locally ────────
// Names are borrowed from the real theme set; the mock only needs the count.
const DARK_NAMES = [
  '9009', 'aether', 'aurora', 'bingsu', 'blueberry_dark', 'catppuccin', 'chaos_theory',
  'dark_note', 'dmg', 'dots', 'dracula', 'dualshot', 'fire', 'future_funk', 'grape',
  'horizon', 'husqy', 'incognito', 'matrix', 'metropolis', 'modern_ink', 'moonlight',
  'oblivion', 'phantom', 'rgb',
];
const LIGHT_NAMES = [
  'beach', 'blueberry_light', 'camping', 'cheesecake', 'desert_oasis', 'ez_mode', 'froyo',
  'fruit_chew', 'fundamentals', 'graen', 'ishtar', 'lavender', 'lil_dragon', 'milkshake',
  'rainbow_trail', 'retrocast', 'sewing_tin_light', 'shadow', 'snes', 'solarized_osaka',
  'stealth', 'sunset', 'taro', 'terrazzo', 'trance',
];

function buildWallpapers(): Wallpaper[] {
  const make = (name: string, variant: 'dark' | 'light'): Wallpaper => {
    const id = `wp-${variant}-${name}`;
    return {
      id,
      name,
      variant,
      palette: paletteFor(name, variant),
      url: `/wallpaper/${id}.svg`,
      specUrl: `/wallpaper/${id}/spec`,
    };
  };
  return [
    ...DARK_NAMES.map((n) => make(n, 'dark')),
    ...LIGHT_NAMES.map((n) => make(n, 'light')),
  ];
}

export const wallpapers: Wallpaper[] = buildWallpapers();
export const wallpaperById = new Map(wallpapers.map((w) => [w.id, w]));
export const wallpaperSeed = (id: string) => hash(id);

// ── Collections (pages / sections) ────────────────────────────────────────────
export const collections: Collection[] = [
  { id: 'work', title: 'Work', description: 'Trading systems & quant research.',
    documentIds: ['doc-pairs-trading', 'doc-ou-model', 'doc-report-quant', 'doc-resume'] },
  { id: 'writing', title: 'Writing', description: 'Essays & notes.',
    documentIds: ['doc-math-in-motion', 'doc-determinant-art', 'doc-ai-scarcity'] },
  { id: 'projects', title: 'Projects', description: 'Things I built.',
    documentIds: ['doc-paper-pigeon', 'doc-pairs-trading', 'doc-determinant-art'] },
  { id: 'notes', title: 'Notes', description: 'Loose ends.',
    documentIds: ['doc-home', 'doc-realtime', 'doc-notes-linalg', 'doc-about'] },
];

// ── Documents ────────────────────────────────────────────────────────────────
const thumb = (id: string) => `/atlas/thumbnails/${id}.svg`;
const content = (id: string) => `/atlas/documents/${id}/content`;
const asset = (docId: string, name: string) => `/atlas/assets/${docId}/${name}`;

export const documents: Document[] = [
  {
    id: 'doc-home', type: 'markdown', title: 'Welcome',
    description: 'Start here.', thumbnailUrl: thumb('doc-home'),
    tags: ['index'], links: ['doc-about', 'doc-pairs-trading', 'doc-math-in-motion'],
    path: '', collectionIds: ['notes'], contentUrl: content('doc-home'),
    associated: [], createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-pairs-trading', type: 'markdown', title: 'Pairs Trading',
    description: 'A cointegration + OU mean-reversion strategy.', thumbnailUrl: thumb('doc-pairs-trading'),
    tags: ['quant', 'trading', 'python'], links: ['doc-ou-model', 'doc-math-in-motion', 'doc-report-quant'],
    path: 'work/trading', collectionIds: ['work', 'projects'], contentUrl: content('doc-pairs-trading'),
    associated: [
      { id: 'a1', kind: 'dataset', mime: 'text/csv', title: 'Daily prices', url: asset('doc-pairs-trading', 'prices.csv') },
      { id: 'a2', kind: 'image', mime: 'image/svg+xml', title: 'Equity curve', url: asset('doc-pairs-trading', 'equity.svg') },
    ],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-ou-model', type: 'markdown', title: 'The Ornstein–Uhlenbeck model',
    description: 'Why mean reversion has a half-life.', thumbnailUrl: thumb('doc-ou-model'),
    tags: ['quant', 'math'], links: ['doc-pairs-trading', 'doc-notes-linalg'],
    path: 'work/trading', collectionIds: ['work'], contentUrl: content('doc-ou-model'),
    associated: [], createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-report-quant', type: 'pdf', title: 'Quant Strategy Report',
    description: 'Backtest write-up (2019–2024).', thumbnailUrl: thumb('doc-report-quant'),
    tags: ['quant', 'report'], links: ['doc-pairs-trading'],
    path: 'work/trading', collectionIds: ['work'], contentUrl: content('doc-report-quant'),
    associated: [
      { id: 'a3', kind: 'dataset', mime: 'text/csv', title: 'Trade log', url: asset('doc-report-quant', 'trades.csv') },
    ],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-resume', type: 'pdf', title: 'Résumé',
    thumbnailUrl: thumb('doc-resume'), tags: ['about'], links: [],
    path: '', collectionIds: ['work'], contentUrl: content('doc-resume'),
    associated: [], createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-paper-pigeon', type: 'markdown', title: 'Paper Pigeon',
    description: 'Realtime collaboration, shipped.', thumbnailUrl: thumb('doc-paper-pigeon'),
    tags: ['product', 'realtime'], links: ['doc-realtime'],
    path: 'projects', collectionIds: ['projects'], contentUrl: content('doc-paper-pigeon'),
    associated: [
      { id: 'a4', kind: 'image', mime: 'image/svg+xml', title: 'Screenshot', url: asset('doc-paper-pigeon', 'shot.svg') },
    ],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-realtime', type: 'markdown', title: 'Realtime collaboration notes',
    description: 'CRDTs, presence, and the hard parts.', thumbnailUrl: thumb('doc-realtime'),
    tags: ['realtime', 'notes'], links: ['doc-paper-pigeon'],
    path: 'projects', collectionIds: ['notes'], contentUrl: content('doc-realtime'),
    associated: [], createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-math-in-motion', type: 'markdown', title: 'Mathematics in Motion',
    description: 'The maths of moving pictures.', thumbnailUrl: thumb('doc-math-in-motion'),
    tags: ['essay', 'math', 'graphics'], links: ['doc-determinant-art', 'doc-pairs-trading'],
    path: 'writing', collectionIds: ['writing'], contentUrl: content('doc-math-in-motion'),
    associated: [
      { id: 'a5', kind: 'video', mime: 'video/mp4', title: 'Companion clip', url: asset('doc-math-in-motion', 'clip.mp4') },
    ],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-determinant-art', type: 'markdown', title: 'Determinant Wallpapers',
    description: 'Linear algebra as generative art.', thumbnailUrl: thumb('doc-determinant-art'),
    tags: ['math', 'graphics', 'project'], links: ['doc-math-in-motion', 'doc-notes-linalg'],
    path: 'writing', collectionIds: ['writing', 'projects'], contentUrl: content('doc-determinant-art'),
    associated: [
      { id: 'a6', kind: 'image', mime: 'image/svg+xml', title: 'Sample render', url: asset('doc-determinant-art', 'render.svg') },
    ],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-ai-scarcity', type: 'markdown', title: 'AI & Resource Scarcity',
    description: 'What gets rationed when compute is cheap.', thumbnailUrl: thumb('doc-ai-scarcity'),
    tags: ['essay', 'ai'], links: ['doc-math-in-motion'],
    path: 'writing', collectionIds: ['writing'], contentUrl: content('doc-ai-scarcity'),
    associated: [], createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-notes-linalg', type: 'markdown', title: 'Linear Algebra Notes',
    description: 'Determinants, eigenstuff, decompositions.', thumbnailUrl: thumb('doc-notes-linalg'),
    tags: ['math', 'notes'], links: ['doc-determinant-art', 'doc-ou-model'],
    path: 'notes', collectionIds: ['notes'], contentUrl: content('doc-notes-linalg'),
    associated: [], createdAt: now, updatedAt: now,
  },
  {
    id: 'doc-about', type: 'markdown', title: 'About',
    description: 'Who + why.', thumbnailUrl: thumb('doc-about'),
    tags: ['about'], links: ['doc-home'],
    path: '', collectionIds: ['notes'], contentUrl: content('doc-about'),
    associated: [], createdAt: now, updatedAt: now,
  },
];

export const documentById = new Map(documents.map((d) => [d.id, d]));

// ── Markdown bodies (pdf docs are generated on the fly instead) ───────────────
export const markdownBodies: Record<string, string> = {
  'doc-home': `# Welcome\n\nThis is the mock Atlas. Open the [About](doc-about) page, or dive into [Pairs Trading](doc-pairs-trading) and [Mathematics in Motion](doc-math-in-motion).\n\nEverything you see is served by the local dev API.`,
  'doc-pairs-trading': `# Pairs Trading\n\nWe trade the **spread** between two cointegrated assets, betting it reverts to its mean.\n\n- Estimate the hedge ratio.\n- Model the spread as an [Ornstein–Uhlenbeck process](doc-ou-model).\n- Enter at ±2σ, exit at the mean.\n\nSee the [strategy report](doc-report-quant) for the full backtest.`,
  'doc-ou-model': `# The Ornstein–Uhlenbeck model\n\nThe OU process pulls back toward its long-run mean at rate \\(\\theta\\):\n\n\`dX = θ(μ − X)dt + σ dW\`\n\nThe **half-life** of mean reversion is \`ln(2)/θ\` — the single most useful number for sizing a [pairs trade](doc-pairs-trading).`,
  'doc-paper-pigeon': `# Paper Pigeon\n\nA realtime collaboration product. Multiple cursors, presence, conflict-free edits.\n\nThe interesting engineering is in the [realtime notes](doc-realtime).`,
  'doc-realtime': `# Realtime collaboration notes\n\nCRDTs give you conflict-free merges; the hard parts are **presence**, **undo**, and keeping the wire small.\n\nShipped in [Paper Pigeon](doc-paper-pigeon).`,
  'doc-math-in-motion': `# Mathematics in Motion\n\nEvery frame of animation is linear algebra in disguise. This essay traces the path from matrices to motion, and ends at [determinant wallpapers](doc-determinant-art).`,
  'doc-determinant-art': `# Determinant Wallpapers\n\nBrute-force the max/min-determinant binary matrices, colour each by its determinant, tile them, blur. The result is the ambient art behind this site — see the [linear algebra notes](doc-notes-linalg).`,
  'doc-ai-scarcity': `# AI & Resource Scarcity\n\nWhen inference is cheap, attention and trust become the scarce goods. A short argument.`,
  'doc-notes-linalg': `# Linear Algebra Notes\n\nDeterminants measure signed volume. Eigenvectors are the axes a matrix leaves alone. Both show up in [determinant art](doc-determinant-art).`,
  'doc-about': `# About\n\nQuant, builder, and occasional writer. Back to [home](doc-home).`,
};
