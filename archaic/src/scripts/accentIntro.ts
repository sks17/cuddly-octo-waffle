/**
 * Smooth RGB Gradient Animation
 * 
 * Creates a smooth rainbow gradient animation on every page load that cycles through
 * all colors before settling on the user's current accent color. Uses requestAnimationFrame
 * for smooth 60fps animation. Checks cookies to skip animation on repeat visits.
 */

import { getState } from './backgroundState';
import { setAccentHue } from './accentTheme';
import { getMostRecentBackground } from './backgroundCache';

const ANIMATION_DURATION = 1500; // 1.5 seconds as requested
const ENABLE_ONE_TIME_RGB_ANIMATION = true; // Set to true to enable one-time animations

/**
 * Cookie management for one-time RGB animation
 */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 365): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function hasSeenRGBAnimation(): boolean {
  if (!ENABLE_ONE_TIME_RGB_ANIMATION) return false;
  return getCookie('rgb_anim_seen') === 'true';
}

function markRGBAnimationSeen(): void {
  if (!ENABLE_ONE_TIME_RGB_ANIMATION) return;
  setCookie('rgb_anim_seen', 'true');
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}


/**
 * Get the target accent hue from user's most recent choice
 */
function getTargetAccentHue(): string {
  // Check most recent background first (returning user)
  const mostRecent = getMostRecentBackground();
  if (mostRecent && mostRecent.config.hue) {
    console.log('🎨 RGB Animation: Using most recent hue:', mostRecent.config.hue);
    return mostRecent.config.hue;
  }
  
  // Fall back to current state (first-time user or no recent background)
  const currentState = getState();
  console.log('🎨 RGB Animation: Using current state hue:', currentState.hue);
  return currentState.hue;
}

/**
 * Convert color name to approximate hue value
 */
function colorNameToHue(colorName: string): number {
  const colorMap: Record<string, number> = {
    'red': 0,
    'orange': 30,
    'yellow': 60,
    'green': 120,
    'cyan': 180,
    'blue': 240,
    'purple': 280,
    'pink': 320,
    'gray': 220, // Blueish gray
    'grey': 220
  };
  return colorMap[colorName] || 280; // Default to purple
}

/**
 * Create smooth RGB gradient animation that ends at user's accent color
 */
export function initAccentIntro(): void {
  console.log('🌈 RGB Animation: Initializing');
  
  // Check if animation already seen
  if (hasSeenRGBAnimation()) {
    console.log('⏭️ RGB Animation: Already seen, setting final color immediately');
    const targetHue = getTargetAccentHue();
    setAccentHue(targetHue);
    return;
  }
  
  console.log('🎨 RGB Animation: Starting smooth gradient animation');
  
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('🎨 RGB Animation: Prefers reduced motion, setting final color immediately');
    const targetHue = getTargetAccentHue();
    setAccentHue(targetHue);
    markRGBAnimationSeen();
    return;
  }
  
  const root = document.documentElement;
  const targetHue = getTargetAccentHue();
  const targetHueValue = colorNameToHue(targetHue);
  
  let startTime: number | null = null;
  let animationFrame: number;
  
  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
    
    // Easing function for smooth deceleration
    const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
    
    if (progress < 1) {
      // Smooth color cycling through spectrum to target
      const currentHue = (elapsed * 0.24) % 360; // Cycle through all hues over duration
      const finalHue = currentHue + (targetHueValue - currentHue) * easedProgress;
      
      // Ensure consistent saturation and lightness for vibrant colors
      const saturation = 85;
      const baseLightness = 55;
      
      // Generate consistent colors for all accent variables
      const lightColor = hslToHex(finalHue, Math.max(saturation - 15, 70), baseLightness + 20);
      const regularColor = hslToHex(finalHue, saturation, baseLightness);
      const darkColor = hslToHex(finalHue, Math.min(saturation + 10, 95), baseLightness - 20);
      
      // Update all accent color variables consistently
      root.style.setProperty('--accent-light-override', lightColor);
      root.style.setProperty('--accent-regular-override', regularColor);
      root.style.setProperty('--accent-dark-override', darkColor);
      
      // Update gradient stops for consistent gradient effects
      root.style.setProperty('--gradient-stop-1', lightColor);
      root.style.setProperty('--gradient-stop-2', regularColor);
      root.style.setProperty('--gradient-stop-3', darkColor);
      
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Animation complete - smoothly transition to actual accent theme colors
      console.log('🎨 RGB Animation: Complete, setting final accent:', targetHue);
      markRGBAnimationSeen(); // Mark as seen after first completion
      
      // Generate the exact colors that accentTheme.ts would use
      import('./accentTheme').then(({ updateAccentTheme }) => {
        // Call updateAccentTheme to set the final colors smoothly
        updateAccentTheme(targetHue);
        
        // Clean up our animation overrides after a brief delay
        setTimeout(() => {
          root.style.removeProperty('--accent-light-override');
          root.style.removeProperty('--accent-regular-override');
          root.style.removeProperty('--accent-dark-override');
          root.style.removeProperty('--gradient-stop-1');
          root.style.removeProperty('--gradient-stop-2');
          root.style.removeProperty('--gradient-stop-3');
        }, 100);
      }).catch(() => {
        // Fallback: just clear overrides and use setAccentHue
        root.style.removeProperty('--accent-light-override');
        root.style.removeProperty('--accent-regular-override');
        root.style.removeProperty('--accent-dark-override');
        root.style.removeProperty('--gradient-stop-1');
        root.style.removeProperty('--gradient-stop-2');
        root.style.removeProperty('--gradient-stop-3');
        setAccentHue(targetHue);
      });
    }
  };
  
  animationFrame = requestAnimationFrame(animate);
  
  // Cleanup function (though not strictly necessary for this use case)
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}

/**
 * Clear intro seen status (for development/testing)
 * Note: This animation always runs, so this function is mostly for compatibility
 */
export function clearIntroSeen(): void {
  console.log('� RGB Animation: Note - this animation always runs on page load');
}
