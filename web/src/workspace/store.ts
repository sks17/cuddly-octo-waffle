import { create } from 'zustand';
import type { Rect, SnapRegion, WorkspacePanelState } from './types';

export interface SnapPreview {
  /** 'tab' = docking into the top bar; otherwise an edge/corner snap. */
  kind: 'tab' | SnapRegion;
  rect: Rect;
}

export interface WorkspaceState {
  panels: Record<string, WorkspacePanelState>;
  /** Ordered ids of the panels currently living in the top tab bar. */
  tabOrder: string[];
  activeId: string | null;
  maximizedId: string | null;
  /** Monotonic stacking counter for floating panels. */
  zTop: number;
  /** Live drag preview overlay, or null. */
  snapPreview: SnapPreview | null;
  /** Available workspace area in local coords (below the tab bar). */
  workspaceRect: Rect;
}

/**
 * Pure reactive state. All mutations flow through the `workspace` controller,
 * which uses `useWorkspaceStore.setState` / `.getState`.
 */
export const useWorkspaceStore = create<WorkspaceState>()(() => ({
  panels: {},
  tabOrder: [],
  activeId: null,
  maximizedId: null,
  zTop: 10,
  snapPreview: null,
  workspaceRect: { x: 0, y: 0, width: 0, height: 0 },
}));
