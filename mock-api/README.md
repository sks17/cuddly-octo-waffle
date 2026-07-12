# far-flare mock API

A **light, local-dev stand-in** for the external services the website consumes.
It implements the same contracts (`src/types.ts`) the real services must honour,
so the frontend's ports point at `http://localhost:8787` in dev and at the real
Atlas / GraphView / chat / wallpaper endpoints in production — swappable by base
URL alone.

Nothing here is the website. It's the *environment* the website is developed against.

## Run

```bash
cd mock-api
npm install
npm run dev        # http://localhost:8787  (PORT env to change)
```

`npm run typecheck` type-checks without emitting.

## What it mocks

| Area | Endpoints | Notes |
|---|---|---|
| **Atlas** | `GET /atlas/manifest` · `/atlas/documents[/:id][/content]` · `/atlas/collections[/:id]` · `/atlas/thumbnails/:id.svg` · `/atlas/assets/:docId/:name` | Markdown + PDF docs. PDFs are generated valid PDFs; thumbnails are generated SVGs. |
| **Associated files** | `Document.associated[]` | Any extra file of any `kind`/`mime` (video, audio, dataset, image, …) attached to a doc — e.g. a video on a markdown. |
| **Wallpaper** | `GET /wallpaper/manifest` · `/wallpaper/rotate?variant=dark\|light&seed=` · `/wallpaper/:id.svg` · `/wallpaper/:id/spec` | **50-entry cache (25 dark + 25 light), generated locally** — never calls the wallpaper API. `/spec` returns a render-spec for client-side canvas painting. |
| **Chat** | `POST /chat` → SSE | OpenAI-style `data: {choices:[{delta:{content}}]}` chunks then `data: [DONE]`, plus a leading `event: context` frame. RAG context is pulled from the graph (`retrieve.search`). |
| **GraphView** | `GET /graph` · `/graph/neighbors/:id` · `/graph/breadcrumbs/:id` · `/graph/context?q=&k=` | The click-through nav graph, header breadcrumbs, and the RAG context the chat uses. |
| **Search** | `GET /search?q=&mode=basic\|rich&limit=` | The **backend search toggle** (used when in-browser search gets slow). `mode=rich` is the optional GraphView-powered search that also returns related nodes. Default frontend search is client-side and not part of this API. |

## Contracts

All shapes live in [`src/types.ts`](src/types.ts) — the single source of truth for
what the real services must return. Highlights:

- `Document.links[]` → graph edges; `Document.path` → file-explorer hierarchy;
  `Document.collectionIds[]` → pages/sections.
- `Document.associated[]` → arbitrary extra files (the "any file type" feature).
- `Wallpaper` carries a `palette` + both an `url` (SVG) and a `specUrl` (render-spec).

## Production parity

- The **wallpaper cache is prebaked by running the generator locally**, then served
  statically — the same principle in prod (don't call the Fly wallpaper API 50×).
- Chat context/RAG is the **GraphView service's** responsibility; the chat backend
  just consumes it. This mock wires them the same way.
- Everything is CORS-open for local dev.

## Layout

```
src/
  types.ts        # the contracts (the spec)
  fixtures.ts     # mock documents, collections, 50 wallpapers
  generators.ts   # local wallpaper/thumbnail/PDF generators (no external calls)
  retrieve.ts     # graph model + naive search/RAG
  routes/         # atlas · wallpaper · chat · graph · search
  server.ts       # mounts everything under one origin
```
