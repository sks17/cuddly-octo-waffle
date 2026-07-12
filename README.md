# Saksham Singh — personal site

This repository is currently in **maintenance mode** while the site is rebuilt from scratch.

## What's live

A minimal Astro app whose only job is to serve a "Coming Soon" splash:

- `src/middleware.ts` — the maintenance splash. Its `onRequest` returns the splash
  HTML for **every** request. This is the single source of truth for what visitors see.
- `src/pages/index.astro` — a placeholder route so Astro has something to build. Its
  content is never rendered (the middleware intercepts first).
- `astro.config.mjs` — `output: 'server'` + the Vercel adapter, so the middleware runs
  on every request.
- `vercel.json` — minimal Astro/Vercel config.
- `public/favicon.svg` — favicon referenced by the splash.

Deploys to Vercel from `main`. To take the site out of maintenance, replace the
middleware (or `return next()` from it) once the new site exists.

## `archaic/`

The entire previous website (built by an earlier generation of AI agents) has been
moved here, untouched, for reference. It is **not** part of the build. Highlights:

- `archaic/app.py` — Flask "Mathematical Wallpaper Generator" API (linear-algebra /
  determinant-based wallpaper generator) that was deployed to Fly.io
  (`archaic/Dockerfile`, `archaic/fly.toml`).
- `archaic/src/` — the old Astro site (components, pages, layouts, scripts, styles).
- `archaic/LinearAlgebraWallpapers/` — original Java/experimentation origin of the
  generator plus generated PNGs.
- `archaic/*.md` — the old design/analysis/deployment docs.
- `archaic/.env*` — old environment files (only ever held the public `PUBLIC_API_URL`).

Nothing in `archaic/` contains secrets or credentials.
