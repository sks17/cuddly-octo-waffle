import type { AtlasCollection, AtlasDocument, AtlasManifest, SearchMode, SearchResult } from './types';

/**
 * The Atlas port. Base URL is config: the mock API in dev, the real service in
 * prod — the site never changes, only `VITE_ATLAS_URL`.
 */
const env = import.meta.env as { VITE_ATLAS_URL?: string };
const BASE = (env.VITE_ATLAS_URL ?? 'http://localhost:8787').replace(/\/$/, '');

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Atlas ${res.status} on ${path}`);
  return (await res.json()) as T;
}

/** Absolute URL for a manifest-relative asset path (thumbnails, content, assets). */
const abs = (url: string): string => (url.startsWith('http') ? url : `${BASE}${url}`);

export const atlas = {
  base: BASE,
  abs,
  manifest: () => get<AtlasManifest>('/atlas/manifest'),
  document: (id: string) => get<AtlasDocument>(`/atlas/documents/${id}`),
  collections: () => get<AtlasCollection[]>('/atlas/collections'),
  collection: (id: string) => get<AtlasCollection>(`/atlas/collections/${id}`),
  markdown: async (id: string) => (await fetch(`${BASE}/atlas/documents/${id}/content`)).text(),
  contentUrl: (id: string) => `${BASE}/atlas/documents/${id}/content`,
  thumbUrl: (id: string) => `${BASE}/atlas/thumbnails/${id}.svg`,
  search: (q: string, mode: SearchMode = 'basic') =>
    get<SearchResult>(`/search?q=${encodeURIComponent(q)}&mode=${mode}`),
};
