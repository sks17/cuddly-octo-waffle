import { useShellStore } from './store';
import { workspace } from '../controller';
import {
  DEFAULT_EXPLORER_W,
  MAX_EXPLORER_W,
  MIN_EXPLORER_W,
  type ExplorerState,
  type WorkspaceDestination,
  type WorkspaceLayout,
} from './types';
import { loadShell, saveShell, type PersistedWorkspaceShell } from './persistence';
import { resolveRoute } from './routes';

const store = useShellStore;
const get = () => store.getState();
const TRANSITION_MS = 460; // must exceed the CSS frame animation (see .wp-shell__frame)

let ready = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist(): void {
  if (!ready) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => shell.persist(), 250);
}

function beginTransition(): void {
  store.setState({ transitioning: true });
  window.setTimeout(() => store.setState({ transitioning: false }), TRANSITION_MS);
}

/**
 * Align the workspace's top to just below the taskbar as it becomes the primary
 * surface. Scrolls in EITHER direction: on the homepage it pins down past the
 * intro; on a route change it pins UP when the previous page left us scrolled
 * past the workspace (otherwise the new page would load scrolled down). The
 * frame's height animates and the page isn't tall enough to scroll the full way
 * until it settles — and that settle time varies — so we retry on spaced attempts
 * until the shell top reaches the taskbar. Instant two-arg scroll bypasses any
 * `scroll-behavior: smooth`.
 */
function pinWorkspace(): void {
  if (typeof window === 'undefined') return;
  const taskbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h'), 10) || 60;
  const attempt = () => {
    const el = document.querySelector<HTMLElement>('.wp-shell');
    if (!el) return;
    const rectTop = el.getBoundingClientRect().top;
    if (Math.abs(rectTop - taskbarH) <= 2) return; // already aligned to the taskbar
    const target = Math.max(0, Math.round(window.scrollY + rectTop - taskbarH));
    if (Math.abs(target - window.scrollY) > 2) window.scrollTo(0, target);
  };
  for (const d of [40, 160, 320, 500, 720, 960]) window.setTimeout(attempt, d);
}

/** Fold a destination's reveal fields into the explorer state (open folders + selection). */
function reveal(explorer: ExplorerState, dest: WorkspaceDestination): ExplorerState {
  const openFolders = { ...explorer.openFolders };
  for (const f of dest.explorerPath ?? []) openFolders[f] = true;
  for (const f of dest.openFolders ?? []) openFolders[f] = true;
  return { ...explorer, openFolders, selectedFileId: dest.selectedFileId ?? explorer.selectedFileId };
}

function docContext(dest: WorkspaceDestination): { id: string; title: string } | null {
  if (dest.type === 'document') return { id: dest.docId, title: dest.title ?? dest.docId };
  if (dest.type === 'project') return { id: dest.projectId, title: dest.title ?? dest.projectId };
  return null;
}

function layoutFor(dest: WorkspaceDestination): WorkspaceLayout {
  return dest.layout ?? (dest.type === 'project' ? 'preview-left' : 'standard');
}

export const shell = {
  /** Load persisted shell state (centered/expanded + explorer). Does NOT mount panels. */
  init(): void {
    ready = false;
    const persisted = loadShell();
    if (persisted) this.hydrate(persisted);
    ready = true;
  },

  /** After Dockview binds, (re)mount the persisted/active destination's content panel. */
  reconcile(): void {
    const dest = get().destination;
    if (dest) workspace.open(dest);
  },

  /** THE entry point routes and clicks call. */
  openDestination(dest: WorkspaceDestination): void {
    const s = get();
    store.setState({
      destination: dest,
      presentation: 'expanded',
      layout: layoutFor(dest),
      explorer: reveal(s.explorer, dest),
      selectedDoc: docContext(dest) ?? s.selectedDoc,
    });
    beginTransition();
    workspace.open(dest);
    pinWorkspace();
    schedulePersist();
  },

  expand(): void {
    if (get().destination) store.setState({ presentation: 'expanded' });
  },

  /** Collapse back to the centered island — explorer/content state preserved. */
  returnToCentered(): void {
    if (get().presentation === 'centered' && !get().destination) return;
    store.setState({ presentation: 'centered', destination: null });
    beginTransition();
    workspace.showFeatured();
    schedulePersist();
  },

  selectFile(fileId: string): void {
    store.setState((st) => ({ explorer: { ...st.explorer, selectedFileId: fileId } }));
    schedulePersist();
  },

  /** Show the Featured overview panel (its explorer entry) and deselect any doc. */
  focusFeatured(): void {
    store.setState((st) => ({ explorer: { ...st.explorer, selectedFileId: null }, selectedDoc: null }));
    workspace.showFeatured();
    schedulePersist();
  },

  applyLayout(layout: WorkspaceLayout): void {
    store.setState({ layout });
    schedulePersist();
  },

  toggleFolder(folderId: string, open?: boolean): void {
    store.setState((st) => {
      const cur = st.explorer.openFolders[folderId] ?? false;
      return {
        explorer: { ...st.explorer, openFolders: { ...st.explorer.openFolders, [folderId]: open ?? !cur } },
      };
    });
    schedulePersist();
  },

  setExplorerWidth(px: number): void {
    const width = Math.max(MIN_EXPLORER_W, Math.min(MAX_EXPLORER_W, Math.round(px)));
    store.setState((st) => ({ explorer: { ...st.explorer, width } }));
    schedulePersist();
  },
  setExplorerScroll(top: number): void {
    store.setState((st) => ({ explorer: { ...st.explorer, scrollTop: top } }));
  },
  setContentScroll(top: number): void {
    store.setState({ contentScrollTop: top });
  },

  getSelectedDoc(): { id: string; title: string } | null {
    return get().selectedDoc;
  },

  /** Sync the workspace to a route (called by <WorkspaceRoute/>). */
  syncRoute(pathname: string): void {
    const dest = resolveRoute(pathname);
    if (dest) this.openDestination(dest);
    else this.returnToCentered();
  },

  persist(): void {
    const s = get();
    saveShell({
      version: 1,
      presentation: s.presentation,
      layout: s.layout,
      destination: s.destination,
      explorer: {
        openFolders: s.explorer.openFolders,
        selectedFileId: s.explorer.selectedFileId,
        width: s.explorer.width,
      },
    });
  },

  /**
   * Restore only the explorer state (open folders, selection, width). The route
   * — not stale persistence — decides what content shows, so presentation and
   * destination are (re)derived by `syncRoute` on mount (avoids ordering races).
   */
  hydrate(data: PersistedWorkspaceShell): void {
    const width = Math.max(MIN_EXPLORER_W, Math.min(MAX_EXPLORER_W, data.explorer?.width ?? DEFAULT_EXPLORER_W));
    store.setState((st) => ({
      explorer: {
        ...st.explorer,
        openFolders: data.explorer?.openFolders ?? {},
        selectedFileId: data.explorer?.selectedFileId ?? null,
        width,
      },
    }));
  },

  reset(): void {
    store.setState({ presentation: 'centered', destination: null, layout: 'standard', selectedDoc: null });
    schedulePersist();
  },
};

export type WorkspaceShellController = typeof shell;
