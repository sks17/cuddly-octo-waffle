/** Contract mirror of the Atlas service (see mock-api/src/types.ts). */
export type DocType = 'markdown' | 'pdf';

export interface AssociatedFile {
  id: string;
  kind: string;
  mime: string;
  title?: string;
  url: string;
}

export interface AtlasDocument {
  id: string;
  type: DocType;
  title: string;
  description?: string;
  thumbnailUrl: string;
  tags: string[];
  links: string[];
  path: string;
  collectionIds: string[];
  contentUrl: string;
  associated: AssociatedFile[];
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, unknown>;
}

export interface AtlasCollection {
  id: string;
  title: string;
  description?: string;
  documentIds: string[];
  /** Markdown closing note, rendered under the collection's items. */
  note?: string;
  meta?: Record<string, unknown>;
}

export interface AtlasManifest {
  version: string;
  generatedAt: string;
  documents: AtlasDocument[];
  collections: AtlasCollection[];
}

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
}
