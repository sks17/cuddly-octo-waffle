import type { AtlasDocument } from '@/core/atlas/types';
import { externalUrlFor, layoutForDoc } from '@/core/atlas/meta';
import type { WorkspaceDestination } from '../shell/types';

// Collections that render as a single compiled markdown page rather than a grid.
const COMPILED_COLLECTIONS = new Set(['links']);
export const isCompiledCollection = (id: string): boolean => COMPILED_COLLECTIONS.has(id);

// Collections that are structural/virtual, not shown as the explorer "home" folder.
const AUX_COLLECTIONS = ['featured'];

/** The best folder to reveal for a document (prefer the route's collection). */
function primaryCollection(doc: AtlasDocument, prefer?: string): string | undefined {
  if (prefer && doc.collectionIds.includes(prefer)) return prefer;
  return doc.collectionIds.find((c) => !AUX_COLLECTIONS.includes(c)) ?? doc.collectionIds[0];
}

export function destinationForDoc(doc: AtlasDocument, fromCollection?: string): WorkspaceDestination {
  const folder = primaryCollection(doc, fromCollection);
  return {
    type: 'document',
    docId: doc.id,
    title: doc.title,
    selectedFileId: doc.id,
    explorerPath: folder ? [folder] : undefined,
    openFolders: folder ? [folder] : undefined,
    layout: layoutForDoc(doc),
    thumbnailUrl: doc.thumbnailUrl,
  };
}

/** A lighter variant when only the id/title are known (search hits, links). */
export function destinationForDocRef(ref: { id: string; title: string }): WorkspaceDestination {
  return { type: 'document', docId: ref.id, title: ref.title, selectedFileId: ref.id };
}

export function destinationForCollection(id: string, title: string): WorkspaceDestination {
  const base = { title, explorerPath: [id], openFolders: [id] };
  return isCompiledCollection(id)
    ? { type: 'collection', collectionId: id, ...base }
    : { type: 'folder', collectionId: id, ...base };
}

/** `https://www.example.com/a/b` → `example.com` — a compact label for an outbound link. */
function hostLabel(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Turn a collection's documents into a single markdown page (for compiled pages).
 * The title opens the document in-workspace; any external `meta.url` is offered
 * alongside it so a bookmark stays one click from its source.
 */
export function compileCollectionMarkdown(
  title: string,
  description: string | undefined,
  docs: AtlasDocument[],
): string {
  const head = `# ${title}\n\n${description ? description + '\n\n' : ''}`;
  const list = docs
    .map((d) => {
      const url = externalUrlFor(d);
      const desc = d.description ? ` — ${d.description}` : '';
      const out = url ? ` ([${hostLabel(url)}](${url}))` : '';
      return `- [${d.title}](${d.id})${desc}${out}`;
    })
    .join('\n');
  return head + list + '\n';
}
