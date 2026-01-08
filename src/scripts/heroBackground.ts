/**
 * Hero Background Animation
 * 
 * Displays a mathematical wallpaper background behind the hero section.
 * Background generation is managed by backgroundState.ts.
 * This module handles DOM manipulation and animation only.
 */

import { registerBackgroundElement, initializeBackground } from './backgroundState';

function createBackgroundElement(imageUrl: string, navHeight: number): HTMLDivElement {
  const bgDiv = document.createElement('div');
  bgDiv.className = 'hero-math-background';
  
  // Start the background below the navigation bar
  bgDiv.style.position = 'absolute';
  bgDiv.style.top = `${navHeight}px`;
  bgDiv.style.left = '0';
  bgDiv.style.width = '100vw';
  bgDiv.style.height = `calc(100vh - ${navHeight}px)`;
  bgDiv.style.backgroundImage = `url('${imageUrl}')`;
  bgDiv.style.backgroundSize = 'cover';
  bgDiv.style.backgroundPosition = 'top right';
  bgDiv.style.backgroundRepeat = 'no-repeat';
  bgDiv.style.zIndex = '0';
  bgDiv.style.pointerEvents = 'none';
  bgDiv.style.opacity = '0';
  bgDiv.style.boxShadow = 'inset 0 80px 60px -40px rgba(0, 0, 0, 0.6)';
  
  // Noise-to-clarity effect using CSS filter
  bgDiv.style.filter = 'contrast(0.8) brightness(1.1)';
  
  // Subtle micro-drift starting position
  bgDiv.style.transform = 'translate(-1%, -0.5%) scale(1.01)';
  
  // Smooth transitions for all animated properties
  bgDiv.style.transition = 'opacity 2.5s cubic-bezier(0.4, 0, 0.2, 1), filter 2.5s cubic-bezier(0.4, 0, 0.2, 1), transform 2.5s cubic-bezier(0.4, 0, 0.2, 1)';
  
console.log('🎨 Background element created with properties:');
    console.log('  z-index:', bgDiv.style.zIndex);
    console.log('  position:', bgDiv.style.position);
    console.log('  top:', bgDiv.style.top);
    console.log('  width:', bgDiv.style.width);
    console.log('  height:', bgDiv.style.height);
    console.log('  backgroundImage:', bgDiv.style.backgroundImage);
    console.log('  opacity:', bgDiv.style.opacity);
    console.log('  filter:', bgDiv.style.filter);
    console.log('  transform:', bgDiv.style.transform);
  
  return bgDiv;
}

function animateBackgroundIn(bgElement: HTMLDivElement, reducedMotion: boolean): void {
  console.log('🎬 animateBackgroundIn called (reducedMotion:', reducedMotion, ')');
  console.log('Initial opacity:', bgElement.style.opacity);
  console.log('Initial filter:', bgElement.style.filter);
  console.log('Initial transform:', bgElement.style.transform);
  
  // Respect prefers-reduced-motion
  if (reducedMotion) {
    bgElement.style.transition = 'none';
  }
  
  // Non-directional emergence: opacity + noise-to-clarity + micro-drift
  setTimeout(() => {
    console.log('⏰ Animation timeout fired (100ms elapsed)');
    
    // Full opacity (non-directional fade)
    bgElement.style.opacity = '1';
    
    // Noise → clarity: remove contrast/brightness adjustments
    bgElement.style.filter = 'contrast(1) brightness(1)';
    
    // Micro-drift settles to natural position
    bgElement.style.transform = 'translate(0, 0) scale(1)';
    
    console.log('Set opacity to:', bgElement.style.opacity);
    console.log('Set filter to:', bgElement.style.filter);
    console.log('Set transform to:', bgElement.style.transform);
    
    // Log computed styles after animation completes (2.7s for 2.5s transition + buffer)
    setTimeout(() => {
      const computed = window.getComputedStyle(bgElement);
      console.log('📊 COMPUTED STYLES (after animation complete):');
      console.log('  opacity:', computed.opacity);
      console.log('  filter:', computed.filter);
      console.log('  transform:', computed.transform);
      console.log('  display:', computed.display);
      console.log('  visibility:', computed.visibility);
      
      // Check if element is actually visible in viewport
      const rect = bgElement.getBoundingClientRect();
      console.log('📍 Element position in viewport:');
      console.log('  rect.top:', rect.top);
      console.log('  rect.width:', rect.width);
      console.log('  rect.height:', rect.height);
      console.log('  Is in viewport:', rect.top < window.innerHeight && rect.bottom > 0);
    }, 2700);
  }, 100);
}

export async function initHeroBackground(): Promise<void> {
  try {
    // Make body positioned so absolute child works correctly
    document.body.style.position = 'relative';
    
    const navElement = document.querySelector('nav');
    let navHeight = 0;
    
    // Get the navigation height to offset the background
    if (navElement) {
      const navRect = navElement.getBoundingClientRect();
      navHeight = navRect.height - 20; // Move background up by 20px
      
      // Ensure nav has solid background and is on top with heavy shadow
      (navElement as HTMLElement).style.position = 'relative';
      (navElement as HTMLElement).style.zIndex = '999';
      (navElement as HTMLElement).style.backgroundColor = 'var(--gray-999)';
      (navElement as HTMLElement).style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    }
    
    // Create background element with placeholder (will be replaced by generated image)
    const bgElement = createBackgroundElement('/assets/FirstBackground-map.png', navHeight);
    
    console.log('📏 Body dimensions BEFORE insert:');
    console.log('  body.offsetHeight:', document.body.offsetHeight);
    console.log('  body.clientHeight:', document.body.clientHeight);
    console.log('  body.scrollHeight:', document.body.scrollHeight);
    console.log('  window.innerHeight (viewport):', window.innerHeight);
    console.log('  body computed height:', window.getComputedStyle(document.body).height);
    
    // Insert as first child of body so it starts at the very top
    document.body.insertBefore(bgElement, document.body.firstChild);
    
    console.log('✅ Background element inserted into DOM');
    console.log('Element dimensions:', {
      offsetWidth: bgElement.offsetWidth,
      offsetHeight: bgElement.offsetHeight,
      clientWidth: bgElement.clientWidth,
      clientHeight: bgElement.clientHeight
    });
    
    // Ensure ALL content is above the background (z-index 2+)
    const wrapper = document.querySelector('.wrapper');
    const header = document.querySelector('header');
    const heroSection = document.getElementById('hero-section');
    const main = document.getElementById('main-content');
    const projectsContainer = document.querySelector('.projects-container');
    const workSection = document.getElementById('selected-work');
    const baseLayoutHeader = document.body.querySelector('header:first-of-type');
    
    if (baseLayoutHeader) {
      (baseLayoutHeader as HTMLElement).style.position = 'relative';
      (baseLayoutHeader as HTMLElement).style.zIndex = '999';
    }
    
    // CRITICAL FIX: .backgrounds wrapper has opaque background from BaseLayout
    // Must make it transparent to allow mathematical background (z-index 0) to show through
    const backgroundsWrapper = document.querySelector('.backgrounds');
    if (backgroundsWrapper) {
      (backgroundsWrapper as HTMLElement).style.backgroundColor = 'transparent';
      (backgroundsWrapper as HTMLElement).style.background = 'transparent';
      console.log('✅ Set .backgrounds wrapper to transparent');
    }
    
    // Set all content to higher z-index (background is 0)
    if (wrapper) {
      (wrapper as HTMLElement).style.position = 'relative';
      (wrapper as HTMLElement).style.zIndex = '10';
      console.log('Wrapper z-index set to:', (wrapper as HTMLElement).style.zIndex);
    }
    
    if (heroSection) {
      (heroSection as HTMLElement).style.position = 'relative';
      (heroSection as HTMLElement).style.zIndex = '10';
      console.log('Hero section z-index set to:', (heroSection as HTMLElement).style.zIndex);
    }
    
    if (header && header !== baseLayoutHeader) {
      (header as HTMLElement).style.position = 'relative';
      (header as HTMLElement).style.zIndex = '10';
    }
    
    if (main) {
      (main as HTMLElement).style.position = 'relative';
      (main as HTMLElement).style.zIndex = '10';
    }
    
    if (workSection) {
      (workSection as HTMLElement).style.position = 'relative';
      (workSection as HTMLElement).style.zIndex = '10';
    }
    
    if (projectsContainer) {
      (projectsContainer as HTMLElement).style.position = 'relative';
      (projectsContainer as HTMLElement).style.zIndex = '10';
    }

    // Register background element with state manager
    registerBackgroundElement(bgElement);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Animate in with editorial-quality emergence effect
    animateBackgroundIn(bgElement, prefersReducedMotion);

    // Generate initial background from state
    console.log('🎬 Starting initial background generation');
    await initializeBackground();
  } catch (error) {
    console.error('Failed to initialize hero background:', error);
  }
}
