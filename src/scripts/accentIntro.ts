/**
 * Accent Color Intro Animation
 * 
 * Plays a one-time color spectrum animation on page load where accent elements
 * smoothly cycle through colors before settling on the current theme accent.
 * Creates an atmospheric "system initialization" effect.
 */

import { getState } from './backgroundState';
import { setAccentHue } from './accentTheme';

const COOKIE_NAME = 'accent-intro-seen';
const COOKIE_DAYS = 1; // Show intro again after a day for development  
const ANIMATION_DURATION = 6000; // ms - matches CSS animation (slowed down for visibility)

/**
 * Check if user has seen the intro animation recently
 */
function hasSeenIntro(): boolean {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name] = cookie.trim().split('=');
    if (name === COOKIE_NAME) {
      return true;
    }
  }
  return false;
}

/**
 * Mark intro as seen
 */
function markIntroSeen(): void {
  const expires = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString();
  document.cookie = `${COOKIE_NAME}=1; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Clear intro cookie for testing purposes
 */
export function clearIntroSeen(): void {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  console.log('🎨 Accent intro: Cookie cleared for testing');
}

/**
 * Apply intro animation to accent elements
 */
export function initAccentIntro(): void {
  console.log('🎨 Accent intro: Function called', {
    hasSeenIntro: hasSeenIntro(),
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    documentReady: document.readyState,
    htmlClassList: document.documentElement.classList.toString()
  });

  // Skip if already seen recently
  if (hasSeenIntro()) {
    console.log('🎨 Accent intro: Already seen, skipping');
    // Still need to set final accent theme since initializeAccentTheme was disabled
    const currentState = getState();
    setAccentHue(currentState.hue);
    return;
  }

  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('🎨 Accent intro: Prefers reduced motion, skipping');
    markIntroSeen();
    // Set final accent theme immediately since no animation
    const currentState = getState();
    setAccentHue(currentState.hue);
    return;
  }

  console.log('🎨 Accent intro: Starting color spectrum animation');

  // Clear any existing accent override styles to ensure animation plays
  const root = document.documentElement;
  root.style.removeProperty('--accent-light-override');
  root.style.removeProperty('--accent-regular-override'); 
  root.style.removeProperty('--accent-dark-override');

  // Apply animation to the document root to animate CSS custom properties
  document.documentElement.classList.add('accent-intro-animate');
  
  // Debug: Verify class was added
  console.log('🎨 Accent intro: Class added, current classes:', document.documentElement.classList.toString());

  // Remove animation class and mark as seen after completion
  setTimeout(() => {
    document.documentElement.classList.remove('accent-intro-animate');
    markIntroSeen();
    
    // Set the final accent theme after animation completes
    const currentState = getState();
    console.log('🎨 Accent intro: Setting final accent hue:', currentState.hue);
    setAccentHue(currentState.hue);
    
    console.log('🎨 Accent intro: Animation complete, class removed');
  }, ANIMATION_DURATION);
}
