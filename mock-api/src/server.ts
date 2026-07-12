/**
 * Local dev mock server. Mounts every external-service port under one origin so
 * the frontend's adapters can point at http://localhost:8787 in development.
 */
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import atlas from './routes/atlas.js';
import wallpaper from './routes/wallpaper.js';
import chat from './routes/chat.js';
import graph from './routes/graph.js';
import search from './routes/search.js';

const app = new Hono();
app.use('*', cors());

app.get('/health', (c) => c.json({ ok: true }));

app.get('/', (c) =>
  c.json({
    name: 'far-flare mock API',
    endpoints: {
      atlas: ['/atlas/manifest', '/atlas/documents', '/atlas/documents/:id', '/atlas/documents/:id/content', '/atlas/collections', '/atlas/thumbnails/:id.svg', '/atlas/assets/:docId/:name'],
      wallpaper: ['/wallpaper/manifest', '/wallpaper/rotate?variant=dark|light', '/wallpaper/:id.svg', '/wallpaper/:id/spec'],
      chat: ['POST /chat  (SSE stream)'],
      graph: ['/graph', '/graph/neighbors/:id', '/graph/breadcrumbs/:id', '/graph/context?q='],
      search: ['/search?q=&mode=basic|rich'],
    },
  }),
);

app.route('/atlas', atlas);
app.route('/wallpaper', wallpaper);
app.route('/chat', chat);
app.route('/graph', graph);
app.route('/search', search);

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`\n  far-flare mock API → http://localhost:${info.port}\n  index: http://localhost:${info.port}/\n`);
});

export default app;
