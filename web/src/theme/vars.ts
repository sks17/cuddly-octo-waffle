import { contrastPick, rgba } from './derive';
import type { AppTheme } from './types';

/** "r, g, b" triplet from a #rgb / #rrggbb hex — lets `rgba(var(--accent-rgb), α)` follow the theme. */
function rgbTriplet(hex: string): string {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/**
 * The accent-dependent slice of the canonical vars. Split out so the accent
 * cycle (see accentCycle.ts) can repaint exactly these each frame and keep the
 * whole accent family — contrast pick, selection tint, rgba consumers — in step.
 */
export function accentVars(accent: string): Record<string, string> {
  return {
    '--accent': accent,
    '--accent-rgb': rgbTriplet(accent),
    '--accent-foreground': contrastPick(accent),
    '--selection': rgba(accent, 0.3),
  };
}

/**
 * The canonical CSS variables the provider writes on :root. Every other token in
 * globals.css is a static alias of one of these, so overriding these re-themes
 * the entire app (utilities + bespoke CSS) live.
 */
export function themeToVars(t: AppTheme): Record<string, string> {
  const c = t.colors;
  return {
    ...accentVars(c.accent),
    '--background': c.background,
    '--surface': c.surface,
    '--surface-elevated': c.surfaceElevated,
    '--foreground': c.foreground,
    '--muted-foreground': c.mutedForeground,
    '--border': c.border,
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
