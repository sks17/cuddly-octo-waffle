import type { AppTheme, ThemeColors, ThemeDefinition } from './types';

// ── color math (operates on #rgb / #rrggbb) ────────────────────────────────
type RGB = [number, number, number];

function toRgb(hex: string): RGB {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: RGB): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Blend: `t` is the weight of `a` (t=1 → a, t=0 → b). Returns opaque hex. */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  return toHex([ar * t + br * (1 - t), ag * t + bg * (1 - t), ab * t + bb * (1 - t)]);
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** WCAG relative luminance. */
function luminance(hex: string): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = toRgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Pick the pole (near-black / near-white) that best contrasts with `bg`. */
function contrastPick(bg: string): string {
  return contrast(bg, '#0b0b0b') >= contrast(bg, '#ffffff') ? '#0b0b0b' : '#f5f5f5';
}

/**
 * Derive the 13 semantic colors from a Monkeytype palette. Opaque colors
 * (surface/border) are computed as concrete hex so Tailwind /α utilities behave;
 * translucent ones (selection/scrollbar/taskbar) are rgba strings.
 */
export function deriveTheme(def: ThemeDefinition): AppTheme {
  const { bg, main, sub, text } = def.palette;
  const dark = def.appearance === 'dark';
  const bgLight = luminance(bg) > 0.5;

  // Ensure body text is legible against the background (some ported palettes
  // carry a low-contrast text color); fall back to a safe pole if needed.
  const foreground = contrast(text, bg) >= 3.5 ? text : bgLight ? '#161616' : '#ededed';

  const colors: ThemeColors = {
    background: bg,
    surface: mix(bg, foreground, dark ? 0.92 : 0.95),
    surfaceElevated: mix(bg, foreground, dark ? 0.84 : 0.9),
    foreground,
    mutedForeground: contrast(sub, bg) >= 2.2 ? sub : mix(foreground, bg, 0.6),
    border: mix(bg, sub, dark ? 0.7 : 0.58),
    accent: main,
    accentForeground: contrastPick(main),
    selection: rgba(main, 0.3),
    scrollbarTrack: 'transparent',
    scrollbarThumb: rgba(sub, 0.42),
    taskbarBackground: rgba(bg, 0.72),
    panelShadow: dark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.16)',
  };
  return { id: def.id, name: def.name, appearance: def.appearance, colors };
}
