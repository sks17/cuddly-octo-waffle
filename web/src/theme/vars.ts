import type { AppTheme } from './types';

/** "r, g, b" triplet from a #rgb / #rrggbb hex — lets `rgba(var(--accent-rgb), α)` follow the theme. */
function rgbTriplet(hex: string): string {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/**
 * The canonical CSS variables the provider writes on :root. Every other token in
 * globals.css is a static alias of one of these, so overriding these re-themes
 * the entire app (utilities + bespoke CSS) live.
 */
export function themeToVars(t: AppTheme): Record<string, string> {
  const c = t.colors;
  return {
    '--accent-rgb': rgbTriplet(c.accent),
    '--background': c.background,
    '--surface': c.surface,
    '--surface-elevated': c.surfaceElevated,
    '--foreground': c.foreground,
    '--muted-foreground': c.mutedForeground,
    '--border': c.border,
    '--accent': c.accent,
    '--accent-foreground': c.accentForeground,
    '--selection': c.selection,
    '--scrollbar-track': c.scrollbarTrack,
    '--scrollbar-thumb': c.scrollbarThumb,
    '--taskbar-background': c.taskbarBackground,
    '--panel-shadow': c.panelShadow,
  };
}

/** Idempotent — safe under StrictMode double-invoke and the pre-paint boot script. */
export function applyVars(vars: Record<string, string>, el: HTMLElement = document.documentElement): void {
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
}
