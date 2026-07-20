import { useEffect, useRef, useState } from 'react';
import { atlas } from './client';
import type { AtlasCollection, AtlasDocument, SearchMode } from './types';

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/** Minimal fetch-on-deps hook (cancels stale results). */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef
      .current()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error: Error) => !cancelled && setState({ data: undefined, loading: false, error }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export const useManifest = () => useAsync(() => atlas.manifest(), []);

export interface ResolvedCollection {
  collection: AtlasCollection;
  docs: AtlasDocument[];
}

/** Every collection with its documents resolved + ordered (one manifest fetch). */
export function useResolvedManifest(): AsyncState<{ collections: ResolvedCollection[] }> {
  return useAsync(async () => {
    const m = await atlas.manifest();
    const byId = new Map(m.documents.map((d) => [d.id, d]));
    const collections = m.collections.map((collection) => ({
      collection,
      docs: collection.documentIds.map((id) => byId.get(id)).filter((d): d is AtlasDocument => !!d),
    }));
    return { collections };
  }, []);
}

export interface CollectionView {
  collection: AtlasCollection | undefined;
  docs: AtlasDocument[];
}

/** A collection plus its resolved, ordered documents. */
export function useCollectionDocs(collectionId: string): AsyncState<CollectionView> {
  return useAsync(async () => {
    const m = await atlas.manifest();
    const collection = m.collections.find((c) => c.id === collectionId);
    const byId = new Map(m.documents.map((d) => [d.id, d]));
    const docs = (collection?.documentIds ?? []).map((id) => byId.get(id)).filter((d): d is AtlasDocument => !!d);
    return { collection, docs };
  }, [collectionId]);
}

export const useDocMarkdown = (id: string | null) =>
  useAsync(() => (id ? atlas.markdown(id) : Promise.resolve('')), [id]);

/** The full document record (title, associated files, meta) — not just its markdown. */
export const useDocument = (id: string | null) =>
  useAsync(() => (id ? atlas.document(id) : Promise.resolve(undefined)), [id]);

export const useSearch = (query: string, mode: SearchMode = 'basic') =>
  useAsync(() => (query.trim() ? atlas.search(query, mode) : Promise.resolve({ mode, query, hits: [] })), [query, mode]);
