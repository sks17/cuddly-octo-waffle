/**
 * Local dev mock server. Mounts every external-service port under one origin so
 * the frontend's adapters can point at http://localhost:8787 in development.
 */
import { serve } from '@hono/node-server';
import app from './app.js';

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`\n  far-flare mock API → http://localhost:${info.port}\n  index: http://localhost:${info.port}/\n`);
});

export default app;
