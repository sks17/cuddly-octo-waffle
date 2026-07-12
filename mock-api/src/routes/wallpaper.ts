/**
 * Wallpaper: the 50-entry cache (25 dark + 25 light), generated locally.
 * No calls to the wallpaper API — this mirrors the prod plan of prebaking the
 * cache with the generator and serving it statically.
 */
import { Hono } from 'hono';
import { wallpaperById, wallpaperSeed, wallpapers } from '../fixtures.js';
import { wallpaperSpec, wallpaperSvg } from '../generators.js';
import type { ThemeVariant } from '../types.js';

const wallpaper = new Hono();

wallpaper.get('/manifest', (c) =>
  c.json({
    count: wallpapers.length,
    dark: wallpapers.filter((w) => w.variant === 'dark'),
    light: wallpapers.filter((w) => w.variant === 'light'),
  }),
);

/** Deterministic rotation: same seed → same wallpaper (stable across reloads). */
wallpaper.get('/rotate', (c) => {
  const variant = c.req.query('variant') as ThemeVariant | undefined;
  const pool = variant ? wallpapers.filter((w) => w.variant === variant) : wallpapers;
  if (pool.length === 0) return c.json({ error: 'empty pool' }, 404);
  const seed = Number(c.req.query('seed') ?? Date.now());
  const picked = pool[Math.abs(seed) % pool.length];
  return c.json(picked);
});

/** Render-spec so the client can paint the wallpaper on a canvas instead. */
wallpaper.get('/:id/spec', (c) => {
  const w = wallpaperById.get(c.req.param('id'));
  if (!w) return c.json({ error: 'unknown wallpaper' }, 404);
  return c.json(wallpaperSpec(w.palette, wallpaperSeed(w.id)));
});

/** The wallpaper image (`/wallpaper/<id>.svg`). */
wallpaper.get('/:file', (c) => {
  const id = c.req.param('file').replace(/\.svg$/, '');
  const w = wallpaperById.get(id);
  if (!w) return c.json({ error: 'unknown wallpaper' }, 404);
  return c.body(wallpaperSvg(w.palette, wallpaperSeed(w.id)), 200, { 'Content-Type': 'image/svg+xml' });
});

export default wallpaper;
