import type { WorkspaceLayout, WorkspacePresentation } from '../types';

export type { WorkspaceLayout, WorkspacePresentation };

interface DestinationCommon {
  title?: string;
  /** Folder chain to auto-reveal in the explorer tree. */
  explorerPath?: string[];
  /** Leaf highlighted + scrolled into view. */
  selectedFileId?: string;
  /** Folders to force-open (superset of explorerPath). */
  openFolders?: string[];
  /** Split arrangement while expanded; defaults to 'standard'. */
  layout?: WorkspaceLayout;
  thumbnailUrl?: string;
}

/**
 * The single contract every route / click resolves to. Routes never implement
 * explorer behavior directly — they produce a destination and hand it to the shell.
 */
export type WorkspaceDestination =
  | (DestinationCommon & { type: 'document'; docId: string })
  | (DestinationCommon & { type: 'folder'; collectionId: string })
  | (DestinationCommon & { type: 'collection'; collectionId: string }) // compiled markdown page
  | (DestinationCommon & { type: 'project'; projectId: string })
  | (DestinationCommon & { type: 'page'; component: string })
  | (DestinationCommon & { type: 'navigation'; view: string });

/** Stable identity for keys / dedupe / persistence. */
export const destinationId = (d: WorkspaceDestination): string =>
  d.type === 'document'
    ? `doc:${d.docId}`
    : d.type === 'project'
      ? `proj:${d.projectId}`
      : d.type === 'page'
        ? `page:${d.component}`
        : d.type === 'navigation'
          ? `nav:${d.view}`
          : `col:${d.collectionId}`; // folder | collection

export interface ExplorerState {
  openFolders: Record<string, boolean>;
  selectedFileId: string | null;
  width: number;
  scrollTop: number;
}

export interface ShellState {
  presentation: WorkspacePresentation; // centered ⇔ expanded
  layout: WorkspaceLayout; // meaningful only when expanded
  destination: WorkspaceDestination | null; // null ⇒ centered/idle
  explorer: ExplorerState;
  contentScrollTop: number;
  transitioning: boolean; // true during the frame animation
  selectedDoc: { id: string; title: string } | null; // chat context source of truth
}

export const MIN_EXPLORER_W = 180;
export const MAX_EXPLORER_W = 420;
export const DEFAULT_EXPLORER_W = 244;
