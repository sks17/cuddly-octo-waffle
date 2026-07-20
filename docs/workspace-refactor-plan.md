Verified against source — all four reports are accurate to `file:line`. The controller/snap/drag/types/globals/persistence shapes are confirmed. Synthesizing now.

---

# FAR-FLARE REFACTOR — AUTHORITATIVE IMPLEMENTATION PLAN (single source of truth)

## DECISION LOG (conflicts resolved — these rulings are binding)

- **D1 — `WorkspaceDestination` shape.** Layout's rich reveal-fields win; data-chat's kind-specific identity wins. Final = **discriminated union on `type`** with a shared `DestinationCommon` base (see §2). Types: `document | folder | collection | project | page | navigation`.
- **D2 — layout naming.** One axis only: `WorkspaceLayout = 'standard' | 'full-workspace' | 'preview-left'`. Data-chat's `DocLayout='reader'` **maps to `'standard'`**. `meta.layout: 'preview-left'` on a doc is the *single* source that both splits the shell and makes `DocView` render preview-left. No separate `DocLayout` type ships.
- **D3 — `--accent` collision.** Canonical **vivid** accent = CSS var `--accent` (provider-set), exposed to Tailwind as `bg-brand`/`text-brand`/`ring`/`bg-primary`. shadcn's `bg-accent`/`hover:bg-accent` **stays subtle** by pointing `--color-accent → --surface-hover`. No primitive rewrites.
- **D4 — `--primary`.** DECISION: `--primary: var(--accent)`, `--primary-foreground: var(--accent-foreground)` (on-brand CTAs — the Monkeytype intent; `accentForeground` is contrast-picked so legibility holds across all 50). Escape hatch: flip to `var(--foreground)` in one line if neutral CTAs are preferred.
- **D5 — taskbar offset.** Rename `--topbar-h` → `--taskbar-h` (60px). The expanded shell offsets by `--taskbar-h`. The Dockview internal tab strip keeps `--wp-tabbar-h` (36px) **inside** the frame — never doubled with the taskbar.
- **D6 — two-layer controller.** New `shell` layer (presentation/destination/explorer) sits **above** the existing `workspace` panel controller. Routes call **only** `shell.openDestination`. Content mounts as Dockview panels via a generalized `workspace.open(dest)`.
- **D7 — content renderers ARE Dockview panel types.** `DocView` (replaces `ReaderPanel`), `CompiledPanel`, `FolderView`, `PageContent`. New `PanelType`s: `folder | compiled | page`.
- **D8 — selected-doc single source of truth** = `useShellStore.selectedDoc`; chat reads it via selector. No duplicate state.
- **D9 — storage key convention** = `far-flare:<domain>:v<n>` for all NEW keys. Legacy `dockview-workspace-layout-v1` kept as-is (debug route only).
- **D10 — snap fix** = adopt engine plan wholesale (unified live rect, real tab-strip hit-test, 2-D size-relative corner metrics, reflow drag-guard, `snapPanel` live area, transitions gated to `.wp-window.is-snapped`).

---

## 1. CANONICAL THEME CONTRACT

### 1.1 TS types — `src/theme/types.ts`

```ts
export type ThemeAppearance = 'dark' | 'light';

/** The 13 resolved semantic colors. All are CSS color strings (opaque hex where possible). */
export interface ThemeColors {
  background: string;
  surface: string;          // cards / islands / explorer / document surfaces
  surfaceElevated: string;  // popovers / menus / floating windows / code blocks
  foreground: string;
  mutedForeground: string;  // secondary text, breadcrumbs, tree leaves
  border: string;           // OPAQUE (see 1.4) so /α modifiers behave
  accent: string;           // vivid theme accent (Monkeytype --main-color)
  accentForeground: string; // contrast-picked text/icon on accent
  selection: string;        // ::selection background
  scrollbarTrack: string;
  scrollbarThumb: string;
  taskbarBackground: string;// translucent (blur look)
  panelShadow: string;      // window/panel box-shadow color
}

export interface AppTheme {
  id: string;               // slug: 'serika-dark'
  name: string;             // exact Monkeytype display: 'serika dark'
  appearance: ThemeAppearance;
  colors: ThemeColors;
}

/** Raw ported palette (accurate) — 13 colors DERIVED from these, not hand-authored. */
export interface MonkeytypePalette {
  bg: string; main: string; caret: string; sub: string;
  subAlt: string; text: string; error?: string;
}
export interface ThemeDefinition {
  id: string; name: string; appearance: ThemeAppearance; palette: MonkeytypePalette;
}
```

- `src/theme/themes.data.ts` exports `THEMES: ThemeDefinition[]` + `DEFAULT_THEME_ID = 'serika-dark'`. Include `'ink'` as a bespoke entry seeded from today's `:root` so the current look is a selectable default. **Port palettes from Monkeytype CSS vars** (`--bg-color,--main-color,--caret-color,--sub-color,--sub-alt-color,--text-color,--error-color`) via a one-off parse script — never hand-guess hex. ~50 themes (serika, serika dark, dracula, nord, gruvbox dark/light, solarized dark/light, catppuccin, rose pine + dawn/moon, iceberg dark/light, sonokai [= "monokai"], … full list from theme report §e).
- `src/theme/derive.ts` — `deriveTheme(def): AppTheme` using CSS `color-mix()` strings (no JS color math except `accentForeground`):
  - `background=bg`, `surface=subAlt`, `surfaceElevated=color-mix(in srgb, subAlt 82%, text)` (dark; flip toward `bg` on light), `foreground=text`, `mutedForeground=sub`, `accent=main`, `selection=color-mix(in srgb, main 30%, transparent)`, `scrollbarThumb=color-mix(in srgb, sub 40%, transparent)`, `scrollbarTrack=transparent`, `taskbarBackground=color-mix(in srgb, bg 72%, transparent)`, `panelShadow= dark?'rgba(0,0,0,.7)':'rgba(0,0,0,.18)'`.
  - `border` OPAQUE: `color-mix(in srgb, sub 26%, bg)`.
  - `accentForeground = contrastPick(main, [bg, text])` — the only JS (WCAG luminance pick). `appearance` drives blend directions + the contrast default.
  - Optional: `--destructive` from `palette.error` when present (else `#ef4444`).

### 1.2 The full semantic CSS-variable set

**Canonical (provider writes these 13 on `document.documentElement`, per theme):**
```
--background  --surface  --surface-elevated  --foreground  --muted-foreground
--border  --accent  --accent-foreground  --selection
--scrollbar-track  --scrollbar-thumb  --taskbar-background  --panel-shadow
```

**Derived aliases (declared ONCE in `globals.css :root`, static — never per-theme, so all existing CSS follows the theme with zero edits):**
```css
--brand:            var(--accent);
--brand-2:          color-mix(in srgb, var(--accent) 70%, var(--foreground));
--ring:             var(--accent);
--primary:          var(--accent);            /* D4 */
--primary-foreground: var(--accent-foreground);
--card:             var(--surface);
--card-foreground:  var(--foreground);
--popover:          var(--surface-elevated);
--popover-foreground: var(--foreground);
--secondary:        var(--surface-elevated);
--secondary-foreground: var(--foreground);
--muted:            var(--surface);
--surface-hover:    color-mix(in srgb, var(--foreground) 8%, transparent);
--accent-hover:     var(--surface-hover);     /* shadcn hover stays subtle (D3) */
--input:            var(--border);
--border-soft:      color-mix(in srgb, var(--border) 55%, transparent);
--dim:              var(--muted-foreground);
--destructive:      #ef4444;   --destructive-foreground: #fafafa;
--wp-bg:            var(--background);
--wp-accent:        var(--accent);
/* Dockview rebind (was hardcoded + referenced undefined --fg): */
--dv-background-color: var(--surface);
--dv-paneview-active-outline-color: var(--accent);
--dv-tabs-and-actions-container-background-color: var(--surface);
--dv-activegroup-visiblepanel-tab-background-color: var(--surface-elevated);
--dv-inactivegroup-visiblepanel-tab-background-color: var(--surface);
--dv-tab-divider-color: var(--border);
--dv-separator-border: var(--border);
/* …map every --dv-* at workspace.css:145-157 to a semantic var. */
```
Keep `--taskbar-h: 60px; --island-w: 92%; --island-max: 1120px; --wp-tabbar-h: 36px; --radius: .5rem` as non-color layout tokens in `:root`.

### 1.3 Tailwind v4 `@theme inline` wiring (rewrite `globals.css:8-40`)

`@theme inline` makes Tailwind emit `.bg-x{background-color:var(--…)}` referencing the var directly, so overriding the var at runtime re-themes every utility live. Final block:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--surface);
  --color-card-foreground: var(--foreground);
  --color-popover: var(--surface-elevated);
  --color-popover-foreground: var(--foreground);
  --color-primary: var(--primary);                 /* = accent (D4) */
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--surface-elevated);
  --color-secondary-foreground: var(--foreground);
  --color-muted: var(--surface);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--surface-hover);            /* SUBTLE hover, NOT vivid (D3) */
  --color-accent-foreground: var(--foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--accent);
  --color-brand: var(--accent);                    /* vivid → bg-brand / text-brand */
  --color-brand-2: var(--brand-2);
  /* NEW semantic utilities used by all new components */
  --color-surface: var(--surface);
  --color-surface-elevated: var(--surface-elevated);
  --color-selection: var(--selection);
  --color-taskbar: var(--taskbar-background);
  --radius-sm: calc(var(--radius) - 2px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 2px);
  --radius-xl: calc(var(--radius) + 6px);
  --font-sans: "Geist", ui-sans-serif, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, "Geist Mono", "SFMono-Regular", Menlo, Consolas, monospace;
}
```
**Resolves to active theme:** `bg-background/text-foreground/border-border/bg-surface/bg-surface-elevated/bg-taskbar/bg-brand/text-brand/ring-ring/bg-primary` all resolve to the provider-set vars. **New components use ONLY these utilities (no color literals).** Add to `@layer base`: `::selection { background: var(--selection); }`. **Opacity-modifier safety:** `--border`/`--accent` are opaque (1.1), so `border-border/60`, `bg-brand/90` behave.

### 1.4 Theme provider + persistence (no FOUC)

- `src/theme/vars.ts`: `themeToVars(t): Record<string,string>` (13 entries), `applyVars(vars, el=document.documentElement)` (pure `setProperty` loop — **idempotent**, StrictMode-safe).
- `src/theme/persistence.ts`: key `far-flare:theme:v1`; `PersistedTheme { version:1; id:string; vars:Record<string,string> }` (store **pre-resolved vars** so the boot script needs zero color math). `loadTheme()/saveTheme()/clearTheme()` mirror workspace persistence (try/catch, version+id validation).
- `src/theme/context.tsx`: `ThemeProvider` + `useTheme(): { theme, themeId, themes, setTheme(id), resetTheme() }`. `setTheme`: resolve → `themeToVars` → `applyVars` → `documentElement.dataset.theme=id; dataset.appearance=appearance` → `saveTheme`. Initial state from `loadTheme()` else `DEFAULT_THEME_ID`; first effect is idempotent (boot script already painted).
- **Boot script (blocking, in `index.html <head>` before `#root`)** — replays stored vars pre-paint:
```html
<script>(function(){try{var r=localStorage.getItem('far-flare:theme:v1'),d=document.documentElement;
if(r){var s=JSON.parse(r);if(s&&s.version===1&&s.vars){for(var k in s.vars)d.style.setProperty(k,s.vars[k]);d.dataset.theme=s.id;}}}catch(e){}})();</script>
```
First-visit users paint from `globals.css :root` defaults, which must equal the **default theme's resolved values** (seed `:root` with serika-dark/ink literals). `main.tsx` wraps `<RouterProvider>` in `<ThemeProvider>`. **Version bump** (`v1→v2`) whenever `deriveTheme` changes (stale-vars mitigation); always re-persist resolved vars on load.

---

## 2. WORKSPACE DESTINATION + CONTROLLER

### 2.1 Final `WorkspaceDestination` — `src/workspace/shell/types.ts`

```ts
export type WorkspaceLayout = 'standard' | 'full-workspace' | 'preview-left';
export type WorkspacePresentation = 'centered' | 'expanded';

interface DestinationCommon {
  title?: string;
  explorerPath?: string[];   // folder chain to auto-reveal in the tree
  selectedFileId?: string;   // leaf highlighted + scrolled into view
  openFolders?: string[];    // superset of folders to force-open
  layout?: WorkspaceLayout;  // used only while expanded; default 'standard'
  thumbnailUrl?: string;
}
export type WorkspaceDestination =
  | (DestinationCommon & { type: 'document';   docId: string })
  | (DestinationCommon & { type: 'folder';     collectionId: string })   // grid (FolderView)
  | (DestinationCommon & { type: 'collection'; collectionId: string })   // compiled markdown page (CompiledPanel)
  | (DestinationCommon & { type: 'project';    projectId: string })      // doc + preview, layout 'preview-left'
  | (DestinationCommon & { type: 'page';       component: string })      // bespoke React (Contact)
  | (DestinationCommon & { type: 'navigation'; view: string });          // graph/index

/** Stable identity for keys/dedupe/persistence. */
export const destinationId = (d: WorkspaceDestination): string =>
  d.type === 'document' ? `doc:${d.docId}`
  : d.type === 'project' ? `proj:${d.projectId}`
  : d.type === 'page' ? `page:${d.component}`
  : d.type === 'navigation' ? `nav:${d.view}`
  : `col:${d.collectionId}`; // folder | collection
```

### 2.2 Shell state + store — `src/workspace/shell/{types,store}.ts`

```ts
export interface ExplorerState { openFolders: Record<string,boolean>; selectedFileId: string|null; width: number; scrollTop: number; }
export interface ShellState {
  presentation: WorkspacePresentation;   // centered ⇔ expanded
  layout: WorkspaceLayout;               // meaningful only when expanded
  destination: WorkspaceDestination|null;// null ⇒ centered/idle
  explorer: ExplorerState;
  contentScrollTop: number;
  transitioning: boolean;                // true during the frame animation
  selectedDoc: { id: string; title: string } | null;  // D8 chat context SoT
}
```
`useShellStore` = vanilla Zustand (mirror `workspace/store.ts`). `MIN_EXPLORER_W=180`, `MAX_EXPLORER_W=420`, default `244`.

### 2.3 Layout-mode state machine

Two **orthogonal** axes:
- **Presentation** (geometry/animation): `destination===null ⇒ centered`; any destination ⇒ `expanded`.
- **Layout** (split arrangement, expanded only): `standard` = explorer(left) + content(right); `full-workspace` = content full-width, explorer → toggle/overlay (navigation, debug); `preview-left` = preview/reader pinned left + secondary(meta/associated) right (projects, `meta.layout:'preview-left'` docs).

| From | Event | To | Effect |
|---|---|---|---|
| centered | `openDestination(d)` | expanded | set `destination=d`, `layout=d.layout??'standard'`; reveal `explorerPath`/`openFolders`; select `selectedFileId`; mount content panel; `transitioning=true`→animate→`false` |
| expanded | `selectFile(id)` | expanded | swap content doc + `explorer.selectedFileId`; no geometry change |
| expanded | `navigateToFolder(path)` | expanded | expand folders + folder listing |
| expanded | `applyLayout(l)` | expanded | flip `data-layout` (no remount) |
| expanded | `returnToCentered()` | centered | `destination=null`; **keep** explorer/scroll; animate back |
| any | route change | → resolves to a destination or null (idempotent sync) |

**Invariants:** never remount `ExplorerSidebar`/Dockview; explorer state lives in `useShellStore` and survives every transition; `expand()` with no destination is a no-op (never auto-expand). Centered = explorer-only, **no floating panels** (suppress floats in content variant so `clamp()` can't squash them into the tiny island).

### 2.4 Shell controller — `src/workspace/shell/controller.ts` (complete API)

```ts
export interface WorkspaceShellController {
  init(): void;                                              // bind on mount; hydrate or default to centered
  openDestination(dest: WorkspaceDestination): void;        // THE entry point routes call
  expand(): void;                                            // no-op if no destination
  returnToCentered(): void;                                  // preserves explorer/content state
  selectFile(fileId: string, opts?: { reveal?: boolean }): void;
  navigateToFolder(path: string[]): void;
  openProject(projectId: string): void;                     // layout 'preview-left'
  applyLayout(layout: WorkspaceLayout): void;
  toggleFolder(folderId: string, open?: boolean): void;
  setExplorerWidth(px: number): void;                       // clamped [MIN,MAX]
  setExplorerScroll(top: number): void;
  setContentScroll(top: number): void;
  resolveRoute(pathname: string, params: Record<string,string|undefined>): WorkspaceDestination|null; // pure
  getSelectedDoc(): { id: string; title: string } | null;   // D8
  persist(): void;
  hydrate(data: PersistedWorkspaceShell): void;             // + Atlas reconciliation (§7)
  reset(): void;
}
export const shell: WorkspaceShellController;
```
`openDestination` internals: resolve `layout`; update `useShellStore` (destination/presentation/explorer reveal/selectedDoc); **delegate content mount** to the panel layer via `workspace.open(dest)` (2.5). Debounced `persist()` (250ms).

### 2.5 Panel-layer additions — `src/workspace/controller.ts`

Generalize `openReader` (`controller.ts:447`) into one router that stores the **full destination** in `panel.data` (so remount/persist reconstructs the view):

```ts
open(dest: WorkspaceDestination): void;
// type==='document'|'project' → openDocPanel(docId, layout)  (pid `reader-${docId}`, data={docId,layout,dest})
// type==='collection'         → openCompiledPanel(collectionId) (pid `compiled-${id}`, data={collectionId})
// type==='folder'             → openFolderPanel(collectionId)   (pid `folder-${id}`,   data={collectionId})
// type==='page'               → openPagePanel(component)        (pid `page-${component}`, data={component})
// type==='navigation'         → openNavPanel(view)
```
- Keep existing methods: `bind, openPanel, closePanel, focusPanel, floatPanel, tabPanel, snapPanel, maximizePanel, restorePanel, movePanel, resizePanel, setGeometry, commitGeometry, reflow, beginFloatDrag, applyState, setData, resetLayout, loadDefault, loadContentDefault, saveLayout, loadLayout, hydrate, defaultSize, genId, listPanels`.
- **Remove the content early-return** in `schedulePersist()` (`controller.ts:129`) — route content saves through `shell.persist()` (see §7 reconciliation).
- Add `snapPanel(id, region, area?)` optional live-area param (§4); add module-level `draggingId` guard consulted by `reflow()` (§4).
- `PanelType` gains `'folder' | 'compiled' | 'page'` (`types.ts:2`); `panels.tsx` routes them to `FolderView`/`CompiledPanel`/`PageContent`; `DocView` replaces `ReaderPanel` for `'reader'`.

### 2.6 Routes → destinations (no per-page explorer logic)

- `src/workspace/shell/routes.ts` — pure registry:
```ts
export const ROUTE_DESTINATIONS: { path: string; resolve: (p)=>WorkspaceDestination|null }[] = [
  { path: '',            resolve: () => null },                          // '/' ⇒ centered
  { path: 'projects',    resolve: () => folderOrCollection('projects','Projects') },
  { path: 'experiences', resolve: () => folderOrCollection('experiences','Experiences') },
  { path: 'links',       resolve: () => folderOrCollection('links','Links') },   // → 'collection' (compiled)
  { path: 'drafts',      resolve: () => folderOrCollection('drafts','Drafts') },
  { path: 'blogs',       resolve: () => folderOrCollection('blogs','Blogs') },
  { path: 'contact',     resolve: () => ({ type:'page', id:'contact', title:'Contact', metadata:{component:'contact'} }) },
];
// folderOrCollection uses isCompiledCollection(id) → type 'collection' for compiled (links) else 'folder'.
```
- `src/app/WorkspaceRoute.tsx` — renders **nothing**; on `pathname`/`params` change calls `shell.resolveRoute` → `openDestination` or `returnToCentered`. Every router child becomes `<WorkspaceRoute/>`.
- `CollectionPage`/`ContactPage` are **not deleted** — their bodies become Dockview panel renderers: `FolderView({collectionId})` (keep `useCollectionDocs` + `.doc-grid`/`DocCard`; card click → `shell.selectFile(doc.id)`), `PageContent` for `contact`. Breadcrumbs/PageHeader move into the content-pane header driven by `destination.title`/`explorerPath`.

---

## 3. LAYOUT SHELL

### 3.1 DOM structure — single persistent mount

Move the ONE Workspace instance **up into `AppLayout`** (today it's inside `HomePage`, so route changes unmount Dockview). `/workspace` debug stays outside `AppLayout` so the two never coexist (single-instance `refs.ts` singletons).

```
.app-shell (flex col, min-h 100dvh)
  <Ambient/>                                   // fixed backdrop z0
  <AppTaskbar/>                                // sticky top-0 z40 h-[--taskbar-h] (§ replaces TopBar)
  <main class="app-main">
    <Outlet/>                                  // <WorkspaceRoute/> (renders null) + on '/' a <HomeIntro/> in flow
    <WorkspaceShell/>                          // ← the ONE persistent instance
  </main>
  <Footer/>
```
`WorkspaceShell` internal:
```
.wp-shell   data-presentation="centered|expanded"  data-layout="standard|full-workspace|preview-left"
  .wp-shell__frame                              // the element that ANIMATES
    .wp-root.wp-root--content                   // existing Workspace root, UNCHANGED internally
      <ExplorerSidebar/>  .wp-splitter  .wp-main(DockLayer)
```
- **No remount ever:** React keeps `WorkspaceShell` mounted; only `data-*` attributes flip. Dockview API, reader panels, `ExplorerSidebar` persist; explorer state is in `useShellStore`.

### 3.2 Transition strategy (position via layout, not `position` swap)

`position` isn't animatable, so animate `max-width`, `height`, `border-radius`, `margin-inline` on `.wp-shell__frame`. Keep this in `workspace.css` (token-driven CSS — the frame's multi-property easing is cleaner as CSS than utilities):

```css
.wp-shell { position: sticky; top: var(--taskbar-h); z-index: 1; --wp-shell-offset: var(--taskbar-h); }
.wp-shell__frame {
  margin-inline: auto; overflow: hidden; will-change: max-width, height;
  contain: layout paint;
  transition: max-width .42s cubic-bezier(.22,.61,.36,1),
              height    .42s cubic-bezier(.22,.61,.36,1),
              border-radius .42s ease, box-shadow .42s ease;
}
.wp-shell[data-presentation="centered"] .wp-shell__frame {
  max-width: var(--island-max); height: clamp(360px, 48vh, 560px); border-radius: 14px;
  box-shadow: 0 10px 40px var(--panel-shadow);
}
.wp-shell[data-presentation="expanded"] .wp-shell__frame {
  max-width: 100vw; height: calc(100dvh - var(--wp-shell-offset)); border-radius: 0;
}
```
- **Retire** `.wp-root--embedded`'s fixed `min(80vh,720px)` (`workspace.css:666-673`); the shell owns geometry. `.wp-root` inside frame → `position:relative; inset:0; height:100%`.
- **Panels reflow for free:** the existing `.wp-stage` `ResizeObserver` (`Workspace.tsx:63-70`) fires every animation frame → `workspaceRect` + `workspace.reflow()` track the growing frame. `contain`/`will-change` bound the cost; pause heavy content work while `transitioning===true`.
- Respect `prefers-reduced-motion` (already globally handled `globals.css:100-110`).

### 3.3 Taskbar + offset (single location)

- `AppTaskbar` = `sticky top-0 z-40 h-[var(--taskbar-h)] bg-taskbar backdrop-blur-md border-b border-border`, Tailwind-utility component: `<TaskbarBrand/> <TaskbarNav/> <spacer ml-auto/> <ThemesButton/> <MobileMenuTrigger/>`. **Sticky only, never `fixed`** — content is never hidden.
- Offset lives in exactly one place: `--wp-shell-offset: var(--taskbar-h)` on `.wp-shell`. Expanded height = `100dvh - offset`; sticky `top` = offset. `/workspace` debug root likewise gets `top: var(--taskbar-h); height: calc(100dvh - var(--taskbar-h))` IF a taskbar is added there.

### 3.4 explorer | content split + splitter

- `.wp-root--content` (`workspace.css:676-684`) becomes a flex row: `<ExplorerSidebar>` `flex:0 0 var(--wp-explorer-w)` (was hard `244px` at `:710`) + `.wp-splitter` + `.wp-main` `flex:1`.
- New `Splitter` component (pointer-drag) writes `shell.setExplorerWidth(px)` → `--wp-explorer-w` (clamped 180–420). Double-click resets to 244.
- `data-layout` (pure CSS on `.wp-shell`): `standard` shows explorer + splitter; `full-workspace` hides them (`.wp-side{display:none}`) or overlays via a toggle; `preview-left` reconfigures `.wp-main` into a two-column grid (preview 60% / secondary 40%).
- Responsive (§16): `@media (max-width:767px)` → explorer becomes a drawer/overlay (reuse `MobileMenu` pattern, `ink.css:139-146`); content is primary; taskbar label collapses to icon.

---

## 4. SNAP / DRAG FIX

**Root causes (confirmed in source):** corners are only a 60px-wide vertical sliver (`snap.ts:15-17` returns `null` unless `px<=60||px>=w-60`); "bottom" is a height fraction (`:20`) not edge proximity; detection width comes from the **stale store copy** `workspaceRect` while coords come from the **live stage** (`drag.ts:65,68-69,84`); tab-dock is a geometric band `root.top→stage.top` (`drag.ts:74-81`), a proxy that can swallow document bodies mid-animation; `.wp-window`/`.wp-snap-preview` have **no transition** so snaps jump; `VALID_MODES` omits `snapped-top-*` (`persistence.ts:16-19`).

### 4.1 `snap.ts` — real 2-D, size-relative corner hitboxes (corner-over-edge precedence)

```ts
export interface SnapMetrics { edge: number; cornerX: number; cornerY: number; }
export function snapMetrics(ws: Rect): SnapMetrics {
  return {
    edge:    Math.min(56,  ws.width  * 0.10),
    cornerX: Math.min(150, ws.width  * 0.30),
    cornerY: Math.min(150, ws.height * 0.34),
  };
}
export function detectSnap(px: number, py: number, ws: Rect): SnapRegion | null {
  const { edge, cornerX, cornerY } = snapMetrics(ws);
  const nearLeft   = px <= cornerX,  nearRight  = px >= ws.width  - cornerX;
  const nearTop    = py <= cornerY,  nearBottom = py >= ws.height - cornerY;
  if (nearBottom && nearLeft)  return 'bottom-left';   // (1) corners beat edges
  if (nearBottom && nearRight) return 'bottom-right';
  if (nearTop    && nearLeft)  return 'top-left';
  if (nearTop    && nearRight) return 'top-right';
  if (px <= edge)              return 'left';           // (2) half-edges (middle band)
  if (px >= ws.width - edge)   return 'right';
  return null;
}
```
- `snapRect` unchanged (`snap.ts:25-44` — target rects already correct). `py >= ws.height - cornerY` (and `py > ws.height` when the pointer is below the inset stage) both read as `nearBottom`, fixing bottom-edge reachability. Size-relative metrics keep hitboxes sane at island **and** full size — mandatory for centered mode.

### 4.2 `drag.ts` — one live rect, real tab-strip hit-test, corner precedence

- **Unify coordinate source** — delete `area = store.getState().workspaceRect` (`:65`); use the live stage for coords, detection size, AND clamping:
```ts
const stage = rectOf(getWorkspaceEl());
const localX = e.clientX - stage.left, localY = e.clientY - stage.top;
const ws: Rect = { x:0, y:0, width: stage.width, height: stage.height };  // live
const nx = clampAxis(localX - grabX, width, ws.width);
const ny = clampAxis(localY - grabY, height, ws.height);
workspace.setGeometry(panelId, 'floating', { x:nx, y:ny, width, height });
```
- **Replace the geometric tab band** (`:74-81`) with a real element hit-test in **client coords** (never qualifies a document body; correct across island/expanded/animation):
```ts
const strip = getTabStripEl()?.getBoundingClientRect() ?? null;   // from refs.ts (4.3)
const overTabs = !!strip && e.clientX>=strip.left && e.clientX<=strip.right
                        && e.clientY>=strip.top  && e.clientY<=strip.bottom;
```
- **Precedence in `onMove`:** (1) `overTabs`→`'tab'`; (2) `detectSnap(localX,localY,ws)` (corners already beat edges); (3) floating. Keep early-return + `store.setState({snapPreview})` shape (preview already fires pre-release — corners now actually appear).
- On drop (`:113-115`) pass the live snap rect through: `workspace.snapPanel(panelId, target.kind, ws)` (4.4) to avoid a post-commit hop.
- Set `workspace.setDraggingId(panelId)` in `startPanelDrag`; clear in `cleanup()`.

### 4.3 `refs.ts` — explicit tab-strip ref (avoids Dockview class coupling + empty-bar case)

```ts
let tabStripEl: HTMLElement|null = null;
export const setTabStripEl = (el: HTMLElement|null) => { tabStripEl = el; };
export const getTabStripEl = () => tabStripEl;
```
Populate from `Workspace.tsx` after mount — a thin `[data-tabdock]` overlay spanning the strip (always present, so **first-panel docking works even with 0 tabs**). Do **not** use `elementFromPoint` (the dragged window shadows the strip).

### 4.4 `controller.ts` — reflow drag-guard + live-area snap

```ts
let draggingId: string|null = null;
export const setDraggingId = (id: string|null) => { draggingId = id; };
// reflow(): add `if (p.id === draggingId) continue;`  (else a mid-drag island-expand yanks the panel)
snapPanel(id, region, area = get().workspaceRect) { … const rect = snapRect(region, area); … }
```

### 4.5 Smooth snap animation (no remount) — `workspace.css`

- Floating + snapped are the same keyed `FloatingWindow` (`Workspace.tsx:51-54`) → the DOM node persists → a CSS transition on inline geometry animates the snap. **Gate strictly to snapped** (during floating drag, geometry must track the pointer 1:1):
```css
.wp-window.is-snapped { transition: left .18s ease, top .18s ease, width .18s ease, height .18s ease; }
.wp-snap-preview { transition: left .14s ease, top .14s ease, width .14s ease, height .14s ease; }
```

### 4.6 `persistence.ts`

Add `'snapped-top-left','snapped-top-right'` to `VALID_MODES` (`:16-19`) — else any top-corner snap discards the **entire** saved layout on reload.

**§4 file list:** `snap.ts` · `drag.ts` · `refs.ts` · `controller.ts` · `persistence.ts` · `workspace.css` (transitions + `[data-tabdock]`). No change to `snapRect`, `store.ts`, `SnapPreview.tsx` logic.

---

## 5. SCROLL HANDOFF

Single capture-phase handler (replaces `Workspace.tsx:82-100` — must be the *only* wheel handler to avoid double-`preventDefault`). Active only when `presentation==='expanded'` (centered scrolls natively). Inner scroll is consumed first (feels temporarily locked); handoff requires **accumulated** intent within a window; reversal/idle decays; once released the page scrolls natively to reveal taskbar (up)/footer (down) — never permanently trapped.

```
CONST HANDOFF_THRESHOLD = 220     // accumulated overscroll px before release
CONST INTENT_WINDOW_MS  = 320     // must accumulate within this window
CONST BOUNDARY_EPS      = 1
state: accum=0, lastTs=0, dir=0   // dir: -1 up, +1 down

innerViewport(): scroll container under focus (content-pane viewport if focus=content else explorer;
                 reuse focus-follows-click, refs.ts scrollFocus / Workspace.tsx:73-81)
atTop(v)    = v.scrollTop <= BOUNDARY_EPS
atBottom(v) = v.scrollTop >= v.scrollHeight - v.clientHeight - BOUNDARY_EPS

onWheel(e):                                   // capture phase, passive:false
  if presentation != 'expanded': return       // native scroll
  v = innerViewport(); up = e.deltaY<0; down = e.deltaY>0
  canScrollInner = (up && !atTop(v)) || (down && !atBottom(v))
  if canScrollInner:
    v.scrollTop += e.deltaY; accum=0; e.preventDefault(); return   // consume, keep lock
  // at inner boundary → accumulate handoff intent
  now = performance.now(); thisDir = down ? +1 : -1
  if now-lastTs > INTENT_WINDOW_MS || thisDir != dir: accum=0      // decay / reversal
  dir=thisDir; lastTs=now; accum += abs(e.deltaY)
  if accum < HANDOFF_THRESHOLD: e.preventDefault(); return         // still locked (NOT immediate)
  accum=0                                                          // HANDOFF: release
  // do NOT preventDefault → page scrolls: up reveals taskbar area, down reveals footer

onTouch: same accumulator over touchmove Δy (track last touch Y); same boundary+decay logic
onKey:   PageUp/PageDown/Space/Arrows at a boundary add ±deltas to accum;
         Home/End inside inner viewport handled normally
```
**Globals to reconcile:** scope/remove `html{scroll-behavior:smooth}` (`globals.css:88-90`) during programmatic reveal (avoids lurch); remove the unconditional `window.scrollTo(0,0)` on route change (`AppLayout.tsx:12-14`) — only reset when navigating *to* centered `/`, never on expand.

---

## 6. CHAT

No chat components/deps exist. Build bespoke from Base UI `Popover` (`side="top" align="end"` → expands upward) + existing `ScrollArea` + `Button` + a token-styled `<textarea>` (pattern: `CommandLine.tsx:75-84`).

### 6.1 Service interface — `src/core/chat/types.ts`

```ts
export type ChatRole = 'user'|'assistant';
export interface ChatMessage { id:string; role:ChatRole; content:string; createdAt:number; pending?:boolean; }
export interface ChatContext { docId?:string; title?:string; }
export interface ChatSource { docId:string; title:string; snippet:string; }
export type ChatChunk =
  | { type:'sources'; sources:ChatSource[] }   // ← SSE 'event: context'
  | { type:'delta'; content:string }           // ← {choices:[{delta:{content}}]}
  | { type:'done' };                           // ← '[DONE]'
export interface ChatService {
  stream(history: ChatMessage[], ctx: ChatContext, signal?: AbortSignal): AsyncIterable<ChatChunk>;
}
```
- `src/core/chat/client.ts` — `POST {BASE}/chat` body `{messages:{role,content}[], docId?}`; read `res.body.getReader()` + `TextDecoder`, buffer-split on `\n\n`, translate frames; honor `AbortSignal`. Reuse `VITE_*` BASE like `atlas/client.ts:7-8`. Mock (`mock-api/src/routes/chat.ts`) already grounds on `docId` and cites titles.
- `src/core/chat/mock.ts` — in-process `ChatService`: yields `sources:[ctx]`, streams a canned reply word-by-word (16ms) that **names `ctx.title`** (guarantees the "references selected file" demo offline). Env picks wire-vs-mock.
- **Context SoT (D8):** `ctx` from `shell.getSelectedDoc()` (updated on every `openDestination`/`selectFile` resolving to a doc), NOT `activeId` (which may be a non-doc panel).

### 6.2 Panel structure — `src/features/chat/`

```
ChatDock.tsx        // mounted ONCE in AppLayout (sibling of <main>/<Footer>), position:fixed bottom-right,
                    //   right/bottom: max(1rem, env(safe-area-inset-*)), z ABOVE workspace chrome.
                    //   FAB (Button size="icon", lucide MessageCircle) + Base UI Popover(side=top, align=end)
ChatPanel.tsx       // header (title + selected-context chip + collapse X) · <ScrollArea> history · ChatComposer
ChatMessageList.tsx // ChatMessage[] → ChatBubble; stick-to-bottom on new tokens (RAF scrollTop; cf. CommandLine.tsx:21-26)
ChatBubble.tsx      // token-styled bubble; assistant may render MiniMarkdown; optional sources row
ChatComposer.tsx    // token <textarea> + send; Enter=send, Shift+Enter=newline (cf. CommandLine.tsx:51-62)
store.ts            // zustand: { open, messages }  (one store per feature, mirrors workspace/store.ts)
useChat.ts          // append user → append pending assistant → for-await service.stream → accumulate deltas
                    //   into pending bubble → clear pending on 'done'; holds AbortController (cancel on collapse)
```
**§14 constraints (binding):** mount at the shell (viewport-fixed), NOT inside `.wp-stage` — else it collides with `snapped-bottom-right` panels (snap coords are stage-local). Constrain size `min(24rem, calc(100vw-2rem)) × min(32rem, calc(100dvh-8rem))`; clear of the footer; does not navigate/replace explorer/take over the screen; collapses back to FAB; visible in both centered and expanded states (guaranteed by shell-level mount). Uses only theme tokens (`bg-surface-elevated`, `border-border`, `text-foreground`) so it follows the active theme.

### 6.3 Persistence — `src/core/chat/persistence.ts`

Key `far-flare:chat:v1`; `{ version:1; open:boolean; messages:ChatMessage[] }`; try/catch no-op (pattern `persistence.ts:44-62`); hydrate on mount; debounce-persist on change. Persists open/closed + history across reloads.

### 6.4 Atlas/content prerequisites (data-chat)

- `atlas/types.ts` + `mock-api/src/types.ts`: add `DocMeta`, optional `Collection.meta`, sync `SearchResult.related` (**edit BOTH mirror files**).
- `atlas/meta.ts`: `docMeta(doc): DocMeta` (safe narrow), `layoutForDoc(doc): WorkspaceLayout` (`meta.layout??'standard'`; `'reader'→'standard'`), `previewFileFor(doc): AssociatedFile|undefined`.
- `atlas/hooks.ts`: add `useDocument(id): AsyncState<AtlasDocument|undefined>` (§5 needs full doc; today only markdown).
- `MiniMarkdown.tsx`: link-aware — bare-docId href (`isDocId`) → `<button onClick={()=>onDocLink(id)}>`; `http(s)` → keep `<a target=_blank>`. Fixes broken internal links (`:21-25` today navigates to `/doc-x`). Reader/compiled pass `onDocLink={(id)=>shell.selectFile(id)}` (or `workspace.open`).
- `destination.ts`: `destinationForDoc/DocRef/Collection`, `isCompiledCollection` (links → compiled; recommend `Collection.meta.compiled`), `compileCollectionMarkdown(view): string` (header + `- [title](docId) — desc` list).
- `DocView` (replaces `ReaderPanel`): branch on `doc.type` (PDF → `<iframe src=atlas.contentUrl(id)>`, never `.text()`) and `layoutForDoc` (`standard`=title+markdown+meta strip; `preview-left`=large preview left / related right; `full-workspace`=maximized). Full doc via `useDocument`; associated via `atlas.abs(file.url)`.

---

## 7. STORAGE KEYS (every versioned key + shape)

Convention for NEW keys: `far-flare:<domain>:v<n>`.

| Key | Store | Shape | Notes |
|---|---|---|---|
| `far-flare:theme:v1` | local | `{version:1; id:string; vars:Record<string,string>}` | pre-resolved vars (boot script). Bump on `deriveTheme` change. |
| `far-flare:workspace-shell:v1` | local | `PersistedWorkspaceShell` (below) | shell + explorer + content |
| `far-flare:workspace-shell-scroll:v1` | **session** | `{version:1; explorerScrollTop:number; contentScrollTop:number}` | scroll is session-scoped (avoids stale cross-day jumps) |
| `far-flare:chat:v1` | local | `{version:1; open:boolean; messages:ChatMessage[]}` | §6.3 |
| `dockview-workspace-layout-v1` | local | `PersistedLayout` (existing) | **legacy, unchanged** — `/workspace` debug only. Only fix: `VALID_MODES` += top-corners. |

```ts
export const SHELL_STORAGE_KEY = 'far-flare:workspace-shell:v1';
export interface PersistedWorkspaceShell {
  version: 1;
  presentation: WorkspacePresentation;
  layout: WorkspaceLayout;
  destination: WorkspaceDestination | null;
  explorer: { openFolders: Record<string,boolean>; selectedFileId: string|null; width: number };
  content: { openDocId: string|null; projectId: string|null };
}
```
**Rules:** `isValidShell` type-guard (version===1, enum presentation/layout, `destination===null||validDestination`, `width` clamped) → invalid ⇒ null ⇒ default to centered (fail-safe). **Atlas reconciliation on hydrate** (after `useResolvedManifest`): drop ids absent from the manifest — unknown `selectedFileId`/`openDocId` → clear selection, fall back to folder listing; unknown `destination` → `returnToCentered()`; never throw. Debounced writes (250ms). Preserves all of §17: folder expansion, explorer scroll, selected file, open doc, current project, layout, explorer width, doc scroll, centered/expanded.

---

## 8. BUILD ORDER (strict, dependency-ordered; each phase compiles + is verifiable)

**CSS migration policy (applies throughout):**
- **STAY as token-driven CSS** (hand-written, but every hardcoded color → semantic var): `ink.css` (taskbar/ambient/island/home-intro/drawer base), `workspace.css` (Dockview `--dv-*`, splitter, snap preview, `wp-scroll*` scrollbars, `.wp-shell`/`.wp-shell__frame` frame animation, `.wp-side`/`.wp-main`, CLI/term/`md-*` blocks). These are stateful/complex — utilities would hurt.
- **NEW React components use Tailwind utilities ONLY** (`bg-surface`, `text-foreground`, `border-border`, `bg-brand`, `bg-taskbar`): `AppTaskbar`, `Themes*`, `ui/{popover,tooltip,input}`, `HomeIntro`, `FolderView`, `PageContent`, all chat.
- The color **values** migrate everywhere via the `@theme inline` mechanism (already correct).

**Phase 0 — Safe foundation fixes** *(compiles; verify existing app unchanged + top-corner snap persists on `/workspace`)*
- Edit `workspace.css`: `var(--fg)` → `var(--foreground)` (15 sites).
- Edit `persistence.ts`: `VALID_MODES` += `snapped-top-left`,`snapped-top-right`.

**Phase 1 — Snap/drag engine fix** *(verify on `/workspace`: bottom+top corner previews appear pre-release, dock only over the real tab strip, snaps animate)*
- Edit `snap.ts` (metrics + `detectSnap`), `drag.ts` (live rect, tab-strip hit-test, precedence, live-area drop, `setDraggingId`), `refs.ts` (`tabStripEl` + `[data-tabdock]`), `controller.ts` (`reflow` guard, `snapPanel(area?)`, `setDraggingId`), `Workspace.tsx` (mount `[data-tabdock]`/`setTabStripEl`), `workspace.css` (`.wp-window.is-snapped`/`.wp-snap-preview` transitions).

**Phase 2 — Theme system** *(verify: theme menu switches all 50 live, no FOUC on reload, no color leaks)*
1. `theme/{types,derive,vars,persistence,context}.ts` + `theme/themes.data.ts` (+ port script).
2. Rewrite `globals.css` `@theme inline` (1.3) + semantic/derived `:root` (1.2) + `::selection`; rename `--topbar-h`→`--taskbar-h`.
3. `index.html`: boot script (1.4) + drop hardcoded `data-theme="ink"`.
4. `main.tsx`: wrap `<ThemeProvider>`.
5. **Color sweep:** `ink.css` + `workspace.css` hardcoded colors → semantic vars; rebind all `--dv-*`.
6. `ui/{popover,tooltip,input}.tsx` (Base UI wrappers, token-styled).
7. `theme/../{ThemesButton,ThemeMenu,ThemeSwatch}.tsx` (Popover + Combobox/Autocomplete for search+keyboard nav; `unstable-use-media-query` → Drawer under ~640px).
8. `AppTaskbar.tsx` + wire into `AppLayout` (replace `TopBar`); add Themes entry to `MobileMenu`.

**Phase 3 — Atlas/content foundation** *(verify: reader shows title/meta/associated, PDFs embed, internal markdown links open in-workspace, links collection compiles)*
- Edit `atlas/types.ts` + `mock-api/src/types.ts` (DocMeta, Collection.meta, related) · `mock-api/src/fixtures.ts` (layout meta on project docs, `compiled` on links).
- Add `atlas/meta.ts`, `atlas/hooks.ts` `useDocument`, `content/destination.ts` (+compiler).
- Edit `MiniMarkdown.tsx` (`onDocLink`).
- `types.ts`: `PanelType` += `folder,compiled,page`; `persistence.ts` guards; `panels.tsx` routing.
- Add `DocView` (replaces `ReaderPanel`), `CompiledPanel`, `FolderView`, `PageContent`.
- `controller.ts`: `workspace.open(dest)` + `openDocPanel/openCompiledPanel/openFolderPanel/openPagePanel`; keep `openReader` as thin alias.

**Phase 4 — Shell layer + persistent mount (structural)** *(verify: `/`, `/projects`, `/contact` all drive ONE workspace with centered↔expanded animation, no Dockview remount, explorer state survives navigation)*
- Add `shell/{types,store,controller,routes,persistence}.ts`; `app/WorkspaceRoute.tsx`; `components/layout/WorkspaceShell.tsx`; `pages/home/{HomeIntro.tsx,home.content.ts}`; `Splitter`.
- Edit `AppLayout.tsx` (mount persistent `<WorkspaceShell/>` + `<HomeIntro/>` on `/`; scope scroll reset) · `router.tsx` (children → `<WorkspaceRoute/>`) · `HomePage.tsx` (Billboard→HomeIntro; drop embedded Workspace + css import) · `Workspace.tsx` (accept presentation/layout, splitter, drive explorer from `useShellStore`) · `ExplorerSidebar.tsx` (local state → shell store, selection highlight, reveal, scroll persist) · `controller.ts` (remove content persist guard `:129`; Atlas reconciliation via `shell.hydrate`) · `workspace.css` (retire `--embedded` height, add `.wp-shell`/`.wp-shell__frame`/splitter/responsive) · `ink.css` (`.home-intro`).

**Phase 5 — Scroll handoff** *(verify: expanded workspace locks, sustained overscroll reveals taskbar/footer, reversal decays; touch + keyboard)*
- Edit `Workspace.tsx` — replace the capture wheel handler with §5 algorithm (gated on `presentation==='expanded'`); reconcile `scroll-behavior`/route-reset globals.

**Phase 6 — Chat** *(verify: FAB bottom-right in centered + expanded, streams referencing selected file, persists across reload, no snap/footer collision)*
- Add `core/chat/{types,client,mock,persistence}.ts`; `features/chat/{ChatDock,ChatPanel,ChatMessageList,ChatBubble,ChatComposer,store,useChat}`.
- Edit `AppLayout.tsx` (mount `<ChatDock/>`); wire `shell.getSelectedDoc()`.

**Phase 7 — Responsive + polish** *(verify at 375/768/1440; all 50 themes on a dev snapshot page)*
- `@media` explorer→drawer / `full-workspace` mobile / theme-menu→drawer; final contrast audit (light themes: solarized light, gruvbox light, rose pine dawn); opacity-modifier audit (`Island.tsx`, `Placeholder.tsx`).

**Keep as-is:** `Ambient`, `Billboard`, `Footer`, `Breadcrumbs`, `nav.ts`, `Island`/`PageHeader`/`Placeholder`, the atlas client, the `/workspace` debug surface + debug panels, `SnapPreview.tsx` logic, `store.ts` shapes.

---

## 9. TOP RISKS + MITIGATIONS

1. **`--accent` semantic collision** (highest). Ship D3 exactly (vivid→`--brand`/`--ring`/`--primary`; `bg-accent`→`--surface-hover`) or every ghost/outline hover turns saturated. Verify `button.tsx:12-13` hovers stay subtle after Phase 2.
2. **`var(--fg)` undefined (15 sites)** — those elements only theme by inheritance today; Phase 0 rename is prerequisite for correct re-theming.
3. **Large hardcoded-color surface** (~60+ literals incl. `--dv-*`, scrollbars, `.wp-card`, CLI/term/code). This sweep is the *main* theme effort, not the provider. Any miss = a non-repainting leak on theme switch. Grep systematically; snapshot all 50 in Phase 7.
4. **Layout-animation cost** — animating `max-width`/`height` relayouts Dockview + markdown each frame while the `ResizeObserver` reflows continuously. Mitigate: `contain: layout paint` + `will-change` on `.wp-shell__frame`, pause heavy content work while `transitioning===true`, keep 420ms.
5. **Reflow yanks the dragged panel** during a mid-drag island-expand. `draggingId` guard in `reflow()` is mandatory (Phase 1).
6. **Single-instance singletons** (`refs.ts`, `workspace`) — moving the instance to `AppLayout` is correct only because `/workspace` debug stays outside `AppLayout`; never mount both. `shell.init()`/route-sync effects must be idempotent (StrictMode double-invoke; `bind()` already `api.clear()`s).
7. **`AppLayout` scroll-reset + `scroll-behavior:smooth` fight the expand/handoff** — scope the reset to centered `/` only; disable smooth during programmatic reveal.
8. **Content-persistence enablement** requires Atlas reconciliation (dropped ids) or a deleted doc renders an empty reader/dangling selection. Ship §7 reconciliation with the guard removal.
9. **Empty tab bar can't dock** the first panel — the `[data-tabdock]` overlay (always spanning the strip) is required; do not rely on Dockview's internal container existing.
10. **Contrast across 50 palettes** — light themes break if `accentForeground`/`surfaceElevated`/shadow assume dark. `appearance` + `contrastPick()` must be exercised on every theme (dev snapshot page).
11. **Two divergent type mirrors** (`web/src/core/atlas/types.ts` ↔ `mock-api/src/types.ts`) — DocMeta/Collection.meta/Chat contract must touch both or the "swap by base URL" guarantee breaks.
12. **`lucide-react ^1.24.0`** is an unusual major — verify `Palette,MessageCircle,Check,ChevronRight,FileText,Search,Menu,Minimize2,X` resolve before relying on them.