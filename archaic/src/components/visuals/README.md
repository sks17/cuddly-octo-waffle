# Project Visual Components

This directory contains custom visual components that can be embedded in homepage project cards.

## Adding a New Visual Component

1. **Create Component File**: Add a new `.astro` file in this directory
2. **Register Component**: Add it to the `visualComponents` mapping in `ProjectSection.astro`
3. **Update Registry**: Reference it by name in `src/data/projectRegistry.ts`

## Example Component Structure

```astro
---
// Component logic (TypeScript)
---

<div class="my-visual" id="my-visual">
  <!-- HTML structure -->
</div>

<script>
  // Interactive JavaScript/TypeScript
  function initMyVisual() {
    // Animation logic
  }
  
  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMyVisual);
  } else {
    initMyVisual();
  }
</script>

<style>
  .my-visual {
    /* Component styles */
  }
  
  /* Always include reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .my-visual {
      animation: none;
    }
  }
</style>
```

## Best Practices

- **Performance**: Keep animations lightweight and GPU-accelerated
- **Accessibility**: Always respect `prefers-reduced-motion`
- **Responsive**: Design for various card sizes
- **Cleanup**: Handle component unmounting if needed
- **Fallbacks**: Provide graceful degradation

## Current Components

- `PaperPigeonVisual.astro` - Animated chat bubbles demo
- `LinearAlgebraVisual.astro` - Matrix determinant calculator with visual animation