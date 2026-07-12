# Decisions

A lightweight decision log (ADR-lite). Newest context at the top of each entry.
All entries **Accepted 2026-07-12** unless noted. See [ARCHITECTURE.md](ARCHITECTURE.md)
for how they fit together.

---

### 1. Rebuild from scratch; archive the old site
The previous site (by an earlier generation of agents) was low quality. It's moved
untouched into `archaic/`, and a maintenance splash (Astro middleware, on Vercel)
stays live during the rebuild. **Consequence:** clean slate; the splash is disposable.

### 2. App = Vite + React static SPA (not Astro)
The flagship features (a persistent tiling/tab workspace, chat, graph) make this an
*app shell*, and content is external, so Astro's MPA/static-content strengths don't
apply. **Consequence:** a single static SPA; shadcn/Base UI/Tailwind carry over
unchanged. The Astro splash is retired at cutover.

### 3. UI = shadcn/ui + Base UI + Tailwind
Owned, themeable components on accessible primitives. `@base-ui/react` is the
primitive layer (a swap for shadcn's default Radix). **Consequence:** design lives
as tokens; the Ink look is a theme + blocks.

### 4. Design direction = "Ink Islands"
Netflix-style billboard hero (logo `sks17`, nav, name + blurb on the tinted
wallpaper), sharp content islands with thin margins/small gaps on an ambient,
faintly-spotlit determinant wallpaper; graph + file-explorer navigation.

### 5. Engine vs. Atlas separation
The site is a thin renderer; all content is external data (`atlas.json` + assets),
fetched at runtime. **Consequence:** content updates need no redeploy; the engine
only changes to add capabilities.

### 6. Ports & adapters for every external integration
Each capability is a typed port fulfilled by embed → direct API → thin Pages-Function
proxy → Fly service, swappable without touching the UI. **Why:** perfect iframe/embed
may not be possible for some integrations (e.g. chat). **Consequence:** integration
shape can change late with near-zero blast radius.

### 7. Hosting = Cloudflare Pages + Pages Functions
Chosen over Vercel for cost/flexibility (Pages Functions free tier, R2 zero-egress)
while keeping Git-connected "push → auto-deploy" + preview URLs. Move the custom
domain's DNS/nameservers to Cloudflare; keep the Vercel splash live until launch,
then cut over and retire Vercel. **Fly** is reserved for real backends (currently
only the wallpaper generator).

### 8. Workspace = dockview
Gives both Obsidian tabs and tmux splits with a serializable layout (persist/restore/
share) in one library. It's the one large dependency and earns its place — it *is*
the flagship feature. **Alternatives considered:** react-mosaic (tiling only),
flexlayout-react, rc-dock.

### 9. Wallpaper = cache-first; generate locally, don't call the API 50×
The determinant generator stays live on Fly, but the 50-image cache (25 dark + 25
light, keyed to theme palettes) is **prebaked by running the generator locally**,
served statically, and rotated on load. A render-spec allows crisp client-side canvas
painting. **Consequence:** fast first paint, no cold-start dependency; no changes to
the Fly `app.py`.

### 10. Chat = provided backend *and* client; site only integrates
The site points at an external chat service (an OpenAI-backed streaming endpoint) and
mounts a provided client; RAG/context is the **GraphView** service's job. **Consequence:**
the site ships ~no chat code — just a `ChatPort` (see decision 6).

### 11. Search = frontend default, backend toggle, rich secondary
Default search is client-side. A backend `mode=basic` is a toggle used only when
in-browser search gets slow at scale. A GraphView `mode=rich` (graph-aware) is an
opt-in secondary. **Consequence:** no server needed for the common case.

### 12. Markdown safety = react-markdown + sanitize; no MDX
Content is external, so it must never execute code. Custom components are registered
in-app and embedded via safe directives, not MDX. **Consequence:** untrusted content
is safe; custom blocks are still first-class.

### 13. Documents carry arbitrary "associated files"
`Document.associated[]` holds extra files of any `kind`/`mime` (video, audio, dataset,
model, …) — e.g. a video attached to a markdown. The UI chooses how (or whether) to
render each kind. **Consequence:** the content model extends without schema churn.

### 14. Local-dev mock API (Hono + TypeScript)
A committed `mock-api/` implements every external-service contract so the frontend
can be built locally against real shapes; `src/types.ts` is the shared spec. Runs on
Node now, portable to Cloudflare later. **Consequence:** frontend and services are
developed independently.

### 15. Architecture strength = "medium"
Keep engine/Atlas split, ports, feature folders, strict types. Defer formal
`View`/`Block`/`Command` registries (start with a plain `type → component` map) and
skip heavy ADR ceremony (this file suffices). **Why:** low-code/low-chore is a first
goal; add structure only when growth demands it.

### 16. Cross-platform = one responsive PWA
Installable on every OS from the browser, offline shell, no native builds. Native
shells (Capacitor/Tauri) are a future option over the same code, not a current need.

---

## Open / deferred

- **Chat integration shape** — iframe URL vs web component vs SDK vs bare API: TBD;
  the `ChatPort` covers all four. Decides which fulfillment ships first.
- **Atlas transport** — static `atlas.json` on a CDN (default) vs a live API.
- **Mobile workspace UX** — how tiling degrades to a tab strip on small screens
  (design pass pending).
