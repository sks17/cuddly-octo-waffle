/**
 * Theme-Aware Accent System
 * 
 * Dynamically generates accent colors based on the selected background hue.
 * This creates a cohesive visual system where all accent elements (borders,
 * highlights, buttons, gradients) automatically update to match the background.
 * 
 * Color Strategy:
 * - Purple (default): Original purple accent colors (preserves existing design)
 * - Other hues: Derives light/regular/dark accent shades with proper contrast
 * - Light mode: Darker, more saturated accents for contrast on light backgrounds
 * - Dark mode: Lighter, less saturated accents for contrast on dark backgrounds
 * 
 * Gradient Strategy:
 * - Uses CSS custom properties (--gradient-stop-1/2/3) for dynamic updates
 * - Maintains original gradient character (150deg angle, 3-stop progression)
 * - Gradient-accent-orange: Uses derived complementary color as first stop
 */

// Hue-to-HSL mappings for different background colors
// These values are tuned to provide good contrast and visual harmony
const HUE_COLOR_MAP: Record<string, {
  light: { h: number; s: number; l: number };
  regular: { h: number; s: number; l: number };
  dark: { h: number; s: number; l: number };
  complementary: string; // For gradient-accent-orange first stop
}> = {
  purple: {
    light: { h: 280, s: 89, l: 67 },    // #c561f6 - original
    regular: { h: 280, s: 80, l: 47 },  // #7611a6 - original
    dark: { h: 270, s: 100, l: 17 },    // #1c0056 - original
    complementary: '#ca7879'             // Original orange complement
  },
  gray: {
    light: { h: 220, s: 15, l: 65 },
    regular: { h: 220, s: 20, l: 45 },
    dark: { h: 220, s: 25, l: 25 },
    complementary: '#8a9199'
  },
  red: {
    light: { h: 0, s: 75, l: 65 },
    regular: { h: 0, s: 70, l: 45 },
    dark: { h: 0, s: 75, l: 25 },
    complementary: '#e87c7c'
  },
  orange: {
    light: { h: 25, s: 85, l: 65 },
    regular: { h: 25, s: 80, l: 45 },
    dark: { h: 25, s: 85, l: 25 },
    complementary: '#f0a868'
  },
  yellow: {
    light: { h: 45, s: 90, l: 65 },
    regular: { h: 45, s: 85, l: 50 },
    dark: { h: 45, s: 90, l: 30 },
    complementary: '#f5d77a'
  },
  green: {
    light: { h: 140, s: 60, l: 60 },
    regular: { h: 140, s: 55, l: 40 },
    dark: { h: 140, s: 60, l: 20 },
    complementary: '#74c992'
  },
  teal: {
    light: { h: 180, s: 65, l: 60 },
    regular: { h: 180, s: 60, l: 40 },
    dark: { h: 180, s: 65, l: 20 },
    complementary: '#6bc4c4'
  },
  blue: {
    light: { h: 220, s: 75, l: 65 },
    regular: { h: 220, s: 70, l: 45 },
    dark: { h: 220, s: 75, l: 25 },
    complementary: '#7c9de8'
  },
  pink: {
    light: { h: 330, s: 80, l: 70 },
    regular: { h: 330, s: 75, l: 50 },
    dark: { h: 330, s: 80, l: 30 },
    complementary: '#e87cae'
  }
};

/**
 * Adjusts accent colors for light vs dark mode
 * Light mode: Uses darker, more saturated colors for contrast
 * Dark mode: Uses lighter, less saturated colors for contrast
 */
function adjustForTheme(hsl: { h: number; s: number; l: number }, isDark: boolean): string {
  if (isDark) {
    // In dark mode, lighten and slightly desaturate
    const adjustedL = Math.min(hsl.l + 15, 85);
    const adjustedS = Math.max(hsl.s - 10, 40);
    return `hsl(${hsl.h}, ${adjustedS}%, ${adjustedL}%)`;
  } else {
    // In light mode, darken and slightly saturate
    const adjustedL = Math.max(hsl.l - 10, 20);
    const adjustedS = Math.min(hsl.s + 5, 95);
    return `hsl(${hsl.h}, ${adjustedS}%, ${adjustedL}%)`;
  }
}

/**
 * Generates HSL overlay color with proper alpha for the given hue
 */
function generateOverlay(hsl: { h: number; s: number; l: number }): string {
  return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.33)`;
}

/**
 * Updates all accent-related CSS custom properties based on background hue
 * This is the main entry point called when background color changes
 */
export function updateAccentTheme(hue: string): void {
  const colors = HUE_COLOR_MAP[hue] || HUE_COLOR_MAP.purple;
  const isDark = document.documentElement.classList.contains('theme-dark');
  
  // Calculate adjusted colors for current theme
  const accentLight = adjustForTheme(colors.light, isDark);
  const accentRegular = adjustForTheme(colors.regular, isDark);
  const accentDark = adjustForTheme(colors.dark, isDark);
  const accentOverlay = generateOverlay(colors.light);
  
  // Update CSS custom properties on :root
  const root = document.documentElement;
  root.style.setProperty('--accent-light-override', accentLight);
  root.style.setProperty('--accent-regular-override', accentRegular);
  root.style.setProperty('--accent-dark-override', accentDark);
  root.style.setProperty('--accent-overlay', accentOverlay);
  root.style.setProperty('--accent-subtle-overlay', accentOverlay);
  
  // Update gradient stops (these feed into --gradient-accent)
  root.style.setProperty('--gradient-stop-1', accentLight);
  root.style.setProperty('--gradient-stop-2', accentRegular);
  root.style.setProperty('--gradient-stop-3', accentDark);
  
  // Update gradient-accent-orange first stop with complementary color
  root.style.setProperty('--gradient-accent-orange-stop-1', colors.complementary);
  
  console.log(`🎨 Updated accent theme for hue: ${hue}`, {
    light: accentLight,
    regular: accentRegular,
    dark: accentDark,
    overlay: accentOverlay,
    complementary: colors.complementary
  });
}

/**
 * Initializes accent theme system with conflict prevention
 * Sets up theme change listener and ensures purple default
 */
export function initAccentTheme(): void {
  // Prevent multiple initializations
  if (document.documentElement.hasAttribute('data-accent-system-initialized')) {
    return;
  }
  document.documentElement.setAttribute('data-accent-system-initialized', 'true');
  
  // Listen for theme changes (light/dark mode toggle)
  const observer = new MutationObserver(() => {
    // Re-apply current accent theme with new light/dark context
    const currentHue = document.documentElement.getAttribute('data-accent-hue') || 'purple';
    updateAccentTheme(currentHue);
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Set initial hue data attribute if not present (default to purple)
  if (!document.documentElement.getAttribute('data-accent-hue')) {
    document.documentElement.setAttribute('data-accent-hue', 'purple');
    // Apply the default purple theme immediately
    updateAccentTheme('purple');
  }
  
  console.log('🎨 Accent theme system initialized');
}

/**
 * Updates the accent hue and stores it as a data attribute
 * This allows the system to remember the current hue across theme changes
 */
export function setAccentHue(hue: string): void {
  document.documentElement.setAttribute('data-accent-hue', hue);
  updateAccentTheme(hue);
}
