/**
 * Hero Transition Animation
 * 
 * Transitions the hero section from center-aligned to left-aligned
 * after text animations complete. Simply removes the auto margin centering.
 * If animations are skipped, applies final state immediately.
 */

/**
 * Check if animations have been seen (cookie system)
 */
function hasSeenAnimations(): boolean {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; text_anim_seen_=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() === 'true';
  return false;
}

function applyThemeAwareStyles(element: HTMLElement, isDark: boolean): void {
  const bgColor = isDark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
  
  element.style.setProperty('background-color', bgColor, 'important');
  element.style.setProperty('border', `1px solid ${borderColor}`, 'important');
}

export function initHeroTransition(): void {
  const heroSection = document.getElementById('hero-section') as HTMLElement;
  if (!heroSection) return;

  const wrapper = heroSection.closest('.wrapper') as HTMLElement;
  const heroDiv = heroSection.querySelector('.hero') as HTMLElement;
  const title = heroSection.querySelector('.title') as HTMLElement;
  const tagline = heroSection.querySelector('.tagline') as HTMLElement;
  const roles = heroSection.querySelector('.roles') as HTMLElement;

  if (!wrapper || !heroDiv) return;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check if animations were already seen (repeat visit)
  const animationsSkipped = hasSeenAnimations();
  
  // Shorter breathing pause since we're using transforms
  // No delay if animations were skipped
  const breathingDelay = animationsSkipped ? 0 : (prefersReducedMotion ? 0 : 300);

  // Listen for theme changes and update backgrounds
  const updateThemeStyles = () => {
    const isDark = document.documentElement.classList.contains('theme-dark');
    if (title) applyThemeAwareStyles(title, isDark);
    if (tagline) applyThemeAwareStyles(tagline, isDark);
    if (roles) applyThemeAwareStyles(roles, isDark);
  };
  
  // Set up mutation observer to watch for theme class changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        updateThemeStyles();
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  // Ensure hero section has proper stacking context
  heroSection.style.position = 'relative';
  heroSection.style.zIndex = '10';

  // Apply smooth transition using transforms (no layout changes initially)
  setTimeout(() => {
    const isDark = document.documentElement.classList.contains('theme-dark');
    
    // STEP 1: Apply box styling and setup transforms while keeping center layout
    [title, tagline, roles].forEach(element => {
      if (element) {
        // Set up smooth transitions for all properties including transform
        // No transition if animations were skipped or reduced motion preferred
        const transition = (animationsSkipped || prefersReducedMotion) ? 'none' : 'all 2.5s cubic-bezier(0.23, 1, 0.32, 1)';
        element.style.transition = transition;
        element.style.willChange = 'transform, opacity, background-color, padding';
        
        // Apply box styling immediately
        element.style.setProperty('background-color', isDark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 0.95)', 'important');
        element.style.setProperty('backdrop-filter', 'blur(8px)', 'important');
        element.style.setProperty('padding', '1.5rem 2rem', 'important');
        element.style.setProperty('border-radius', '8px', 'important');
        element.style.setProperty('width', 'fit-content', 'important');
        element.style.setProperty('border', isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)', 'important');
        element.style.setProperty('position', 'relative', 'important');
        element.style.setProperty('z-index', '100', 'important');
      }
    });
    
    // STEP 2: After boxes appear, slide everything left using transform
    setTimeout(() => {
      // Use a much more conservative approach to ensure content stays visible
      const containerWidth = heroDiv.offsetWidth;
      const viewportWidth = window.innerWidth;
      
      // Move left by a small, safe amount - never more than 15% of container width
      // and never more than 20% of viewport width, whichever is smaller
      const maxMovePercent = Math.min(containerWidth * 0.15, viewportWidth * 0.2);
      
      // Ensure we never move more than 200px left (reasonable maximum)
      const translateX = -Math.min(maxMovePercent, 200);
      
      // Apply both the transform movement AND the alignment change simultaneously
      // so text transitions from center to left-aligned during the slide
      heroDiv.style.transform = `translateX(${translateX}px)`;
      heroDiv.style.transition = (animationsSkipped || prefersReducedMotion) ? 'none' : 'transform 2.5s cubic-bezier(0.23, 1, 0.32, 1)';
      
      // Change alignment class at the start of the slide so text alignment transitions during movement
      heroDiv.classList.remove('center');
      heroDiv.classList.add('start');
      
      // Don't remove the transform - keep boxes in their final left position
      // The transform keeps the boxes where they slid to, preventing them from sliding back
      
    }, animationsSkipped ? 0 : 200); // No delay if animations were skipped
    
  }, breathingDelay);
  
  // Ensure hero div has stacking context
  heroDiv.style.position = 'relative';
  heroDiv.style.zIndex = '11';
}
