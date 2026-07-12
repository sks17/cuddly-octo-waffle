import type { DockviewApi } from 'dockview';
import {
  PANEL_TYPES,
  SNAP_MODE,
  isFloatingLike,
  isSnapped,
  type PanelMode,
  type PanelType,
  type SnapRegion,
  type WorkspacePanelState,
} from './types';
import { useWorkspaceStore } from './store';
import { getDockApi } from './refs';
import { snapRect } from './snap';
import { loadLayout, saveLayout, type PersistedLayout } from './persistence';

const store = useWorkspaceStore;

const MIN_W = 240;
const MIN_H = 150;

const TITLES: Record<PanelType, string> = {
  notes: 'Notes',
  'file-browser': 'File Browser',
  preview: 'Preview',
  terminal: 'Terminal',
  settings: 'Settings',
};

const DEFAULT_SIZE: Record<PanelType, { width: number; height: number }> = {
  notes: { width: 460, height: 320 },
  'file-browser': { width: 320, height: 420 },
  preview: { width: 540, height: 380 },
  terminal: { width: 580, height: 300 },
  settings: { width: 440, height: 360 },
};

const DOCK_COMPONENT = 'workspacePanel';

let idCounter = 0;
let ready = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

// ── helpers ──────────────────────────────────────────────────────────────
const get = () => store.getState();
const panel = (id: string): WorkspacePanelState | undefined => get().panels[id];

function requirePanel(id: string): WorkspacePanelState {
  const p = panel(id);
  if (!p) throw new Error(`unknown panel: "${id}"`);
  return p;
}

function patch(id: string, changes: Partial<WorkspacePanelState>): void {
  store.setState((s) => {
    const cur = s.panels[id];
    if (!cur) return s;
    return { panels: { ...s.panels, [id]: { ...cur, ...changes } } };
  });
}

function nextZ(): number {
  const z = get().zTop + 1;
  store.setState({ zTop: z });
  return z;
}

function floatingCount(): number {
  return Object.values(get().panels).filter((p) => isFloatingLike(p.mode)).length;
}

function clamp(x: number, y: number, w: number, h: number) {
  const ws = get().workspaceRect;
  const bw = ws.width || w;
  const bh = ws.height || h;
  const width = Math.max(MIN_W, Math.min(w, bw));
  const height = Math.max(MIN_H, Math.min(h, bh));
  const nx = Math.max(0, Math.min(x, Math.max(0, bw - width)));
  const ny = Math.max(0, Math.min(y, Math.max(0, bh - height)));
  return { x: Math.round(nx), y: Math.round(ny), width: Math.round(width), height: Math.round(height) };
}

function defaultFloatGeom(type: PanelType) {
  const size = DEFAULT_SIZE[type];
  const n = floatingCount();
  return clamp(48 + n * 28, 40 + n * 28, size.width, size.height);
}

/** A clean snapshot (no nested previousState) for restore points. */
function snapshot(p: WorkspacePanelState): WorkspacePanelState {
  return { ...p, previousState: null };
}

// ── Dockview sync ─────────────────────────────────────────────────────────
function addToDock(id: string): void {
  const api = getDockApi();
  const p = panel(id);
  if (!api || !p || api.getPanel(id)) return;
  api.addPanel({ id, component: DOCK_COMPONENT, title: p.title, params: { panelId: id } });
}

function removeFromDock(id: string): void {
  const api = getDockApi();
  const dp = api?.getPanel(id);
  if (api && dp) api.removePanel(dp);
}

function setActive(id: string | null, syncDock = true): void {
  store.setState((s) => {
    const panels: Record<string, WorkspacePanelState> = {};
    for (const [pid, p] of Object.entries(s.panels)) panels[pid] = { ...p, isActive: pid === id };
    return { panels, activeId: id };
  });
  if (syncDock && id) {
    const p = panel(id);
    if (p?.mode === 'tabbed') getDockApi()?.getPanel(id)?.api.setActive();
  }
}

// ── persistence ─────────────────────────────────────────────────────────
function schedulePersist(): void {
  if (!ready) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => workspace.saveLayout(), 250);
}

// ── controller ─────────────────────────────────────────────────────────
export const workspace = {
  /** Wire Dockview events once the layout is ready, then load persisted/default. */
  bind(api: DockviewApi): void {
    // Re-initialize cleanly for this Dockview instance (React StrictMode/HMR can
    // mount twice); auto-persist means no arrangement is lost across a remount.
    ready = false;
    store.setState({ panels: {}, tabOrder: [], activeId: null, maximizedId: null, zTop: 10, snapPreview: null });
    api.clear();

    // Reflect user tab clicks into our active state (no dock write-back loop).
    api.onDidActivePanelChange((e) => {
      const id = e.panel?.id;
      if (id && panel(id)?.mode === 'tabbed' && get().activeId !== id) setActive(id, false);
    });
    // Keep tab order in sync when Dockview reorders tabs via drag.
    const syncTabOrder = () => {
      const group = api.groups[0];
      if (!group) return;
      const order = group.panels.map((p) => p.id).filter((pid) => panel(pid)?.mode === 'tabbed');
      if (order.length && order.join() !== get().tabOrder.join()) store.setState({ tabOrder: order });
    };
    api.onDidMovePanel(syncTabOrder);

    ready = true;
    const persisted = loadLayout();
    if (persisted) this.hydrate(persisted);
    else this.loadDefault();
  },

  genId(type: PanelType): string {
    let id: string;
    do id = `${type}-${++idCounter}`;
    while (get().panels[id]);
    return id;
  },

  openPanel(type: PanelType, id?: string, mode: PanelMode = 'tabbed'): string {
    if (!(PANEL_TYPES as readonly string[]).includes(type)) {
      throw new Error(`unknown panel type: "${type}" (try: ${PANEL_TYPES.join(', ')})`);
    }
    const pid = id ?? this.genId(type);
    if (get().panels[pid]) throw new Error(`panel "${pid}" already exists`);
    const base: WorkspacePanelState = {
      id: pid,
      type,
      title: TITLES[type],
      mode: 'tabbed',
      isActive: true,
    };
    store.setState((s) => ({ panels: { ...s.panels, [pid]: base }, tabOrder: [...s.tabOrder, pid] }));
    addToDock(pid);
    setActive(pid);
    if (mode !== 'tabbed') {
      if (mode === 'floating') this.floatPanel(pid);
      else if (isSnapped(mode)) this.snapPanel(pid, mode.replace('snapped-', '') as SnapRegion);
      else if (mode === 'maximized') this.maximizePanel(pid);
    }
    schedulePersist();
    return pid;
  },

  closePanel(id: string): void {
    requirePanel(id);
    removeFromDock(id);
    store.setState((s) => {
      const panels = { ...s.panels };
      delete panels[id];
      const tabOrder = s.tabOrder.filter((x) => x !== id);
      const remaining = Object.keys(panels);
      const activeId = s.activeId === id ? (tabOrder[tabOrder.length - 1] ?? remaining[0] ?? null) : s.activeId;
      const maximizedId = s.maximizedId === id ? null : s.maximizedId;
      return { panels, tabOrder, activeId, maximizedId };
    });
    if (get().activeId) setActive(get().activeId);
    schedulePersist();
  },

  focusPanel(id: string): void {
    const p = requirePanel(id);
    if (isFloatingLike(p.mode)) patch(id, { zIndex: nextZ() });
    setActive(id);
    schedulePersist();
  },

  floatPanel(id: string): void {
    const p = requirePanel(id);
    removeFromDock(id);
    const geom =
      isFloatingLike(p.mode) && p.x != null && p.y != null && p.width != null && p.height != null
        ? clamp(p.x, p.y, p.width, p.height)
        : defaultFloatGeom(p.type);
    store.setState((s) => ({
      tabOrder: s.tabOrder.filter((x) => x !== id),
      maximizedId: s.maximizedId === id ? null : s.maximizedId,
    }));
    patch(id, { mode: 'floating', ...geom, zIndex: nextZ(), previousState: null });
    setActive(id, false);
    schedulePersist();
  },

  tabPanel(id: string): void {
    const p = requirePanel(id);
    if (p.mode === 'tabbed') {
      setActive(id);
      return;
    }
    store.setState((s) => ({ maximizedId: s.maximizedId === id ? null : s.maximizedId }));
    patch(id, {
      mode: 'tabbed',
      x: undefined,
      y: undefined,
      width: undefined,
      height: undefined,
      zIndex: undefined,
      previousState: null,
    });
    store.setState((s) => (s.tabOrder.includes(id) ? s : { tabOrder: [...s.tabOrder, id] }));
    addToDock(id);
    setActive(id);
    schedulePersist();
  },

  snapPanel(id: string, region: SnapRegion): void {
    if (!SNAP_MODE[region]) throw new Error(`unsupported snap location: "${region}"`);
    const p = requirePanel(id);
    removeFromDock(id);
    const rect = snapRect(region, get().workspaceRect);
    const previousState = p.previousState ?? snapshot(p);
    store.setState((s) => ({
      tabOrder: s.tabOrder.filter((x) => x !== id),
      maximizedId: s.maximizedId === id ? null : s.maximizedId,
    }));
    patch(id, {
      mode: SNAP_MODE[region],
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      zIndex: nextZ(),
      previousState,
    });
    setActive(id, false);
    schedulePersist();
  },

  maximizePanel(id: string): void {
    const p = requirePanel(id);
    if (p.mode === 'maximized') return;
    const previousState = p.previousState ?? snapshot(p);
    if (p.mode === 'tabbed') removeFromDock(id);
    store.setState((s) => ({ tabOrder: s.tabOrder.filter((x) => x !== id), maximizedId: id }));
    patch(id, { mode: 'maximized', zIndex: nextZ(), previousState });
    setActive(id, false);
    schedulePersist();
  },

  restorePanel(id: string): void {
    const p = requirePanel(id);
    store.setState((s) => ({ maximizedId: s.maximizedId === id ? null : s.maximizedId }));
    const prev = p.previousState;
    if (!prev) {
      // Nothing to restore to → drop to a sensible floating window.
      patch(id, { mode: 'floating', ...defaultFloatGeom(p.type), zIndex: nextZ(), previousState: null });
      setActive(id, false);
      schedulePersist();
      return;
    }
    patch(id, { ...prev, isActive: true, zIndex: nextZ(), previousState: null });
    if (prev.mode === 'tabbed') {
      store.setState((s) => (s.tabOrder.includes(id) ? s : { tabOrder: [...s.tabOrder, id] }));
      addToDock(id);
      setActive(id);
    } else {
      setActive(id, false);
    }
    schedulePersist();
  },

  movePanel(id: string, x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('move: x and y must be numbers');
    const p = requirePanel(id);
    if (p.mode === 'tabbed' || p.mode === 'maximized') this.floatPanel(id);
    const cur = panel(id)!;
    const geom = clamp(x, y, cur.width ?? DEFAULT_SIZE[cur.type].width, cur.height ?? DEFAULT_SIZE[cur.type].height);
    patch(id, { mode: 'floating', ...geom });
    schedulePersist();
  },

  resizePanel(id: string, width: number, height: number): void {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new Error('resize: width and height must be positive numbers');
    }
    const p = requirePanel(id);
    if (p.mode === 'tabbed' || p.mode === 'maximized') this.floatPanel(id);
    const cur = panel(id)!;
    const geom = clamp(cur.x ?? 40, cur.y ?? 40, width, height);
    patch(id, { mode: 'floating', ...geom });
    schedulePersist();
  },

  /** Live geometry update during a drag/resize gesture (no persistence churn). */
  setGeometry(id: string, mode: PanelMode, rect: { x: number; y: number; width: number; height: number }): void {
    patch(id, { mode, ...rect });
  },

  /** Finalize a drag/resize into a persisted floating position. */
  commitGeometry(id: string, rect: { x: number; y: number; width: number; height: number }): void {
    const p = requirePanel(id);
    const geom = clamp(rect.x, rect.y, rect.width, rect.height);
    patch(id, { mode: 'floating', ...geom, zIndex: p.zIndex ?? nextZ(), previousState: null });
    schedulePersist();
  },

  /** Re-apply snap rectangles and clamp floating panels after a viewport resize. */
  reflow(): void {
    const ws = get().workspaceRect;
    if (ws.width === 0 || ws.height === 0) return;
    for (const p of Object.values(get().panels)) {
      if (isSnapped(p.mode)) {
        const region = p.mode.replace('snapped-', '') as SnapRegion;
        patch(p.id, snapRect(region, ws));
      } else if (p.mode === 'floating' && p.x != null && p.y != null) {
        patch(p.id, clamp(p.x, p.y, p.width ?? 320, p.height ?? 240));
      }
    }
  },

  /** Default floating size for a panel type (used when detaching a tab). */
  defaultSize(type: PanelType): { width: number; height: number } {
    return DEFAULT_SIZE[type];
  },

  /** Detach a panel into floating drag mode at a given rect (no persistence). */
  beginFloatDrag(id: string, rect: { x: number; y: number; width: number; height: number }): void {
    requirePanel(id);
    removeFromDock(id);
    store.setState((s) => ({
      tabOrder: s.tabOrder.filter((x) => x !== id),
      maximizedId: s.maximizedId === id ? null : s.maximizedId,
    }));
    patch(id, { mode: 'floating', ...rect, zIndex: nextZ() });
    setActive(id, false);
  },

  /** Restore a panel to a captured snapshot (used to cancel a drag). */
  applyState(id: string, state: WorkspacePanelState): void {
    requirePanel(id);
    removeFromDock(id);
    if (state.mode === 'tabbed') {
      patch(id, { mode: 'tabbed', x: undefined, y: undefined, width: undefined, height: undefined, zIndex: undefined, previousState: state.previousState ?? null });
      store.setState((s) => ({
        tabOrder: s.tabOrder.includes(id) ? s.tabOrder : [...s.tabOrder, id],
        maximizedId: s.maximizedId === id ? null : s.maximizedId,
      }));
      addToDock(id);
      setActive(id);
    } else if (state.mode === 'maximized') {
      patch(id, { ...state, zIndex: nextZ() });
      store.setState({ maximizedId: id });
      setActive(id, false);
    } else {
      patch(id, { ...state, zIndex: nextZ() });
      store.setState((s) => ({
        tabOrder: s.tabOrder.filter((x) => x !== id),
        maximizedId: s.maximizedId === id ? null : s.maximizedId,
      }));
      setActive(id, false);
    }
    schedulePersist();
  },

  /** Persist a piece of a panel's lifted content (e.g. notes text). */
  setData(id: string, key: string, value: unknown): void {
    const p = requirePanel(id);
    patch(id, { data: { ...(p.data ?? {}), [key]: value } });
    schedulePersist();
  },

  listPanels(): WorkspacePanelState[] {
    return Object.values(get().panels);
  },

  resetLayout(): void {
    for (const id of Object.keys(get().panels)) removeFromDock(id);
    getDockApi()?.clear();
    store.setState({ panels: {}, tabOrder: [], activeId: null, maximizedId: null, zTop: 10, snapPreview: null });
    this.loadDefault();
    schedulePersist();
  },

  loadDefault(): void {
    this.openPanel('notes', 'notes-1');
    this.openPanel('file-browser', 'files-1');
    this.openPanel('preview', 'preview-1');
    this.openPanel('terminal', 'terminal-1');
    this.floatPanel('terminal-1');
    setActive('notes-1');
  },

  saveLayout(): void {
    const s = get();
    const data: PersistedLayout = {
      version: 1,
      panels: Object.values(s.panels),
      tabOrder: s.tabOrder,
      activeId: s.activeId,
      maximizedId: s.maximizedId,
      zTop: s.zTop,
    };
    saveLayout(data);
  },

  loadLayout(): void {
    const persisted = loadLayout();
    if (persisted) this.hydrate(persisted);
    else this.resetLayout();
  },

  hydrate(data: PersistedLayout): void {
    for (const id of Object.keys(get().panels)) removeFromDock(id);
    getDockApi()?.clear();
    const panels: Record<string, WorkspacePanelState> = {};
    for (const p of data.panels) panels[p.id] = p;
    store.setState({
      panels,
      tabOrder: data.tabOrder.filter((id) => panels[id]),
      activeId: data.activeId,
      maximizedId: data.maximizedId,
      zTop: data.zTop ?? 10,
      snapPreview: null,
    });
    // Re-add tabbed panels to Dockview in saved order.
    for (const id of data.tabOrder) if (panels[id]?.mode === 'tabbed') addToDock(id);
    if (data.activeId) setActive(data.activeId);
  },
};

export type WorkspaceController = typeof workspace;
