/**
 * Search (the backend toggle). The frontend does its own client-side search by
 * default; this endpoint is the fallback when there are too many markdowns to
 * search quickly in the browser. `mode=rich` is the optional GraphView-powered
 * search that also returns related graph nodes.
 */
import { Hono } from 'hono';
import type { SearchMode } from '../types.js';
import { relatedNodes, search } from '../retrieve.js';

const s = new Hono();

s.get('/', (c) => {
  const query = c.req.query('q') ?? '';
  const mode: SearchMode = c.req.query('mode') === 'rich' ? 'rich' : 'basic';
  const limit = Number(c.req.query('limit') ?? 10);
  const hits = search(query, limit);
  if (mode === 'rich') {
    return c.json({ mode, query, hits, related: relatedNodes(hits.map((h) => h.docId)) });
  }
  return c.json({ mode, query, hits });
});

export default s;
