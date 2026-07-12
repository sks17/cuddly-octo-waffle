import { useWorkspaceStore } from './store';
import { workspace } from './controller';
import { getRootEl, getWorkspaceEl } from './refs';
import { detectSnap, snapRect } from './snap';
import type { SnapRegion, WorkspacePanelState } from './types';

interface DragTarget {
  kind: 'tab' | SnapRegion | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

const rectOf = (el: HTMLElement | null): DOMRect => el?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0);
const clampAxis = (v: number, size: number, avail: number) => Math.max(0, Math.min(v, Math.max(0, avail - size)));

/**
 * Start a panel drag from a header/handle. Works for both a floating window's
 * toolbar and a tab (which auto-detaches into floating). Handles drop-target
 * priority, live previews, bounds clamping, and Escape-to-cancel.
 *
 * Drop priority: (1) tab organizer → dock · (2) corner → quarter · (3) edge →
 * half · (4) elsewhere → floating.
 */
export function startPanelDrag(
  panelId: string,
  ev: { clientX: number; clientY: number },
  opts: { fromTab?: boolean } = {},
): void {
  const store = useWorkspaceStore;
  const panel = store.getState().panels[panelId];
  if (!panel) return;
  const before: WorkspacePanelState = { ...panel };

  const stage0 = rectOf(getWorkspaceEl());
  let grabX: number;
  let grabY: number;
  let width: number;
  let height: number;

  if (opts.fromTab || before.mode === 'tabbed' || before.width == null) {
    const size = workspace.defaultSize(before.type);
    width = size.width;
    height = size.height;
    grabX = Math.min(64, Math.round(width * 0.2)); // anchor pointer near the header's start
    grabY = 14;
    const x = clampAxis(ev.clientX - stage0.left - grabX, width, stage0.width);
    const y = clampAxis(ev.clientY - stage0.top - grabY, height, stage0.height);
    workspace.beginFloatDrag(panelId, { x, y, width, height });
  } else {
    width = before.width;
    height = before.height!;
    grabX = ev.clientX - stage0.left - (before.x ?? 0);
    grabY = ev.clientY - stage0.top - (before.y ?? 0);
    workspace.focusPanel(panelId);
  }

  const target: DragTarget = { kind: null, x: 0, y: 0, width, height };

  const onMove = (e: PointerEvent) => {
    e.preventDefault();
    const stage = rectOf(getWorkspaceEl());
    const root = rectOf(getRootEl());
    const area = store.getState().workspaceRect;

    // Always follow the pointer (clamped in bounds).
    const localX = e.clientX - stage.left;
    const localY = e.clientY - stage.top;
    const nx = clampAxis(localX - grabX, width, area.width);
    const ny = clampAxis(localY - grabY, height, area.height);
    workspace.setGeometry(panelId, 'floating', { x: nx, y: ny, width, height });

    // (1) Tab organizer hitbox = the strip between the root top and the stage top.
    const inTabBar =
      e.clientX >= root.left && e.clientX <= root.right && e.clientY >= root.top && e.clientY < stage.top;
    if (inTabBar) {
      target.kind = 'tab';
      store.setState({ snapPreview: { kind: 'tab', rect: { x: 0, y: 0, width: area.width, height: 0 } } });
      return;
    }

    // (2)/(3) corner + edge snapping (corners take priority inside detectSnap).
    const region = detectSnap(localX, localY, area);
    if (region) {
      const rect = snapRect(region, area);
      target.kind = region;
      target.x = rect.x;
      target.y = rect.y;
      target.width = rect.width;
      target.height = rect.height;
      store.setState({ snapPreview: { kind: region, rect } });
    } else {
      // (4) floating
      target.kind = null;
      target.x = nx;
      target.y = ny;
      target.width = width;
      target.height = height;
      store.setState({ snapPreview: null });
    }
  };

  const cleanup = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('keydown', onKey);
    store.setState({ snapPreview: null });
  };

  const onUp = () => {
    cleanup();
    if (target.kind === 'tab') workspace.tabPanel(panelId);
    else if (target.kind) workspace.snapPanel(panelId, target.kind);
    else workspace.commitGeometry(panelId, { x: target.x, y: target.y, width: target.width, height: target.height });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup();
      workspace.applyState(panelId, before);
    }
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('keydown', onKey);
}
