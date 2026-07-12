/**
 * Selected Work Section Overlay
 * 
 * Controls the black overlay that covers the "Selected Work" section.
 * Fades based on scroll visibility, never returns once fully transparent.
 */

const REVEAL_THRESHOLD = 0.4;
const FADE_WINDOW = 0.25;

let overlayFullyFaded = false;

function updateOverlayOpacity(section: HTMLElement): void {
  if (overlayFullyFaded) {
    section.style.setProperty('--reveal-overlay-opacity', '0');
    return;
  }

  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  // Calculate visible portion of section in viewport
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, viewportHeight);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  const visibilityProgress = visibleHeight / viewportHeight;

  // Overlay stays opaque until threshold reached
  if (visibilityProgress < REVEAL_THRESHOLD) {
    section.style.setProperty('--reveal-overlay-opacity', '1');
    return;
  }

  // Fade during transition window
  const fadeProgress = (visibilityProgress - REVEAL_THRESHOLD) / FADE_WINDOW;
  const clampedProgress = Math.min(1, Math.max(0, fadeProgress));
  const opacity = 1 - clampedProgress;

  section.style.setProperty('--reveal-overlay-opacity', opacity.toString());

  // Mark as fully faded once opacity reaches 0
  if (opacity <= 0) {
    overlayFullyFaded = true;
  }
}

export function initSelectedWorkOverlay(): void {
  const section = document.querySelector<HTMLElement>('.scroll-reveal-section');
  
  if (!section) return;

  const handleScroll = () => updateOverlayOpacity(section);

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Initial check
  handleScroll();
}
