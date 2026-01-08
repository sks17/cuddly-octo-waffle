/**
 * Unified Text Appearance / Typewriter Animation
 * 
 * Consolidated animation system that handles:
 * - Character-by-character typewriter effects (data-type-speed)
 * - Fade-in animations (data-fade-in-delay)
 * - One-time-per-page behavior via cookies
 * - Ensures text is hidden until animation starts
 */

const ENABLE_ONE_TIME_TEXT_ANIMATIONS = false; // Set to true to enable one-time animations
const DEBUG_MODE = false; // Set to true for debug logging

// Callback functions to run after all animations complete
const animationCompleteCallbacks: Array<() => void> = [];

interface TypewriterConfig {
  speed?: number;
  delay?: number;
  jitter?: number;
}

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

function getPageCookieName(): string {
  const path = window.location.pathname.replace(/\//g, '_') || 'home';
  return `text_anim_seen_${path}`;
}

function hasSeenAnimation(): boolean {
  if (!ENABLE_ONE_TIME_TEXT_ANIMATIONS) return false;
  return getCookie(getPageCookieName()) === 'true';
}

function markAnimationSeen(): void {
  if (!ENABLE_ONE_TIME_TEXT_ANIMATIONS) return;
  setCookie(getPageCookieName(), 'true');
}

async function typewriteElement(element: HTMLElement, config: TypewriterConfig): Promise<void> {
  const text = element.textContent || '';
  
  // Clear text content immediately (before making visible)
  element.textContent = '';
  
  // Make element visible with !important to override CSS
  element.style.setProperty('opacity', '1', 'important');
  
  // If element is inside a button, show the button too
  const button = element.closest('button');
  if (button) {
    button.style.setProperty('opacity', '1', 'important');
  }

  const speed = config.speed || 50;
  const jitter = config.jitter || 0;

  for (let i = 0; i < text.length; i++) {
    element.textContent += text[i];
    const variance = jitter > 0 ? (Math.random() * jitter * 2 - jitter) : 0;
    await new Promise(resolve => setTimeout(resolve, speed + variance));
  }
  
  // Debug mode: turn text purple after completion
  if (DEBUG_MODE) {
    element.style.color = 'purple';
  }
}

export function initTextAppearance(): void {
  if (DEBUG_MODE) console.log('🎬 Initializing text appearance animations');

  // CRITICAL: Force hide all animated elements immediately to prevent flash
  const allAnimatedElements = document.querySelectorAll<HTMLElement>('[data-type-speed], [data-fade-in-delay]');
  allAnimatedElements.forEach(el => {
    el.style.setProperty('opacity', '0', 'important');
    el.style.setProperty('visibility', 'visible', 'important'); // Visible but transparent
    
    // Hide parent buttons too
    const button = el.closest('button');
    if (button && button.hasAttribute) {
      (button as HTMLElement).style.setProperty('opacity', '0', 'important');
    }
  });

  // Check if animation already seen
  if (hasSeenAnimation()) {
    if (DEBUG_MODE) console.log('⏭️ Animations already seen, showing immediately');
    // Show all text immediately
    allAnimatedElements.forEach(el => {
      el.style.setProperty('opacity', '1', 'important');
      // If element is inside a button, show the button too
      const button = el.closest('button');
      if (button) {
        (button as HTMLElement).style.setProperty('opacity', '1', 'important');
      }
    });
    return;
  }

  // Find all elements with typewriter attributes
  const elements = document.querySelectorAll<HTMLElement>('[data-type-speed]');
  
  // Find all elements with fade-in attributes
  const fadeElements = document.querySelectorAll<HTMLElement>('[data-fade-in-delay]');
  
  if (elements.length === 0 && fadeElements.length === 0) {
    if (DEBUG_MODE) console.log('❌ No animated elements found');
    return;
  }

  if (DEBUG_MODE) console.log(`🎯 Found ${elements.length} typewriter elements and ${fadeElements.length} fade elements`);

  // Sort by delay to ensure proper sequencing
  const sorted = Array.from(elements).sort((a, b) => {
    const delayA = parseInt(a.getAttribute('data-type-delay') || '0');
    const delayB = parseInt(b.getAttribute('data-type-delay') || '0');
    return delayA - delayB;
  });

  // Start animation sequence
  const promises: Promise<void>[] = [];

  sorted.forEach((element) => {
    const speed = parseInt(element.getAttribute('data-type-speed') || '50');
    const delay = parseInt(element.getAttribute('data-type-delay') || '0');
    const jitter = parseInt(element.getAttribute('data-type-jitter') || '0');
    const text = element.textContent || '';
    const estimatedDuration = text.length * speed;

    const promise = new Promise<void>((resolve) => {
      setTimeout(async () => {
        await typewriteElement(element, { speed, delay, jitter });
        resolve();
      }, delay);
    });

    promises.push(promise);
  });

  // Handle fade-in elements (for elements with HTML children like Pills)
  fadeElements.forEach((element) => {
    const delay = parseInt(element.getAttribute('data-fade-in-delay') || '0');
    
    const promise = new Promise<void>((resolve) => {
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease-in';
        element.style.setProperty('opacity', '1', 'important');
        
        setTimeout(resolve, 600); // Wait for fade transition
      }, delay);
    });

    promises.push(promise);
  });

  // Wait for all animations to complete, then trigger callbacks
  Promise.all(promises).then(() => {
    markAnimationSeen();
    
    // Trigger all registered callbacks for post-animation actions
    animationCompleteCallbacks.forEach(callback => callback());
    
    // Dispatch custom event for scalable animation chaining
    window.dispatchEvent(new CustomEvent('textAnimationComplete'));
  });
}

/**
 * Register a callback to run after all text animations complete
 * This enables scalable addition of post-animation effects
 */
export function onTextAnimationComplete(callback: () => void): void {
  animationCompleteCallbacks.push(callback);
}
