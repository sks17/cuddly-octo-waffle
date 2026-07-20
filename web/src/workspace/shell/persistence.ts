import type { WorkspaceDestination, WorkspaceLayout, WorkspacePresentation } from './types';

export const SHELL_STORAGE_KEY = 'far-flare:workspace-shell:v1';

export interface PersistedWorkspaceShell {
  version: 1;
  presentation: WorkspacePresentation;
  layout: WorkspaceLayout;
  destination: WorkspaceDestination | null;
  explorer: { openFolders: Record<string, boolean>; selectedFileId: string | null; width: number };
}

const PRESENTATIONS = new Set(['centered', 'expanded']);
const LAYOUTS = new Set(['standard', 'full-workspace', 'preview-left']);

function isValid(d: unknown): d is PersistedWorkspaceShell {
  if (!d || typeof d !== 'object') return false;
  const o = d as Record<string, unknown>;
  if (o.version !== 1) return false;
  if (typeof o.presentation !== 'string' || !PRESENTATIONS.has(o.presentation)) return false;
  if (typeof o.layout !== 'string' || !LAYOUTS.has(o.layout)) return false;
  if (o.destination !== null && (typeof o.destination !== 'object' || !(o.destination as { type?: unknown }).type)) {
    return false;
  }
  if (!o.explorer || typeof o.explorer !== 'object') return false;
  return true;
}

export function saveShell(data: PersistedWorkspaceShell): void {
  try {
    localStorage.setItem(SHELL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function loadShell(): PersistedWorkspaceShell | null {
  try {
    const raw = localStorage.getItem(SHELL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearShell(): void {
  try {
    localStorage.removeItem(SHELL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
