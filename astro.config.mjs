// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Server output so the maintenance middleware runs on *every* request
  // (its stated intent: "every route on the site returns the splash").
  output: 'server',
  adapter: vercel()
});
