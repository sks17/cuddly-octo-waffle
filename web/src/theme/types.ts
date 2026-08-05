export type ThemeAppearance = 'dark' | 'light';

/** The 13 resolved semantic colors — every one is a concrete CSS color string. */
export interface ThemeColors {
  background: string;
  surface: string; // cards / islands / explorer / document surfaces
  surfaceElevated: string; // popovers / menus / floating windows / code blocks
  foreground: string;
  mutedForeground: string; // secondary text, breadcrumbs, tree leaves
  border: string; // opaque, so /α utilities behave
  accent: string; // vivid theme accent (Monkeytype --main-color)
  accentForeground: string; // contrast-picked text/icon on accent
  selection: string; // ::selection background
  scrollbarTrack: string;
  scrollbarThumb: string;
  taskbarBackground: string; // translucent (blur look)
  panelShadow: string; // window/panel box-shadow color
}

/**
 * An accent color cycle, ported from a Monkeytype theme's CSS keyframes (a
 * handful of themes animate `--main-color` rather than holding it constant).
 */
export interface ThemeAnimation {
  /** Cycle stops, interpolated in order and wrapped from the last back to the first. */
  colors: string[];
  /** Duration of one full cycle, in milliseconds. */
  durationMs: number;
}

export interface AppTheme {
  id: string; // slug: 'serika-dark'
  name: string; // display: 'serika dark'
  appearance: ThemeAppearance;
  colors: ThemeColors;
  animation?: ThemeAnimation;
}

/** Raw ported Monkeytype palette; the 13 semantic colors are DERIVED from these. */
export interface MonkeytypePalette {
  bg: string;
  main: string;
  sub: string;
  text: string;
  error?: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  appearance: ThemeAppearance;
  palette: MonkeytypePalette;
  /** Present only on the themes whose Monkeytype CSS cycles the accent. */
  animation?: ThemeAnimation;
}
