/** Atlas: documents, their content/thumbnails/associated files, and collections. */
import { Hono } from 'hono';
import { collections, documentById, documents, markdownBodies } from '../fixtures.js';
import { makePdf, thumbnailSvg } from '../generators.js';

const atlas = new Hono();

/** The whole manifest — the static `atlas.json` equivalent. */
atlas.get('/manifest', (c) =>
  c.json({ version: 'mock-1', generatedAt: new Date().toISOString(), documents, collections }),
);

atlas.get('/documents', (c) => c.json(documents));

atlas.get('/documents/:id', (c) => {
  const doc = documentById.get(c.req.param('id'));
  return doc ? c.json(doc) : c.json({ error: 'document not found' }, 404);
});

/** Body: markdown as text/markdown, PDFs generated on the fly. */
atlas.get('/documents/:id/content', (c) => {
  const doc = documentById.get(c.req.param('id'));
  if (!doc) return c.json({ error: 'document not found' }, 404);
  if (doc.type === 'pdf') {
    return c.body(makePdf(doc.title), 200, { 'Content-Type': 'application/pdf' });
  }
  const md = markdownBodies[doc.id] ?? `# ${doc.title}\n`;
  return c.body(md, 200, { 'Content-Type': 'text/markdown; charset=utf-8' });
});

atlas.get('/collections', (c) => c.json(collections));

atlas.get('/collections/:id', (c) => {
  const col = collections.find((x) => x.id === c.req.param('id'));
  return col ? c.json(col) : c.json({ error: 'collection not found' }, 404);
});

/** Generated SVG thumbnail (`/atlas/thumbnails/<docId>.svg`). */
atlas.get('/thumbnails/:file', (c) => {
  const id = c.req.param('file').replace(/\.svg$/, '');
  const doc = documentById.get(id);
  if (!doc) return c.json({ error: 'unknown thumbnail' }, 404);
  return c.body(thumbnailSvg(doc), 200, { 'Content-Type': 'image/svg+xml' });
});

/**
 * Associated files. The mock returns a labelled SVG placeholder for every kind
 * (real bytes come from the Atlas in prod); the JSON still advertises the true
 * `mime`, so the UI can pick a renderer.
 */
atlas.get('/assets/:docId/:name', (c) => {
  const doc = documentById.get(c.req.param('docId'));
  const name = c.req.param('name');
  const file = doc?.associated.find((a) => a.url.endsWith(name));
  const label = file ? `${file.kind}: ${file.title ?? name}` : name;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270">` +
    `<rect width="480" height="270" fill="#101018"/>` +
    `<text x="240" y="140" fill="#8b8cf7" font-family="ui-monospace,monospace" font-size="20" text-anchor="middle">${label}</text>` +
    `<text x="240" y="170" fill="#6f7079" font-family="ui-monospace,monospace" font-size="12" text-anchor="middle">mock asset placeholder</text></svg>`;
  return c.body(svg, 200, { 'Content-Type': 'image/svg+xml' });
});

export default atlas;
