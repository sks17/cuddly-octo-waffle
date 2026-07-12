export const PANEL_TYPES = ['notes', 'file-browser', 'preview', 'terminal', 'settings'] as const;
export type PanelType = (typeof PANEL_TYPES)[number];

export type PanelMode =
  | 'tabbed'
  | 'floating'
  | 'snapped-left'
  | 'snapped-right'
  | 'snapped-bottom-left'
  | 'snapped-bottom-right'
  | 'maximized';

export type SnapRegion = 'left' | 'right' | 'bottom-left' | 'bottom-right';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Full state for a panel. The workspace is driven off this — never off DOM
 * position — so mode/geometry survive serialization and re-layout.
 */
export interface WorkspacePanelState {
  id: string;
  type: PanelType;
  title: string;
  mode: PanelMode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  /** Snapshot to return to from a maximized/snapped mode. */
  previousState?: WorkspacePanelState | null;
  isActive: boolean;
  zIndex?: number;
  /** Lifted panel content (e.g. notes text) so it survives tabbed↔floating remounts. */
  data?: Record<string, unknown>;
}

export const SNAP_MODE: Record<SnapRegion, PanelMode> = {
  left: 'snapped-left',
  right: 'snapped-right',
  'bottom-left': 'snapped-bottom-left',
  'bottom-right': 'snapped-bottom-right',
};

export const isSnapped = (m: PanelMode): boolean => m.startsWith('snapped-');
export const isFloatingLike = (m: PanelMode): boolean => m === 'floating' || isSnapped(m);
