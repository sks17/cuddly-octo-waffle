/**
 * Graph model + naive retrieval, shared by the GraphView and Search routes.
 * In production this is the GraphView service's job (real embeddings/RAG); the
 * mock uses simple term matching so the frontend has something to talk to.
 */
import type { Graph, GraphEdge, GraphNode, Hit } from './types.js';
import { documentById, documents, markdownBodies } from './fixtures.js';
import { snippet } from './generators.js';

/** Text used for retrieval — markdown body, or a synthesized blob for PDFs. */
export function bodyText(id: string): string {
  const doc = documentById.get(id);
  if (!doc) return '';
  return markdownBodies[id] ?? `${doc.title}. ${doc.description ?? ''} ${doc.tags.join(' ')}`;
}

function buildGraph(): Graph {
  const edges: GraphEdge[] = [];
  for (const d of documents) {
    for (const target of d.links) {
      if (documentById.has(target)) edges.push({ source: d.id, target, kind: 'link' });
    }
  }
  const degree = new Map<string, number>();
  for (const e of edges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }
  const nodes: GraphNode[] = documents.map((d) => ({
    id: d.id, title: d.title, type: d.type, tags: d.tags, degree: degree.get(d.id) ?? 0,
  }));
  return { nodes, edges };
}

export const graph: Graph = buildGraph();
export const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

/** Rank documents by simple weighted term matching (title > tags > body). */
export function search(query: string, limit = 10): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return documents
    .map((d) => {
      const title = d.title.toLowerCase();
      const tags = d.tags.join(' ').toLowerCase();
      const body = bodyText(d.id).toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (title.includes(t)) score += 3;
        if (tags.includes(t)) score += 2;
        if (body.includes(t)) score += 1;
      }
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ d, score }) => ({ docId: d.id, title: d.title, snippet: snippet(bodyText(d.id), query), score }));
}

/** Graph neighbours of a set of doc ids (for rich search + chat context). */
export function relatedNodes(docIds: string[]): GraphNode[] {
  const seed = new Set(docIds);
  const out = new Set<string>();
  for (const e of graph.edges) {
    if (seed.has(e.source)) out.add(e.target);
    if (seed.has(e.target)) out.add(e.source);
  }
  for (const id of seed) out.delete(id);
  return [...out].map((id) => nodeById.get(id)).filter((n): n is GraphNode => Boolean(n));
}
