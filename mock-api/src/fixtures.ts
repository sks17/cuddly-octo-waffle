/**
 * In-memory mock content. Small on purpose — enough to exercise every port
 * (documents, associated files, collections, a navigable graph, wallpapers).
 *
 * While the Atlas can't serve it, this also holds the site's *real* content:
 * bytes (PDFs, thumbnails, video) live in `mock-api/public/` — see
 * `static-files.ts` — and everything else is described here.
 */
import type { Collection, Document, Wallpaper } from './types.js';
import { hash, paletteFor } from './generators.js';

const now = '2026-07-20T00:00:00.000Z';

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
  { id: 'featured', title: 'Featured', description: 'A few highlights.',
    documentIds: ['doc-graphview', 'doc-nemi-absence', 'doc-backdoors', 'doc-vit-positional', 'doc-paper-pigeon'] },
  { id: 'projects', title: 'Projects', description: 'Things I built.',
    documentIds: ['doc-graphview', 'doc-dopfone', 'doc-drone-mapping', 'doc-tennis-pose', 'doc-paper-pigeon', 'doc-pairs-trading', 'doc-walls', 'doc-data-science', 'doc-determinant-art'] },
  { id: 'experiences', title: 'Experiences', description: 'Roles & study.',
    documentIds: ['doc-experience-biosyft', 'doc-experience-seal', 'doc-experience-liberated', 'doc-experience-bluedot', 'doc-experience-uw'],
    note: 'I can send a résumé with a lot more detail on any of these — [contact me](/contact) and I will get one over to you.' },
  { id: 'research', title: 'Research', description: 'Papers and write-ups, each kept next to the artifact it came from.',
    documentIds: ['doc-nemi-absence', 'doc-vit-positional', 'doc-backdoors'] },
  { id: 'links', title: 'Links', description: 'Where this work lives on the web.',
    documentIds: ['doc-graphview', 'doc-nemi-absence', 'doc-vit-positional', 'doc-backdoors', 'doc-paper-pigeon'] },
  { id: 'drafts', title: 'Drafts', description: 'Work in progress.',
    documentIds: ['doc-tennis-pose'] },
];

// ── Documents ────────────────────────────────────────────────────────────────
const thumb = (id: string) => `/atlas/thumbnails/${id}.svg`;
/** Real bitmap thumbnails — the file lives in `mock-api/public/thumbnails/`. */
const thumbFile = (file: string) => `/atlas/thumbnails/${file}`;
const content = (id: string) => `/atlas/documents/${id}/content`;
const asset = (docId: string, name: string) => `/atlas/assets/${docId}/${name}`;

export const documents: Document[] = [
  {
    id: 'doc-graphview', type: 'pdf', title: 'GraphView',
    description: 'A graph-native personal knowledge system — documents, the concepts inside them and your notes, laid out as one living force-directed atlas.',
    thumbnailUrl: thumbFile('doc-graphview.jpg'),
    tags: ['product', 'knowledge', 'graph'], links: ['doc-paper-pigeon'],
    path: 'projects', collectionIds: ['projects', 'links', 'featured'],
    contentUrl: content('doc-graphview'),
    associated: [], createdAt: '2026-07-01T00:00:00.000Z', updatedAt: now,
    meta: { url: 'https://graphview.org' },
  },
  {
    id: 'doc-dopfone', type: 'pdf', title: 'DopFone Robustness',
    description: 'RADAR-Sense: robustness certification for smartphone Doppler fetal heart-rate sensing — the exact corruption dose at which an estimator breaks down, with confidence intervals.',
    thumbnailUrl: thumbFile('doc-dopfone.jpg'),
    tags: ['signal-processing', 'robustness', 'health'], links: [],
    path: 'projects', collectionIds: ['projects'], contentUrl: content('doc-dopfone'),
    associated: [], createdAt: '2026-06-01T00:00:00.000Z', updatedAt: now,
  },
  {
    id: 'doc-backdoors', type: 'pdf',
    title: 'Are We Guarding Against Backdoors Or Failing To Notice Them?',
    description: 'Backdoor evaluations can fail because the trigger never reaches the model at all (Part 1 / 6).',
    thumbnailUrl: thumbFile('doc-backdoors.png'),
    tags: ['ai-safety', 'evals', 'backdoors'], links: [],
    path: 'research', collectionIds: ['research', 'links', 'featured'],
    contentUrl: content('doc-backdoors'),
    associated: [], createdAt: '2026-07-09T00:00:00.000Z', updatedAt: now,
    meta: { url: 'https://www.lesswrong.com/posts/XhsSnrL5PXqyyjMrj/are-we-guarding-against-backdoors-or-failing-to-notice-them' },
  },
  {
    id: 'doc-nemi-absence', type: 'markdown',
    title: 'When the Circuit Isn\'t There: Establishing Absence in a Behavioral Sequence Model',
    description: 'A calibrated null: a sequence model of mouse behaviour turns out to represent no order at all — and the same pipeline recovers a planted computation on synthetic data, which is what makes the absence readable.',
    thumbnailUrl: thumb('doc-nemi-absence'),
    tags: ['paper', 'interpretability', 'behavior'], links: ['doc-experience-biosyft'],
    path: 'research', collectionIds: ['research', 'links', 'featured'],
    contentUrl: content('doc-nemi-absence'),
    associated: [
      { id: 'a8', kind: 'pdf', mime: 'application/pdf', title: 'NEMI abstract', url: asset('doc-nemi-absence', 'abstract.pdf') },
    ],
    createdAt: '2026-08-17T00:00:00.000Z', updatedAt: now,
    meta: {
      layout: 'preview-left',
      url: 'https://zenodo.org/records/21970594',
      doi: '10.5281/zenodo.21970594',
      venue: 'NEMI 2026 — New England Mechanistic Interpretability Workshop, Boston University',
    },
  },
  {
    id: 'doc-vit-positional', type: 'markdown',
    title: 'Does Positional Information Causally Constrain Background Shortcut Reliance in Vision Transformers?',
    description: 'Attenuating the positional signal in frozen ViTs monotonically raises their reliance on background shortcuts — in all eight models, whatever the encoding scheme.',
    thumbnailUrl: thumbFile('doc-vit-positional.png'),
    tags: ['paper', 'vision', 'transformers'], links: [],
    path: 'research', collectionIds: ['research', 'links', 'featured'],
    contentUrl: content('doc-vit-positional'),
    associated: [
      { id: 'a1', kind: 'image', mime: 'image/png', title: 'Poster', url: asset('doc-vit-positional', 'poster.png') },
      { id: 'a9', kind: 'pdf', mime: 'application/pdf', title: 'Preprint', url: asset('doc-vit-positional', 'paper.pdf') },
    ],
    createdAt: '2026-05-01T00:00:00.000Z', updatedAt: now,
    meta: {
      layout: 'preview-left',
      url: 'https://zenodo.org/records/21971017',
      doi: '10.5281/zenodo.21971017',
      code: 'https://github.com/sks17/posvit',
    },
  },
  {
    id: 'doc-drone-mapping', type: 'markdown',
    title: 'Drone Mapping Startup (T65 Redbull Ideathon Nationally)',
    description: 'An autonomous drone swarm that explores and maps an interior on its own, scored top 65 nationally at the Red Bull Ideathon.',
    thumbnailUrl: thumbFile('doc-drone-mapping.jpg'),
    tags: ['drones', 'mapping', 'simulation'], links: [],
    path: 'projects', collectionIds: ['projects'], contentUrl: content('doc-drone-mapping'),
    associated: [
      { id: 'a2', kind: 'video', mime: 'video/mp4', title: 'Swarm scan demo', url: asset('doc-drone-mapping', 'demo.mp4') },
    ],
    createdAt: '2026-04-03T00:00:00.000Z', updatedAt: now, meta: { layout: 'preview-left' },
  },
  {
    id: 'doc-tennis-pose', type: 'markdown', title: 'Pose Segmentation for Tennis Serves',
    description: 'Bringing pose-segmentation technology from baseball across to the tennis serve — heading for the App Store.',
    thumbnailUrl: thumb('doc-tennis-pose'),
    tags: ['computer-vision', 'pose', 'sport'], links: ['doc-experience-biosyft'],
    path: 'projects', collectionIds: ['projects', 'drafts'], contentUrl: content('doc-tennis-pose'),
    associated: [], createdAt: '2026-07-15T00:00:00.000Z', updatedAt: now,
  },
  {
    id: 'doc-paper-pigeon', type: 'pdf', title: 'Paper Pigeon',
    description: 'An n8n-backed research network visualizer — an interactive 3-D map of a research ecosystem: the researchers, the labs, and the papers that connect them.',
    thumbnailUrl: thumbFile('doc-paper-pigeon.jpg'),
    tags: ['product', 'research', 'graph'], links: ['doc-graphview'],
    path: 'projects', collectionIds: ['projects', 'links', 'featured'],
    contentUrl: content('doc-paper-pigeon'),
    associated: [], createdAt: '2025-11-15T00:00:00.000Z', updatedAt: now,
    meta: { url: 'https://paper-pigeon-t7dn.vercel.app/app' },
  },
  {
    id: 'doc-pairs-trading', type: 'markdown', title: 'Quantitative Pairs Trading',
    description: 'A quantitative research pipeline that finds correlated pairs, generates Ornstein–Uhlenbeck mean-reversion signals, and validates them across 25+ research-grade plots.',
    thumbnailUrl: thumbFile('doc-pairs-trading.jpg'),
    tags: ['python', 'statistics', 'finance'], links: [],
    path: 'projects', collectionIds: ['projects'], contentUrl: content('doc-pairs-trading'),
    associated: [
      { id: 'a3', kind: 'image', mime: 'image/jpeg', title: 'Z-score distribution', url: asset('doc-pairs-trading', 'zscore-distribution.jpg') },
    ],
    createdAt: '2026-01-10T00:00:00.000Z', updatedAt: now, meta: { layout: 'preview-left' },
  },
  {
    id: 'doc-walls', type: 'markdown', title: 'WALLS',
    description: 'A mental-health assessment platform: PyTorch screening for stress, anxiety and depression behind interactive dashboards, with an offline demo mode.',
    thumbnailUrl: thumbFile('doc-walls.jpg'),
    tags: ['ml', 'pytorch', 'flask', 'health'], links: [],
    path: 'projects', collectionIds: ['projects'], contentUrl: content('doc-walls'),
    associated: [
      { id: 'a4', kind: 'image', mime: 'image/jpeg', title: 'Platform splash', url: asset('doc-walls', 'splash.jpg') },
    ],
    createdAt: '2025-01-10T00:00:00.000Z', updatedAt: now, meta: { layout: 'preview-left' },
  },
  {
    id: 'doc-data-science', type: 'markdown', title: 'High School Data Science',
    description: 'Data science projects written for high-school assignments in Python — Pandas, GeoPandas, NumPy, scikit-learn, Matplotlib and Seaborn.',
    thumbnailUrl: thumbFile('doc-data-science.jpg'),
    tags: ['python', 'data-science', 'notebooks'], links: [],
    path: 'projects', collectionIds: ['projects'], contentUrl: content('doc-data-science'),
    associated: [
      { id: 'a5', kind: 'image', mime: 'image/jpeg', title: 'Data science', url: asset('doc-data-science', 'logo.jpg') },
    ],
    createdAt: '2024-05-01T00:00:00.000Z', updatedAt: now, meta: { layout: 'preview-left' },
  },
  {
    id: 'doc-determinant-art', type: 'markdown', title: 'Determinant Wallpapers',
    description: 'The entire background of this website is generated by brute-force linear algebra — searching for matrices with maximised determinants and rendering them as abstract geometric patterns.',
    thumbnailUrl: thumbFile('doc-determinant-art.jpg'),
    tags: ['math', 'graphics', 'generative'], links: [],
    path: 'projects', collectionIds: ['projects'], contentUrl: content('doc-determinant-art'),
    associated: [
      { id: 'a6', kind: 'image', mime: 'image/jpeg', title: 'Rainbow matrix', url: asset('doc-determinant-art', 'rainbow-matrix.jpg') },
      { id: 'a7', kind: 'image', mime: 'image/jpeg', title: 'Rendered wallpaper', url: asset('doc-determinant-art', 'background.jpg') },
    ],
    createdAt: '2024-03-20T00:00:00.000Z', updatedAt: now, meta: { layout: 'preview-left' },
  },
  {
    id: 'doc-experience-biosyft', type: 'markdown', title: 'BioSyft — Software Engineering, Full-Stack',
    description: 'Apr 2026 – present. Full-stack and R&D on a deep-learning platform for pose segmentation in animal drug-trial research.',
    thumbnailUrl: thumbFile('doc-experience-biosyft.jpg'),
    tags: ['experience', 'computer-vision', 'fullstack'], links: ['doc-tennis-pose'],
    path: 'experiences', collectionIds: ['experiences'], contentUrl: content('doc-experience-biosyft'),
    associated: [], createdAt: '2026-04-01T00:00:00.000Z', updatedAt: now,
    meta: { org: 'BioSyft', period: 'Apr 2026 – present', layout: 'preview-left' },
  },
  {
    id: 'doc-experience-seal', type: 'markdown', title: 'UW SEAL Lab — Software Engineering, Web',
    description: 'Jul – Nov 2024. Built the lab\'s ad service and internal tooling, and brought a legacy financial manager back under test.',
    thumbnailUrl: thumbFile('doc-experience-seal.jpg'),
    tags: ['experience', 'web', 'dotnet'], links: [],
    path: 'experiences', collectionIds: ['experiences'], contentUrl: content('doc-experience-seal'),
    associated: [], createdAt: '2024-07-01T00:00:00.000Z', updatedAt: now,
    meta: { org: 'University of Washington SEAL Lab', period: 'Jul 2024 – Nov 2024', layout: 'preview-left' },
  },
  {
    id: 'doc-experience-liberated', type: 'markdown', title: 'Liberated Logic — Software Engineering',
    description: 'Jun – Aug 2023. Led frontend delivery on a seed-stage team, taking an AI messaging app from nothing to a working MVP.',
    thumbnailUrl: thumbFile('doc-experience-liberated.jpg'),
    tags: ['experience', 'frontend', 'startup'], links: [],
    path: 'experiences', collectionIds: ['experiences'], contentUrl: content('doc-experience-liberated'),
    associated: [], createdAt: '2023-06-01T00:00:00.000Z', updatedAt: now,
    meta: { org: 'Liberated Logic', period: 'Jun 2023 – Aug 2023', layout: 'preview-left' },
  },
  {
    id: 'doc-experience-bluedot', type: 'markdown', title: 'BlueDot — Technical AI Safety',
    description: 'The technical AI-safety programme behind the alignment and evaluation work in this workspace.',
    thumbnailUrl: thumbFile('doc-experience-bluedot.jpg'),
    tags: ['experience', 'ai-safety', 'certificate'], links: ['doc-backdoors'],
    path: 'experiences', collectionIds: ['experiences'], contentUrl: content('doc-experience-bluedot'),
    associated: [], createdAt: '2026-03-01T00:00:00.000Z', updatedAt: now,
    meta: { org: 'BlueDot Impact', layout: 'preview-left' },
  },
  {
    id: 'doc-experience-uw', type: 'markdown', title: 'University of Washington — Allen School',
    description: 'BSc Computer Science with minors in Mathematics and Data Science, expected 2028.',
    thumbnailUrl: thumbFile('doc-experience-uw.jpg'),
    tags: ['experience', 'study'], links: [],
    path: 'experiences', collectionIds: ['experiences'], contentUrl: content('doc-experience-uw'),
    associated: [], createdAt: '2024-09-01T00:00:00.000Z', updatedAt: now,
    meta: { org: 'University of Washington', period: 'Expected 2028', layout: 'preview-left' },
  },
];

export const documentById = new Map(documents.map((d) => [d.id, d]));

// ── Markdown bodies (pdf docs serve their file from `public/documents/`) ──────
export const markdownBodies: Record<string, string> = {
  'doc-nemi-absence': `# When the Circuit Isn't There: Establishing Absence in a Behavioral Sequence Model\n\n*Accepted for poster presentation at the 3rd New England Mechanistic Interpretability (NEMI) Workshop, Boston University, August 2026.*\n\n## Abstract\n\nMotion Sequencing tokenizes mouse behavior into a fixed vocabulary of discrete movement primitives, and prior work reports that appending an empirical first-order transition matrix to token-frequency features yields no statistically meaningful gain. This result is often read as suggestive but rarely interrogated against what a sequence model computes.\n\nUsing the public moseq-drugs deposit (501 open-field sessions, 15 compounds across 6 clinical classes plus vehicle, 45 drug–dose conditions) with the tokenizer held fixed, we replicate that null and show it is stronger than reported. Scoring every model on mice absent from its training set, the transition matrix does not merely fail to help: it degrades macro-F1 from 0.667 ± 0.040 to 0.569 ± 0.048.\n\nFour independent manipulations then converge on the absence of any sequential signal. Hashed 2/3/4-gram features (−0.003) and a single-layer 64-unit GRU with full access to order and duration (−0.0002) are indistinguishable from frequency alone. A surrogate decomposition separates timing from ordering: destroying drug-time alignment costs −0.0288 ± 0.0070, whereas destroying sequential structure beyond that costs +0.0005 ± 0.0142. Chunk-shuffle performance is flat across block sizes 1–32. Regressing out token frequency collapses performance to 0.094 against a 0.079 floor; label permutation gives p = 0.000.\n\nWhich actions occur, and when they fall in the pharmacokinetic window, is a sufficient statistic for drug class in this representation.\n\nA performance null cannot separate absent signal from inadequate features, so we ask instead whether the trained model represents order at all. It does not. Activation patching recovers no subspace whose intervention shifts the class logit beyond its random-subspace null (best normalized recovery 0.11 ± 0.06 across k = 1–8; null median 0.09), and Distributed Alignment Search trained to align a hidden subspace with an order-dependent variable reaches interchange-intervention accuracy 0.52 ± 0.04 against 0.50 chance.\n\nThe same pipeline finding nothing is not a method failure. On synthetic sequences from a known HMM whose two conditions have identical token frequencies by construction (Cohen's d = 0.022; a frequency-only model at 0.458) and differ only by an inserted duration dependency, it recovers the planted computation at interchange-intervention accuracy 0.966.\n\nThe control also yields a methodological caution: the random-subspace null is bimodal, with 8% of random 3-d subspaces matching the recovered subspace. High IIA against a mean-valued random baseline can misreport localization when that baseline is not unimodal.\n\nAblation without a calibrated control is a failed search effort. With one, it can serve as a measurement.\n\n## Reference\n\n- **Record** — https://zenodo.org/records/21970594\n- **DOI** — [10.5281/zenodo.21970594](https://doi.org/10.5281/zenodo.21970594)\n- **Venue** — [NEMI 2026 accepted work](https://nemiconf.github.io/summer26/accepted_work.html)\n\nThe behavioural-video side of this is the same ground I work on at [BioSyft](doc-experience-biosyft).`,
  'doc-vit-positional': `# Does Positional Information Causally Constrain Background Shortcut Reliance in Vision Transformers?\n\n*Preprint · Zenodo · August 2026*\n\n## Abstract\n\nVision Transformers (ViTs) match or exceed the strongest architectures for object recognition, but, like Convolutional Neural Networks (CNNs), they can exploit image backgrounds rather than foreground, focused objects. Whether a ViT's positional encoding causally governs this reliance has not been thoroughly tested in the literature, and it is also unclear whether rotary encodings (RoPE) constrain such shortcuts more effectively than absolute encodings (APE). In this work, we probe this assumption by scaling the positional signal of eight identically trained ViT checkpoints and measuring the resulting changes in background reliance on ImageNet-9. We find that attenuating the positional signal monotonically raises background reliance in every model (for example, from 5.1 to 12.8 percentage points), that the effect is invariant to the encoding scheme, and that the effect is specific to spatial information loss. These findings extend to the Waterbirds dataset (Sagawa et al., 2020). We investigate several mechanisms and find little evidence that any single mechanism carries the effect.\n\n## Key findings\n\n- **A causal link.** Attenuating the functional positional signal within frozen ViT checkpoints monotonically increases background reliance across all eight tested models.\n- **Encoding agnosticism.** The effect is independent of the encoding scheme used (APE, RoPE-Axial, RoPE-Mixed, and hybrids); all schemes were found to be statistically equivalent, challenging the assumption that rotary encodings are more robust to these shortcuts.\n- **Spatial, not capacity.** The effect is specific to the loss of spatial information, and it carries beyond ImageNet-9 to Waterbirds.\n\n## Reference\n\n- **Preprint** — https://zenodo.org/records/21971017\n- **DOI** — [10.5281/zenodo.21971017](https://doi.org/10.5281/zenodo.21971017)\n- **Code** — https://github.com/sks17/posvit`,
  'doc-drone-mapping': `# Drone Mapping Startup (T65 Redbull Ideathon Nationally)\n\nAn autonomous drone swarm that walks into an unknown interior and comes back out with a map. A fleet of drones divides the space between them, explores it in parallel, and reports coverage as it goes — no operator flying anything by hand.\n\nThe clip is the swarm-scan simulator: five drones under an active-scan mission, each with its own battery and state, filling in object coverage as they sweep the structure.\n\n## The idea\n\n- **Swarm, not a single drone** — the space is partitioned between drones, so coverage scales with the fleet.\n- **Autonomous exploration** — each drone picks its own next target, and idles when its region is done.\n- **Live coverage read-out** — objects scanned, objects pending, and per-drone battery and state, all in one HUD.\n\nTaken to the national Red Bull Ideathon, where it placed in the top 65 nationally.`,
  'doc-tennis-pose': `# Pose Segmentation for Tennis Serves\n\nSegmenting the tennis serve, frame by frame, into the phases a coach actually talks about — using the pose technology already proven on the baseball pitch and pointing it at a stroke with the same load, rotation and release structure.\n\n- **Borrowed from baseball.** The pitch and the serve share a kinetic chain, so the segmentation approach transfers.\n- **Headed for the App Store.** The target is a phone propped at the side of the court, not a lab.\n\n*In progress — it grows out of the pose work at [BioSyft](doc-experience-biosyft).*`,
  'doc-pairs-trading': `# Quantitative Pairs Trading\n\nA quantitative research pipeline built on pairs trading. It downloads historical stock prices, identifies correlated pairs, generates mean-reversion signals with the Ornstein–Uhlenbeck process, and produces the visualisations needed to validate the trading assumptions and evaluate performance.\n\n## How it works\n\n- **Data acquisition** — daily OHLCV from Yahoo Finance across a configurable universe (technology, financials, energy, consumer goods).\n- **Price panel** — raw prices become an aligned date × symbol matrix, forward-filled, with no lookahead bias.\n- **Pair selection** — rolling correlation analysis; only pairs above a threshold (default 0.7) are traded.\n- **Signal generation** — log-price spreads with dynamic hedge ratios, rolling z-scores, enter at |z| > 2.0 and exit at |z| < 0.5.\n- **Performance analysis** — trades simulated with realistic transaction costs; CAGR, Sharpe and maximum drawdown.\n- **Reporting** — 25+ research-grade plots validating the statistical assumptions.\n\n## Stack\n\nPython 3.10+, Pandas, NumPy, yfinance, Matplotlib, SciPy, scikit-learn and PyArrow (Parquet).\n\n## Sample results\n\nA two-year backtest (2024–2026): 10 pairs analysed, 98 trades executed, correlations from 0.79 to 0.91, roughly 49 trades a year.`,
  'doc-walls': `# WALLS\n\nA Flask + PyTorch mental-health screening platform with a local demo mode and optional Firebase authentication. It runs survey-based screening for stress, anxiety and depression, and turns the model's predictions into metrics on an interactive dashboard.\n\nThe platform is built to work both online (Firebase) and offline (local CSV storage), which makes it usable for demonstrations, presentations and deployments where cloud dependencies aren't available.\n\n## Features\n\n- **Assessment and inference** — a screening flow for stress, anxiety and depression, run through a PyTorch model, with prediction history and metrics endpoints behind it.\n- **Dashboard** — 2D charts via Chart.js, 3D components via Three.js, and history and metrics backfilled from storage.\n- **Demo mode** — no Firebase required; local CSV persistence plus a seed script for consistent presentation data.\n- **Optional Firebase** — Firebase Admin and Firestore when credentials are present, falling back to the local store when they aren't.\n\n## Architecture\n\nThe browser loads Flask-rendered templates and static JS; the frontend calls \`/api/v2/*\` for predictions, history and metrics; the backend runs inference and stores results through a storage abstraction — Firestore when configured, a CSV demo store when not.\n\n- **Frontend** — Flask templates + vanilla JavaScript\n- **ML layer** — PyTorch, inference typically under 100 ms\n- **Visualisation** — Chart.js for 2D, Three.js for 3D\n- **Backend** — Flask API with RESTful endpoints\n- **Storage** — dual-mode: Firebase Firestore or local CSV\n\n## Why it exists\n\nWALLS provides accessible mental-health screening through a web interface that works anywhere, with or without cloud infrastructure — academic demos, healthcare settings with privacy restrictions, and deployments with limited connectivity.`,
  'doc-data-science': `# High School Data Science\n\nA collection of data science projects completed for assignments during high school: data cleaning, exploratory analysis, statistical modelling and visualisation, all in Python's scientific stack.\n\n## Tools\n\nPython, Pandas, GeoPandas, NumPy, scikit-learn, Matplotlib and Seaborn.\n\n## Highlights\n\n- **Cleaning** — real-world datasets needing missing-value handling, de-duplication, format normalisation and outlier treatment.\n- **Exploratory analysis** — histograms, scatter plots, correlation matrices and distribution plots to find the structure in the data.\n- **Statistical modelling** — regression, classification and clustering from scikit-learn, depending on what the project needed.\n- **Geospatial analysis** — GeoPandas for spatial work, including choropleth maps.\n\nThese were my first steps into data science: wrangling, hypothesis testing, model evaluation, and telling a story with a plot.`,
  'doc-determinant-art': `# Determinant Wallpapers\n\nThe entire background of this website is generated by brute-force linear algebra: search for the binary matrices with maximised determinants, colour each by its determinant, tile them, blur. What sits behind the hero is the output.`,
  'doc-experience-biosyft': `# BioSyft — Software Engineering, Full-Stack\n\n*Seattle · April 2026 – present*\n\nI work across the stack on a deep-learning platform for **pose segmentation** in animal drug-trial research. I wrote the system-design document and the REST API contract the platform is built on, and the test suite that has to pass before anything reaches production.\n\nOn the data path I replaced JSON-over-HTTP with an **Apache Arrow** columnar transport inside FastAPI, which is what lets a study of half a million points open more or less immediately instead of leaving a researcher waiting.\n\nI also built the behavioural-analysis dashboard the team uses to read video rodent studies — React and deck.gl — and a cluster-refinement interface over UMAP and HDBSCAN, so an analyst can correct an embedding by hand rather than re-running a pipeline and hoping.\n\nThe pose work is what [pose segmentation for tennis serves](doc-tennis-pose) grows out of.`,
  'doc-experience-seal': `# UW SEAL Lab — Software Engineering, Web\n\n*Sensors, Energy & Automation Laboratory, University of Washington · July – November 2024*\n\nI built a **dynamic ad service** in C# and .NET for the lab's placements. Rather than rotating prebaked assets, it assembles each impression at request time, which is what makes the placements responsive to context instead of merely scheduled.\n\nI also took a legacy financial manager written in Java and rewrote it, bringing it from almost no test coverage to a suite the lab could actually trust, and built the internal tooling — web, WordPress and Apps Script — that took recurring reporting off people's desks.`,
  'doc-experience-liberated': `# Liberated Logic — Software Engineering\n\n*Seed-stage startup, Seattle · June – August 2023*\n\nI led frontend delivery on a four-person Agile team and took an **AI messaging app** from nothing to a working MVP over a Firebase backend in six weeks.\n\nAlongside it I wrote the Jest suite and wired it into GitHub Actions, so a small team moving quickly could keep shipping without quietly breaking each other's work.`,
  'doc-experience-bluedot': `# BlueDot — Technical AI Safety\n\nBlueDot's technical AI-safety programme: alignment, evaluation, and the failure modes that show up when you actually measure a model rather than assume it.\n\nIt is the background behind [the backdoor-evaluation work](doc-backdoors) — the argument there, that an evaluation can look robust simply because the trigger never reached the model, is exactly the kind of measurement failure the course spends its time on.`,
  'doc-experience-uw': `# University of Washington — Paul G. Allen School\n\n*BSc Computer Science, minors in Mathematics and Data Science · expected 2028*\n\nCoursework worth naming: data structures, software design, and machine learning.\n\nMost of what is in this workspace started as something I wanted to understand properly — computer vision, AI safety, and the maths underneath both.`,
};
