export const THEME_STORAGE_KEY = 'far-flare:theme:v1';

/** Pre-resolved vars are stored so the boot script needs zero color math. */
export interface PersistedTheme {
  version: 1;
  id: string;
  vars: Record<string, string>;
}

export function saveTheme(data: PersistedTheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function loadTheme(): PersistedTheme | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      (parsed as PersistedTheme).version === 1 &&
      typeof (parsed as PersistedTheme).id === 'string' &&
      (parsed as PersistedTheme).vars &&
      typeof (parsed as PersistedTheme).vars === 'object'
    ) {
      return parsed as PersistedTheme;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearTheme(): void {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
