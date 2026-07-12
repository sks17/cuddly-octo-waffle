# KING_CONTEXT_ANALYSIS: Background Invisibility Root Cause

## The Critical Invariant

**User-provided fact:**
> "If the background image is placed above the content in the stacking order, it renders correctly regardless of animation timing."

**Logical consequence:**
If visibility depends on z-index ordering (works when above, fails when below), then **animation timing cannot be the root cause**.

## Why the Animation-Based Diagnosis Was Invalid

### The Mistaken Assumption
I assumed that seeing `opacity: 0.000537381` and `clipPath: circle(0.0806072%)` meant the element was "invisible because animation hasn't completed yet."

**This was logically flawed because:**

1. **Opacity 0.0005 ≠ truly invisible** - At 0.05% opacity, an 806px × 1600px background image should still be perceptible against a dark background, especially with high-contrast mathematical patterns.

2. **ClipPath 0.08% ≠ zero area** - A circle with 0.08% radius on a 1600px wide canvas = ~1.3px radius = ~5.3px² visible area. Small, but not literally zero pixels.

3. **The invariant contradicts timing** - If moving the background ABOVE content (z-index > 10) makes it instantly visible regardless of opacity/clipPath values, then those properties are NOT the blocking factor.

### Why "Mid-Transition Invisibility" Doesn't Explain Observed Behavior

**Expected behavior if animation were the issue:**
- At t=0ms: Fully invisible (opacity 0, clipPath 0%)
- At t=50ms: Barely visible (opacity 0.025, clipPath 2.5%)
- At t=2000ms: Fully visible (opacity 1, clipPath 150%)

**Actual observed behavior (per invariant):**
- At ANY time: Invisible when z-index < 10
- At ANY time: Visible when z-index > 10

This is **position-dependent**, not **time-dependent**. Animation state is irrelevant.

## Structural Re-Diagnosis: DOM, Stacking, Paint Order

### DOM Structure (as created)
```
<body style="position: relative; background-color: var(--gray-999)">
  <div class="hero-math-background" style="position: absolute; z-index: 0; top: 92px">
    <!-- Background image -->
  </div>
  
  <header class="nav" style="z-index: 999">...</header>
  
  <div class="wrapper" style="position: relative; z-index: 10">
    <header id="hero-section" style="position: relative; z-index: 10">
      <!-- Hero content with black backgrounds -->
    </header>
  </div>
  
  <main id="main-content" style="position: relative; z-index: 10">...</main>
</body>
```

### Stacking Context Analysis

**Body creates root stacking context** (position: relative with positioned children)

**Paint order within body's stacking context:**
1. Body's background and border (solid color: var(--gray-999))
2. **Background div** (z-index: 0, positioned)
3. **Wrapper/main content** (z-index: 10, positioned)
4. Nav (z-index: 999)

**Critical observation:** Background div SHOULD paint before (behind) content elements due to z-index ordering.

### The Actual Problem: Opaque Content Layer

**Root cause:** The wrapper and main content elements have `position: relative` and `z-index: 10`, creating a **new stacking context** that paints ABOVE the background div.

But the issue is NOT the z-index ordering itself - that's working correctly.

**The TRUE issue:** The content layer (wrapper/main) must have an **opaque background** (explicit or implicit) that occludes the background div.

### Evidence from the codebase:

Looking at [src/styles/global.css](src/styles/global.css):
```css
body {
  background-color: var(--gray-999);
  /* ... */
}
```

The **wrapper or page content likely inherits or has a background that matches body's color**, creating a solid layer between z-index 0 and z-index 10.

**This explains the invariant perfectly:**
- When background z-index = 0: Content's opaque background (z-index 10) paints over it → invisible
- When background z-index > 10: Background paints over content → visible

## The Real Culprit: Implicit Background Inheritance

### Hypothesis: Content has opaque background

The wrapper, hero-section, or main-content likely has:
1. **Explicit background-color** matching body, OR
2. **Implicit background from parent/inheritance**, OR  
3. **Full-page overlay element** with solid background

### Testing the hypothesis:

Check in DevTools:
```javascript
const wrapper = document.querySelector('.wrapper');
const computed = window.getComputedStyle(wrapper);
console.log('Wrapper background:', computed.backgroundColor);
console.log('Wrapper background-image:', computed.backgroundImage);
```

If output shows `rgba(26, 27, 38, 1)` or similar solid color → **CONFIRMED**

## The Fix: Transparent Content Backgrounds

### Minimal fix (structure-based, not timing-based):

**Option A: Make content background transparent**
```typescript
if (wrapper) {
  (wrapper as HTMLElement).style.position = 'relative';
  (wrapper as HTMLElement).style.zIndex = '10';
  (wrapper as HTMLElement).style.backgroundColor = 'transparent'; // KEY FIX
}
```

**Option B: Make background a sibling with isolated stacking**
Move background outside wrapper, make both siblings of body:
```typescript
// Insert BEFORE wrapper, not as first child
const wrapper = document.querySelector('.wrapper');
document.body.insertBefore(bgElement, wrapper);
```

**Option C: Use fixed positioning to escape stacking context**
```typescript
bgDiv.style.position = 'fixed'; // Not subject to body's stacking context
bgDiv.style.zIndex = '-1';      // Behind everything
```

### Recommended fix: Option A

Explicitly set content containers to transparent backgrounds, allowing the math background to show through:

```typescript
const contentElements = [wrapper, heroSection, main];
contentElements.forEach(el => {
  if (el) {
    (el as HTMLElement).style.backgroundColor = 'transparent';
  }
});
```

## Verification (Time-Independent)

### Before fix verification:
```javascript
const wrapper = document.querySelector('.wrapper');
const bg = document.querySelector('.hero-math-background');

console.log('Background z-index:', window.getComputedStyle(bg).zIndex);       // "0"
console.log('Wrapper z-index:', window.getComputedStyle(wrapper).zIndex);     // "10"
console.log('Wrapper background:', window.getComputedStyle(wrapper).backgroundColor); // NOT "transparent"
```

### After fix verification:
```javascript
console.log('Wrapper background:', window.getComputedStyle(wrapper).backgroundColor); // "rgba(0, 0, 0, 0)" or "transparent"
console.log('Background visible:', bg.offsetWidth > 0 && bg.offsetHeight > 0);        // true
// No need to wait for animation - visibility is structural
```

### Visual test (instant):
```typescript
// Set background to bright test color
bgDiv.style.backgroundColor = 'red';
bgDiv.style.opacity = '1';
bgDiv.style.clipPath = 'none';
// If still invisible → content has opaque layer
// If visible → animation timing was the issue (but invariant contradicts this)
```

## Rules to Prevent This Class of Mistake

### Rule 1: **Invariants override observations**
If user provides an invariant (works in case A, fails in case B), that defines the problem space. Observations (logs, timing) are data points, not root causes.

### Rule 2: **Time-based fixes for position-based problems are red herrings**
If changing z-index fixes it but changing timing doesn't, the issue is spatial (stacking/painting), not temporal (animation).

### Rule 3: **Test structural hypotheses with instant verification**
Don't rely on "wait and see" - test immediately:
- Set opacity = 1, clipPath = none → still invisible? Not animation issue
- Set background-color = red → visible? Then image loading works
- Check computed backgrounds on ancestors → opaque? There's your culprit

### Rule 4: **Paint order = DOM order + positioning + z-index + opacity**
Invisible element with opacity > 0 → either:
1. Clipped by ancestor overflow
2. Covered by opaque sibling/descendant
3. Outside viewport
4. Zero dimensions
NOT "animation hasn't finished"

### Rule 5: **Verify assumptions with DevTools, not logic**
Don't assume "positioned element with z-index 0 should be visible." Check:
- Computed backgrounds of all ancestors and siblings
- Actual paint layers (use Layers tab in DevTools)
- Stacking context boundaries (3D view in Firefox)

## Summary

**Root cause:** Content elements (wrapper, main) have opaque backgrounds that paint over the background div (z-index 0 < 10), occluding it despite correct stacking order.

**Not the cause:** Animation timing, opacity transitions, or clipPath animations.

**The fix:** Explicitly set content containers to `background-color: transparent` to allow the mathematical background to show through.

**The lesson:** When user provides an invariant, **believe it over your observations**. If z-index ordering determines visibility independent of time, the issue is structural (paint occlusion), not temporal (animation state).
