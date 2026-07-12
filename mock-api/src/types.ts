/**
 * Contract types for the external services the website consumes.
 *
 * These interfaces ARE the spec: the real Atlas / Wallpaper / Chat / GraphView
 * services must honour the same shapes. The frontend talks to all of them
 * through small typed "ports", so this mock and the production services are
 * interchangeable by base URL alone.
 */

// ────────────────────────────────────────────────────────────────────────────
// Atlas — documents & collections
// ────────────────────────────────────────────────────────────────────────────

export type DocType = 'markdown' | 'pdf';

/**
 * An arbitrary extra file associated with a document. `kind` and `mime` are
 * free-form, so a markdown can carry a video, an audio clip, a dataset, a
 * 3D model — anything. The UI decides how (or whether) to render each `kind`.
 */
export interface AssociatedFile {
  id: string;
  kind: string; // e.g. 'video' | 'audio' | 'image' | 'dataset' | 'model' | …
  mime: string; // e.g. 'video/mp4', 'text/csv'
  title?: string;
  url: string;
}

export interface Document {
  id: string;
  type: DocType;
  title: string;
  description?: string;
  thumbnailUrl: string;
  tags: string[];
  /** Outgoing links to other document ids — these become the graph edges. */
  links: string[];
  /** Slash-path for the file-explorer hierarchy, e.g. "work/trading". */
  path: string;
  /** Which collections/sections this document belongs to. */
  collectionIds: string[];
  /** Where the body (markdown text or pdf bytes) is fetched from. */
  contentUrl: string;
  /** Extra files of any type attached to this document. */
  associated: AssociatedFile[];
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, unknown>;
}

/** A page/section: a curated, ordered set of documents. */
export interface Collection {
  id: string;
  title: string;
  description?: string;
  documentIds: string[];
}

export interface AtlasManifest {
  version: string;
  generatedAt: string;
  documents: Document[];
  collections: Collection[];
}

// ────────────────────────────────────────────────────────────────────────────
// Wallpaper — the cached, rotated theme wallpapers (25 dark + 25 light)
// ────────────────────────────────────────────────────────────────────────────

export type ThemeVariant = 'dark' | 'light';

export interface ThemePalette {
  bg: string;
  fg: string;
  sub: string;
  accent: string;
}

export interface Wallpaper {
  id: string;
  name: string;
  variant: ThemeVariant;
  palette: ThemePalette;
  /** A ready-to-use image (SVG here; a PNG/URL from the Fly renderer in prod). */
  url: string;
  /** Optional render-spec so the client can paint it on a canvas instead. */
  specUrl: string;
}

export interface WallpaperManifest {
  /** Size of the cache; 50 by design (25 + 25). */
  count: number;
  dark: Wallpaper[];
  light: Wallpaper[];
}

// ────────────────────────────────────────────────────────────────────────────
// GraphView — navigation graph, breadcrumbs, RAG context, search
// ────────────────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  title: string;
  type: DocType;
  tags: string[];
  degree: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  kind?: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** One step in the header breadcrumb trail. */
export interface Crumb {
  id: string;
  title: string;
}

/** A retrieved chunk used as chat RAG context or as a search hit. */
export interface Hit {
  docId: string;
  title: string;
  snippet: string;
  score: number;
}

export type SearchMode = 'basic' | 'rich';

export interface SearchResult {
  mode: SearchMode;
  query: string;
  hits: Hit[];
  /** `rich` mode also returns related graph nodes for exploration. */
  related?: GraphNode[];
}

// ────────────────────────────────────────────────────────────────────────────
// Chat — request shape (response is an OpenAI-style SSE stream)
// ────────────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  /** Optional anchor document to ground the answer (RAG via GraphView). */
  docId?: string;
}
