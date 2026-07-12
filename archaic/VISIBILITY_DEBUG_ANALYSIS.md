# Background Visibility Debug Analysis

## Problem Statement
The background image element is created and inserted into the DOM but is NOT VISIBLE in the browser. Multiple z-index adjustments have failed to resolve this.

## What We KNOW (Verified Facts)
1. ✅ Image file exists: `public/assets/FirstBackground-map.png` (7200x4800, blue wallpaper)
2. ✅ Flask API running on port 5000 and generates images successfully
3. ✅ Element is created in heroBackground.ts with the following properties:
   - position: absolute
   - top: navHeight px (approximately 64-84px depending on nav height)
   - left: 0
   - width: 100vw
   - height: calc(100vh - navHeight px)
   - z-index: 0
   - opacity: 0 (initial), animates to 1 after 100ms
   - clipPath: circle(0% at 100% 0%) → circle(150% at 100% 0%)
   - backgroundImage: url('/assets/FirstBackground-map.png')
   - backgroundSize: cover
   - backgroundPosition: top right

4. ✅ Element is inserted as first child of body
5. ✅ Body style.position set to 'relative'
6. ✅ Console logs confirm element creation

## What We DON'T KNOW (Must Verify)
1. ❓ Does the element actually appear in browser DevTools DOM inspector?
2. ❓ What are the COMPUTED styles on the element (not just inline styles)?
3. ❓ Is the opacity animation actually running?
4. ❓ Is the clipPath animation actually running?
5. ❓ What is the actual body height in the browser?
6. ❓ Is body overflow clipping the element?
7. ❓ Does the background image URL actually resolve (check Network tab)?

## Critical Hypothesis: Body Height Issue

**The core issue may be that body doesn't have explicit height:**

```css
/* From global.css */
html, body {
  min-height: 100%;
  overflow-x: hidden;
}
```

**Problem**: `min-height: 100%` on body means:
- Body height is determined by its CONTENT, not the viewport
- If content is shorter than viewport, body will be shorter than 100vh
- An absolutely positioned child with `height: calc(100vh - navHeight px)` may extend BEYOND the body's actual height
- If parent (body) has `overflow-x: hidden` (which it does), the child may be clipped

**Why This Explains the Failure:**
1. Background element positioned absolute to body
2. Body height = content height (likely < 100vh on initial load)
3. Background height = calc(100vh - navHeight) (extends to viewport height)
4. Background extends beyond body boundary
5. Body has `overflow-x: hidden` which may create overflow clipping context
6. Element gets clipped/hidden even though it's in the DOM

## Secondary Hypothesis: Animation Not Triggering

The animation has a 100ms delay:
```typescript
setTimeout(() => {
  bgElement.style.opacity = '1';
  bgElement.style.clipPath = 'circle(150% at 100% 0%)';
}, 100);
```

**Potential Issues:**
- If `animateBackgroundIn()` is never called, element stays at opacity: 0
- Need to verify function execution path

## Testing Requirements

To identify actual root cause, we need to:

1. **Open browser DevTools and check:**
   - Elements tab: Does `.hero-math-background` element exist?
   - Computed styles: What are opacity, clip-path, display, visibility values?
   - Layout: What are the actual dimensions (offsetWidth, offsetHeight)?
   - Network tab: Does `/assets/FirstBackground-map.png` request succeed?

2. **Check body dimensions:**
   - What is body's actual height vs 100vh?
   - Is content shorter than viewport?

3. **Verify animation execution:**
   - Add console.log inside the setTimeout to confirm it runs
   - Check if opacity actually changes to '1'
   - Check if clipPath actually changes

## Proposed Fix (Hypothesis-Based)

If body height issue is confirmed:

**Option A: Fixed positioning instead of absolute**
```typescript
bgDiv.style.position = 'fixed'; // Not relative to body
bgDiv.style.top = `${navHeight}px`;
bgDiv.style.left = '0';
bgDiv.style.width = '100vw';
bgDiv.style.height = `calc(100vh - ${navHeight}px)`;
bgDiv.style.zIndex = '0';
```

**Option B: Force body to 100vh**
```typescript
document.body.style.minHeight = '100vh'; // Force full viewport height
document.body.style.position = 'relative';
```

**Option C: Remove overflow-x hidden from body**
If overflow-x creates clipping context, might need to handle it differently.

## Action Plan

1. DO NOT make changes yet
2. Add debug logging to verify animation execution
3. Test in browser and gather DevTools data
4. Identify actual root cause from real browser data
5. Apply targeted fix based on evidence
6. Verify fix actually works before claiming success

## False Assumptions from Previous Analysis

Previous analysis assumed:
- Z-index hierarchy would be sufficient ❌
- Element visibility was only a z-index problem ❌
- Background at z-index 0 with content at 10+ would work ❌

These assumptions were incorrect because they didn't account for:
- Body height and overflow behavior
- Absolute positioning relative to body boundaries
- Animation execution verification
- Actual computed styles in browser

## Next Step

Add debug logging and gather REAL data from browser DevTools before making any more code changes.
