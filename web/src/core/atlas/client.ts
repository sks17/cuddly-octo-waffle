import type { AtlasCollection, AtlasDocument, AtlasManifest, SearchMode, SearchResult } from './types';

/**
 * The Atlas port. Base URL is config: the mock API in dev, the real service in
 * prod — the site never changes, only `VITE_ATLAS_URL`.
 *
 * With no base configured, a production build reads the *baked* Atlas served
 * from its own origin (`mock-api`'s snapshot under `/atlas`). That mode has no
 * routing, so per-document and search requests are answered from the manifest
 * instead of by the server — same data, same shapes, no backend.
 */
const env = import.meta.env as { VITE_ATLAS_URL?: string; DEV?: boolean };
const BASE = (env.VITE_ATLAS_URL ?? (env.DEV ? 'http://localhost:8787' : '')).replace(/\/$/, '');
const STATIC = BASE === '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Atlas ${res.status} on ${path}`);
  return (await res.json()) as T;
}

/** Absolute URL for a manifest-relative asset path (thumbnails, content, assets). */
const abs = (url: string): string => (url.startsWith('http') ? url : `${BASE}${url}`);

let manifestOnce: Promise<AtlasManifest> | undefined;
const manifest = (): Promise<AtlasManifest> => {
  manifestOnce ??= get<AtlasManifest>(STATIC ? '/atlas/manifest.json' : '/atlas/manifest');
  return manifestOnce;
};

async function docFromManifest(id: string): Promise<AtlasDocument> {
  const doc = (await manifest()).documents.find((d) => d.id === id);
  if (!doc) throw new Error(`Atlas 404 on document ${id}`);
  return doc;
}

/** The baked search corpus — the same text the mock ranks over. */
interface IndexEntry {
  docId: string;
  title: string;
  tags: string[];
  text: string;
}
let indexOnce: Promise<IndexEntry[]> | undefined;
const searchIndex = (): Promise<IndexEntry[]> => {
  indexOnce ??= get<IndexEntry[]>('/atlas/search-index.json');
  return indexOnce;
};

/** ~140 chars around the first match — mirrors the mock's `snippet()`. */
function snippet(text: string, query: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!query) return clean.slice(0, 140);
  const i = clean.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return clean.slice(0, 140) + (clean.length > 140 ? '…' : '');
  const start = Math.max(0, i - 50);
  return (start > 0 ? '…' : '') + clean.slice(start, start + 140) + '…';
}

/** Title > tags > body term matching — mirrors the mock's `search()`. */
async function searchStatic(query: string, mode: SearchMode, limit = 10): Promise<SearchResult> {
  const q = query.trim().toLowerCase();
  if (!q) return { mode, query, hits: [] };
  const terms = q.split(/\s+/);
  const hits = (await searchIndex())
    .map((e) => {
      const title = e.title.toLowerCase();
      const tags = e.tags.join(' ').toLowerCase();
      const body = e.text.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (title.includes(t)) score += 3;
        if (tags.includes(t)) score += 2;
        if (body.includes(t)) score += 1;
      }
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ e, score }) => ({ docId: e.docId, title: e.title, snippet: snippet(e.text, query), score }));
  return { mode, query, hits };
}

export const atlas = {
  base: BASE,
  abs,
  manifest,
  document: (id: string) =>
    STATIC ? docFromManifest(id) : get<AtlasDocument>(`/atlas/documents/${id}`),
  collections: async () =>
    STATIC ? (await manifest()).collections : get<AtlasCollection[]>('/atlas/collections'),
  collection: async (id: string) => {
    if (!STATIC) return get<AtlasCollection>(`/atlas/collections/${id}`);
    const found = (await manifest()).collections.find((c) => c.id === id);
    if (!found) throw new Error(`Atlas 404 on collection ${id}`);
    return found;
  },
  markdown: async (id: string) => (await fetch(await atlas.contentUrl(id))).text(),
  /** The document's body URL — from the manifest, which knows the baked filename. */
  contentUrl: async (id: string) =>
    STATIC ? abs((await docFromManifest(id)).contentUrl) : `${BASE}/atlas/documents/${id}/content`,
  thumbUrl: (id: string) => `${BASE}/atlas/thumbnails/${id}.svg`,
  search: (q: string, mode: SearchMode = 'basic') =>
    STATIC
      ? searchStatic(q, mode)
      : get<SearchResult>(`/search?q=${encodeURIComponent(q)}&mode=${mode}`),
};
