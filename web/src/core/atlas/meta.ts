import type { WorkspaceLayout } from '@/workspace/types';
import type { AssociatedFile, AtlasDocument } from './types';

export interface DocMeta {
  layout?: WorkspaceLayout;
  [key: string]: unknown;
}

export const docMeta = (doc: AtlasDocument): DocMeta => (doc.meta ?? {}) as DocMeta;

/** The layout a document requests, narrowed to a valid value. */
export function layoutForDoc(doc: AtlasDocument): WorkspaceLayout {
  const l = docMeta(doc).layout;
  return l === 'preview-left' || l === 'full-workspace' ? l : 'standard';
}

/** The external URL a document points at (link entries carry one in `meta.url`). */
export function externalUrlFor(doc: AtlasDocument): string | undefined {
  const url = docMeta(doc).url;
  return typeof url === 'string' && /^https?:\/\//.test(url) ? url : undefined;
}

/** First associated image (else any associated file) usable as a preview pane. */
export function previewFileFor(doc: AtlasDocument): AssociatedFile | undefined {
  return doc.associated.find((f) => f.kind === 'image' || f.mime.startsWith('image/')) ?? doc.associated[0];
}

export const isVideoFile = (f: AssociatedFile): boolean => f.kind === 'video' || f.mime.startsWith('video/');
export const isPdfFile = (f: AssociatedFile): boolean => f.kind === 'pdf' || f.mime === 'application/pdf';
