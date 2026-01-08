/**
 * Hero Transition Animation
 * 
 * Transitions the hero section from center-aligned to left-aligned
 * after text animations complete. Simply removes the auto margin centering.
 */

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
  
  // Add breathing pause before transition (respect reduced motion)
  const breathingDelay = prefersReducedMotion ? 0 : 250; // Brief pause for visual stability
  
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
  
  // Apply breathing transition after pause
  setTimeout(() => {
    // Remove auto centering from wrapper with smooth breathing transition
    const transition = prefersReducedMotion ? 'none' : 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), margin 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
    wrapper.style.transition = transition;
    wrapper.style.transform = 'translateX(0)';
    wrapper.style.willChange = prefersReducedMotion ? 'auto' : 'transform';
    wrapper.style.marginInline = '0';
    wrapper.style.position = 'relative';
    wrapper.style.zIndex = '10';
    
    // Apply subtle breathing effect to text elements
    [title, tagline, roles].forEach(element => {
      if (element && !prefersReducedMotion) {
        element.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
        element.style.transform = 'translateX(0)';
      }
    });
  }, breathingDelay);
  
  // Ensure hero div has stacking context
  heroDiv.style.position = 'relative';
  heroDiv.style.zIndex = '11';
  
  console.log('Hero transition - wrapper z-index:', wrapper.style.zIndex);
  console.log('Hero transition - heroDiv z-index:', heroDiv.style.zIndex);
  
  // Change hero div from center to start alignment
  heroDiv.classList.remove('center');
  heroDiv.classList.add('start');

  // Style title with semi-transparent background for better readability
  if (title) {
    console.log('Styling title element');
    const isDark = document.documentElement.classList.contains('theme-dark');
    const titleTransition = prefersReducedMotion ? 'none' : 'opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
    title.style.setProperty('transition', titleTransition, 'important');
    title.style.setProperty('will-change', 'transform, opacity', 'important');
    title.style.setProperty('background-color', isDark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 0.95)', 'important');
    title.style.setProperty('backdrop-filter', 'blur(8px)', 'important');
    title.style.setProperty('padding', '1.5rem 2rem', 'important');
    title.style.setProperty('border-radius', '8px', 'important');
    title.style.setProperty('position', 'relative', 'important');
    title.style.setProperty('z-index', '100', 'important');
    title.style.setProperty('width', 'fit-content', 'important');
    title.style.setProperty('border', isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)', 'important');
  }

  // Style tagline with semi-transparent background for better readability
  if (tagline) {
    console.log('Styling tagline element');
    const isDark = document.documentElement.classList.contains('theme-dark');
    const taglineTransition = prefersReducedMotion ? 'none' : 'opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
    tagline.style.setProperty('transition', taglineTransition, 'important');
    tagline.style.setProperty('will-change', 'transform, opacity', 'important');
    tagline.style.setProperty('background-color', isDark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 0.95)', 'important');
    tagline.style.setProperty('backdrop-filter', 'blur(8px)', 'important');
    tagline.style.setProperty('padding', '1.5rem 2rem', 'important');
    tagline.style.setProperty('border-radius', '8px', 'important');
    tagline.style.setProperty('position', 'relative', 'important');
    tagline.style.setProperty('z-index', '100', 'important');
    tagline.style.setProperty('width', 'fit-content', 'important');
    tagline.style.setProperty('border', isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)', 'important');
  }

  // Style roles with semi-transparent background for better readability
  if (roles) {
    console.log('Styling roles element');
    const isDark = document.documentElement.classList.contains('theme-dark');
    const rolesTransition = prefersReducedMotion ? 'none' : 'opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
    roles.style.setProperty('transition', rolesTransition, 'important');
    roles.style.setProperty('will-change', 'transform, opacity', 'important');
    roles.style.setProperty('background-color', isDark ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 0.95)', 'important');
    roles.style.setProperty('backdrop-filter', 'blur(8px)', 'important');
    roles.style.setProperty('padding', '1.5rem 2rem', 'important');
    roles.style.setProperty('border-radius', '8px', 'important');
    roles.style.setProperty('position', 'relative', 'important');
    roles.style.setProperty('z-index', '100', 'important');
    roles.style.setProperty('width', 'fit-content', 'important');
    roles.style.setProperty('border', isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)', 'important');
  }
}
