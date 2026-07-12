/**
 * GraphView: the click-through navigation graph, header breadcrumbs, and the
 * RAG context endpoint the chat relies on.
 */
import { Hono } from 'hono';
import type { Crumb } from '../types.js';
import { documentById } from '../fixtures.js';
import { graph, nodeById, relatedNodes, search } from '../retrieve.js';

const g = new Hono();

const titleCase = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

/** Full graph for the click-through navigator. */
g.get('/', (c) => c.json(graph));

/** One hop out from a node — for progressive graph exploration. */
g.get('/neighbors/:id', (c) => {
  const id = c.req.param('id');
  const edges = graph.edges.filter((e) => e.source === id || e.target === id);
  const nodes = relatedNodes([id]);
  return c.json({ id, nodes, edges });
});

/** Header breadcrumb trail: Home → …path segments… → document. */
g.get('/breadcrumbs/:id', (c) => {
  const doc = documentById.get(c.req.param('id'));
  if (!doc) return c.json({ error: 'document not found' }, 404);
  const crumbs: Crumb[] = [{ id: 'root', title: 'Home' }];
  let acc = '';
  for (const seg of doc.path.split('/').filter(Boolean)) {
    acc = acc ? `${acc}/${seg}` : seg;
    crumbs.push({ id: `path:${acc}`, title: titleCase(seg) });
  }
  crumbs.push({ id: doc.id, title: doc.title });
  return c.json(crumbs);
});

/** RAG context for the chat: top-k relevant chunks + related graph nodes. */
g.get('/context', (c) => {
  const q = c.req.query('q') ?? '';
  const k = Number(c.req.query('k') ?? 4);
  const hits = search(q, k);
  return c.json({ query: q, hits, related: relatedNodes(hits.map((h) => h.docId)) });
});

export default g;
