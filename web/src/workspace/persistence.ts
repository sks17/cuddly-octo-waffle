import type { WorkspacePanelState } from './types';
import { PANEL_TYPES } from './types';

/** Versioned key so an incompatible saved layout can be invalidated safely. */
export const STORAGE_KEY = 'dockview-workspace-layout-v1';

export interface PersistedLayout {
  version: 1;
  panels: WorkspacePanelState[];
  tabOrder: string[];
  activeId: string | null;
  maximizedId: string | null;
  zTop: number;
}

const VALID_MODES = new Set([
  'tabbed', 'floating', 'snapped-left', 'snapped-right',
  'snapped-bottom-left', 'snapped-bottom-right', 'maximized',
]);

function validPanel(p: unknown): p is WorkspacePanelState {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.type === 'string' &&
    (PANEL_TYPES as readonly string[]).includes(o.type) &&
    typeof o.mode === 'string' &&
    VALID_MODES.has(o.mode)
  );
}

function isValid(data: unknown): data is PersistedLayout {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return (
    o.version === 1 &&
    Array.isArray(o.panels) &&
    o.panels.every(validPanel) &&
    Array.isArray(o.tabOrder)
  );
}

export function saveLayout(data: PersistedLayout): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

/** Returns a valid layout, or null if missing/corrupt (caller loads default). */
export function loadLayout(): PersistedLayout | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearLayout(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
