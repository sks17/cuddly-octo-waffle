/**
 * Project Focus / Snap / Parallax Logic
 * 
 * State machine for discrete project navigation:
 * - IDLE: Free scrolling outside section
 * - ENTERING: One-time entry snap (debounced)
 * - LOCKED: Discrete card-by-card navigation
 * - TRANSITIONING: Animating between cards
 */

// Configuration
const WHEEL_THRESHOLD = 100; // Accumulated deltaY needed to advance
const TRANSITION_COOLDOWN = 600; // ms - prevent multiple transitions from one gesture
const ENTRY_DEBOUNCE = 150; // ms - debounce entry detection
const BUFFER_ZONE = 0.35; // 35% of viewport height for entry detection

// State machine
enum ScrollState {
  IDLE = 'IDLE',
  ENTERING = 'ENTERING',
  LOCKED = 'LOCKED',
  TRANSITIONING = 'TRANSITIONING'
}

let currentState: ScrollState = ScrollState.IDLE;
let currentFocusIndex = 0;
let accumulatedDelta = 0;
let lastTransitionTime = 0;
let entryTimeout: number | null = null;
let prefersReducedMotion = false;
let parallaxAnimationId: number | null = null;
let scrollAnimationId: number | null = null;
let isScrolling = false;
let lastScrollY = 0;
let scrollStableCount = 0;

function updateFocusState(): void {
  const projectSections = document.querySelectorAll<HTMLElement>('.project-section');
  const workSection = document.getElementById('selected-work');
  
  projectSections.forEach((section, index) => {
    if (index === currentFocusIndex) {
      section.classList.add('active');
      section.setAttribute('data-focus', 'true');
    } else {
      section.classList.remove('active');
      section.removeAttribute('data-focus');
    }
  });
  
  // Apply spotlight effect when in LOCKED or TRANSITIONING state
  if (workSection) {
    if (currentState === ScrollState.LOCKED || currentState === ScrollState.TRANSITIONING) {
      workSection.classList.add('spotlight-active');
    } else {
      workSection.classList.remove('spotlight-active');
    }
  }
}

function applyParallax(): void {
  // Cancel any pending parallax update
  if (parallaxAnimationId) {
    cancelAnimationFrame(parallaxAnimationId);
  }
  
  parallaxAnimationId = requestAnimationFrame(() => {
    const projectSections = document.querySelectorAll<HTMLElement>('.project-section');
    const viewportHeight = window.innerHeight;
    
    projectSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      
      // Only apply parallax to visible sections
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        const parallaxBg = section.querySelector<HTMLElement>('.parallax-bg');
        const parallaxContent = section.querySelector<HTMLElement>('.parallax-content');
        
        if (parallaxBg) {
          const bgOffset = (scrollProgress - 0.5) * 80;
          parallaxBg.style.willChange = 'transform';
          parallaxBg.style.transform = `translate3d(0, ${bgOffset}px, 0) scale(1.15)`;
        }
        
        if (parallaxContent) {
          const contentOffset = (scrollProgress - 0.5) * -40;
          parallaxContent.style.willChange = 'transform';
          parallaxContent.style.transform = `translate3d(0, ${contentOffset}px, 0)`;
        }
      } else {
        // Clean up GPU hints for non-visible sections
        const parallaxBg = section.querySelector<HTMLElement>('.parallax-bg');
        const parallaxContent = section.querySelector<HTMLElement>('.parallax-content');
        
        if (parallaxBg) parallaxBg.style.willChange = 'auto';
        if (parallaxContent) parallaxContent.style.willChange = 'auto';
      }
    });
    
    parallaxAnimationId = null;
  });
}

function transitionToCard(targetIndex: number, instant: boolean = false): void {
  const projectSections = document.querySelectorAll<HTMLElement>('.project-section');
  
  if (targetIndex < 0 || targetIndex >= projectSections.length) return;
  if (targetIndex === currentFocusIndex && currentState !== ScrollState.ENTERING) return;
  
  // Update state
  currentState = ScrollState.TRANSITIONING;
  currentFocusIndex = targetIndex;
  lastTransitionTime = Date.now();
  
  // Scroll to target
  const behavior = (instant || prefersReducedMotion) ? 'instant' : 'smooth';
  projectSections[targetIndex].scrollIntoView({ 
    behavior: behavior as ScrollBehavior,
    block: 'center'
  });
  
  updateFocusState();
  
  // Return to LOCKED state after transition
  setTimeout(() => {
    if (currentState === ScrollState.TRANSITIONING) {
      currentState = ScrollState.LOCKED;
      accumulatedDelta = 0; // Reset accumulator
      updateFocusState();
    }
  }, instant ? 100 : TRANSITION_COOLDOWN);
}

function isInProjectsArea(): boolean {
  const container = document.querySelector('.projects-container');
  if (!container) return false;
  
  const rect = container.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportCenter = viewportHeight / 2;
  
  // CRITICAL: Only activate when section is ergonomically centered
  // Require at least one project to be positioned at or very near viewport center
  
  const projectSections = container.querySelectorAll<HTMLElement>('.project-section');
  const targetPosition = viewportCenter - (viewportHeight * 0.05); // Very close to center
  
  // HYSTERESIS: Use wider tolerance when already locked to prevent twitching
  const isAlreadyLocked = (currentState === ScrollState.LOCKED || currentState === ScrollState.TRANSITIONING);
  
  for (let i = 0; i < projectSections.length; i++) {
    const section = projectSections[i];
    const sectionRect = section.getBoundingClientRect();
    const sectionCenter = sectionRect.top + sectionRect.height / 2;
    
    // Determine if this is first or last project (needs stricter requirements)
    const isFirstProject = i === 0;
    const isLastProject = i === projectSections.length - 1;
    
    // For first/last projects, require stricter centering (10% instead of 15%)
    // When already locked, use 20% wider tolerance to prevent twitching
    let maxDistance = (isFirstProject || isLastProject) 
      ? viewportHeight * 0.10 
      : viewportHeight * 0.15;
    
    if (isAlreadyLocked) {
      maxDistance *= 1.5; // 50% wider tolerance when locked
    }
    
    // Project center must be very close to target position
    const distanceFromTarget = Math.abs(sectionCenter - targetPosition);
    
    if (distanceFromTarget <= maxDistance) {
      // Additional verification: ensure the project is actually substantially visible
      const visibleTop = Math.max(sectionRect.top, 0);
      const visibleBottom = Math.min(sectionRect.bottom, viewportHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const projectVisibilityRatio = visibleHeight / sectionRect.height;
      
      // First/last projects need higher visibility (90% vs 80%)
      // When already locked, reduce visibility requirement to prevent exit
      let requiredVisibility = (isFirstProject || isLastProject) ? 0.90 : 0.80;
      if (isAlreadyLocked) {
        requiredVisibility *= 0.85; // Reduce by 15% when locked
      }
      
      if (projectVisibilityRatio >= requiredVisibility) {
        return true;
      }
    }
  }
  
  return false;
}

function findClosestProjectIndex(): number {
  const projectSections = document.querySelectorAll<HTMLElement>('.project-section');
  const viewportCenter = window.innerHeight / 2;
  let closestIndex = 0;
  let closestDistance = Infinity;
  
  projectSections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const distance = Math.abs(sectionCenter - viewportCenter);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  
  return closestIndex;
}

function handleStateTransitions(): void {
  const inProjectsArea = isInProjectsArea();
  
  // State: IDLE → ENTERING
  if (currentState === ScrollState.IDLE && inProjectsArea) {
    currentState = ScrollState.ENTERING;
    
    // Debounce entry to prevent multiple snaps
    if (entryTimeout) clearTimeout(entryTimeout);
    entryTimeout = window.setTimeout(() => {
      if (currentState === ScrollState.ENTERING) {
        const targetIndex = findClosestProjectIndex();
        currentFocusIndex = targetIndex;
        transitionToCard(targetIndex, false);
        
        // Transition to LOCKED after entry snap
        setTimeout(() => {
          if (currentState === ScrollState.TRANSITIONING) {
            currentState = ScrollState.LOCKED;
            updateFocusState();
          }
        }, TRANSITION_COOLDOWN);
      }
    }, ENTRY_DEBOUNCE);
    
    return;
  }
  
  // State: LOCKED/TRANSITIONING → IDLE
  if ((currentState === ScrollState.LOCKED || currentState === ScrollState.TRANSITIONING) && !inProjectsArea) {
    currentState = ScrollState.IDLE;
    accumulatedDelta = 0;
    updateFocusState();
    return;
  }
  
  // State: ENTERING → IDLE (user scrolled away before entry snap completed)
  if (currentState === ScrollState.ENTERING && !inProjectsArea) {
    if (entryTimeout) {
      clearTimeout(entryTimeout);
      entryTimeout = null;
    }
    currentState = ScrollState.IDLE;
    accumulatedDelta = 0;
    updateFocusState();
    return;
  }
}

function handleWheel(event: WheelEvent): void {
  // First check: is the cursor actually over the projects container?
  const container = document.querySelector('.projects-container');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  
  // Only process wheel events if cursor is within the projects container bounds
  const isMouseOverContainer = (
    mouseX >= containerRect.left &&
    mouseX <= containerRect.right &&
    mouseY >= containerRect.top &&
    mouseY <= containerRect.bottom
  );
  
  if (!isMouseOverContainer) {
    return; // Allow native scroll when mouse is not over projects
  }
  
  // Second check: is the section positioned optimally for project navigation?
  // Even if cursor is over projects, allow normal scroll if section not centered
  if (!isInProjectsArea()) {
    return; // Allow native scroll when section is not optimally positioned
  }
  
  handleStateTransitions();
  
  // Free scrolling in IDLE or ENTERING states
  if (currentState === ScrollState.IDLE || currentState === ScrollState.ENTERING) {
    return; // Allow native scroll
  }
  
  // Block native scroll in LOCKED and TRANSITIONING states
  event.preventDefault();
  
  // Don't process input during transitions or cooldown
  if (currentState === ScrollState.TRANSITIONING) {
    return;
  }
  
  const timeSinceLastTransition = Date.now() - lastTransitionTime;
  if (timeSinceLastTransition < TRANSITION_COOLDOWN) {
    return; // Still in cooldown
  }
  
  // Accumulate wheel delta (momentum handling)
  const deltaY = event.deltaY;
  accumulatedDelta += deltaY;
  
  // Check if threshold exceeded
  if (Math.abs(accumulatedDelta) >= WHEEL_THRESHOLD) {
    const direction = accumulatedDelta > 0 ? 1 : -1;
    const targetIndex = currentFocusIndex + direction;
    const projectSections = document.querySelectorAll<HTMLElement>('.project-section');
    
    // Transition to next/prev card
    if (targetIndex >= 0 && targetIndex < projectSections.length) {
      accumulatedDelta = 0; // Reset before transition
      transitionToCard(targetIndex);
    } else {
      // At boundary - exit to free scroll
      currentState = ScrollState.IDLE;
      accumulatedDelta = 0;
      updateFocusState();
    }
  }
}

function handleKeyDown(event: KeyboardEvent): void {
  if (currentState !== ScrollState.LOCKED && currentState !== ScrollState.TRANSITIONING) {
    return; // Only handle keys when in section
  }
  
  const projectSections = document.querySelectorAll<HTMLElement>('.project-section');
  let targetIndex = currentFocusIndex;
  
  switch (event.key) {
    case 'ArrowDown':
    case 'PageDown':
      targetIndex = currentFocusIndex + 1;
      break;
    case 'ArrowUp':
    case 'PageUp':
      targetIndex = currentFocusIndex - 1;
      break;
    default:
      return; // Not a navigation key
  }
  
  // Prevent default page scroll
  event.preventDefault();
  
  // Transition if valid target
  if (targetIndex >= 0 && targetIndex < projectSections.length) {
    transitionToCard(targetIndex);
  } else {
    // Exit section
    currentState = ScrollState.IDLE;
    updateFocusState();
  }
}

export function initProjectFocus(): void {
  // Check for reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = mediaQuery.matches;
  mediaQuery.addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
  });
  
  // Check if project sections exist
  const projectSections = document.querySelectorAll<HTMLElement>('.project-section');
  
  // Wheel event with conditional preventDefault
  window.addEventListener('wheel', handleWheel, { passive: false });
  
  // Keyboard navigation
  window.addEventListener('keydown', handleKeyDown, { passive: false });
  
  // Throttled scroll handling for better performance
  window.addEventListener('scroll', () => {
    if (scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
    }
    
    scrollAnimationId = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      
      // Detect if scroll position is stable (no movement)
      if (Math.abs(currentScrollY - lastScrollY) < 0.5) {
        scrollStableCount++;
      } else {
        scrollStableCount = 0;
      }
      lastScrollY = currentScrollY;
      
      // Only check state transitions if:
      // 1. Not in LOCKED state, OR
      // 2. Scroll is actively changing (not stable for 3+ frames)
      const shouldCheckTransitions = (
        currentState !== ScrollState.LOCKED || 
        scrollStableCount < 3
      );
      
      if (shouldCheckTransitions) {
        handleStateTransitions();
      }
      
      applyParallax();
      scrollAnimationId = null;
    });
  }, { passive: true });
  
  // Initialize state
  currentState = ScrollState.IDLE;
  currentFocusIndex = 0;
  applyParallax();
  
  // Set initial focus state for first card
  updateFocusState();
}
