/**
 * Smooth RGB Gradient Animation
 * 
 * Creates a smooth rainbow gradient animation on every page load that cycles through
 * all colors before settling on the user's current accent color. Uses requestAnimationFrame
 * for smooth 60fps animation and always runs (no cookies).
 */

import { getState } from './backgroundState';
import { setAccentHue } from './accentTheme';
import { getMostRecentBackground } from './backgroundCache';

const ANIMATION_DURATION = 1500; // 1.5 seconds as requested
const COLOR_STOPS = 5; // Number of gradient stops
const GRADIENT_ANGLE = 45; // Gradient angle in degrees

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
  console.log('🎨 RGB Animation: Starting smooth gradient animation');
  
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('🎨 RGB Animation: Prefers reduced motion, setting final color immediately');
    const targetHue = getTargetAccentHue();
    setAccentHue(targetHue);
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
      // Create rainbow gradient that transitions to target color
      const gradientColors: string[] = [];
      
      for (let i = 0; i < COLOR_STOPS; i++) {
        // Start with rainbow colors cycling through spectrum
        const baseHue = (i * 360 / COLOR_STOPS + elapsed * 0.2) % 360;
        
        // Gradually transition each stop toward the target hue
        const currentHue = baseHue + (targetHueValue - baseHue) * easedProgress;
        
        // Adjust saturation and lightness for smooth transition
        const saturation = 80 - (easedProgress * 10); // Start vibrant, end slightly muted
        const lightness = 60 + (Math.sin(elapsed * 0.01 + i) * 10); // Subtle pulsing
        
        gradientColors.push(hslToHex(currentHue, saturation, lightness));
      }
      
      // Apply gradient to CSS custom properties for accent elements
      const gradientString = `linear-gradient(${GRADIENT_ANGLE}deg, ${gradientColors.join(', ')})`;
      
      // Use the first color as the main accent for single-color elements
      const mainColor = gradientColors[0];
      const lightColor = hslToHex(targetHueValue, 70, 75);
      const darkColor = hslToHex(targetHueValue, 90, 35);
      
      root.style.setProperty('--accent-regular-override', mainColor);
      root.style.setProperty('--accent-light-override', lightColor);
      root.style.setProperty('--accent-dark-override', darkColor);
      root.style.setProperty('--accent-gradient-override', gradientString);
      
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Animation complete - set final accent color
      console.log('🎨 RGB Animation: Complete, setting final accent:', targetHue);
      
      // Clear animation overrides
      root.style.removeProperty('--accent-regular-override');
      root.style.removeProperty('--accent-light-override');
      root.style.removeProperty('--accent-dark-override');
      root.style.removeProperty('--accent-gradient-override');
      
      // Set final accent theme
      setAccentHue(targetHue);
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
  console.log('🎨 RGB Animation: Note - this animation always runs on page load');
}
