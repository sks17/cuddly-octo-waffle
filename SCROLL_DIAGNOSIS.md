# Scroll Flicker Diagnosis

## Root Causes Identified

### 1. **Competing Scroll Mechanisms (Primary Issue)**
The system has THREE different scroll mechanisms fighting each other:

- **CSS `scroll-snap-type: y mandatory`** on `.projects-container` - Browser native snapping
- **JavaScript `scrollIntoView()`** in `projectFocus.ts` - Programmatic scrolling
- **Wheel event `preventDefault()`** - Blocking native scroll during transitions

**Result:** When entering the section, the CSS snap tries to engage while JavaScript tries to take control, causing jumps and fighting.

### 2. **Entry Detection Race Condition**
```typescript
if (!wasInProjectsArea && inProjectsArea) {
    transitionToCard(targetIndex, true); // Triggers scrollIntoView
}
```

This fires on EVERY wheel event where `isInProjectsArea()` becomes true. With momentum scrolling (trackpad), this can trigger multiple times in rapid succession before `wasInProjectsArea` updates, causing:
- Double snap (snap to card 0, then immediately snap to card 1)
- Fighting between CSS snap and JS scroll
- Visual judder as both mechanisms compete

### 3. **Threshold Detection Instability**
```typescript
const bufferZone = viewportHeight * 0.4; // 40% buffer
if (distanceFromCenter < bufferZone) {
    return true; // In projects area
}
```

As user scrolls into section, this bounces true/false/true rapidly as sections move through the buffer zone, triggering multiple entry snaps.

### 4. **Scroll Lock Without Actual Lock**
```typescript
scrollLockActive = true;
// ... but no preventDefault() here, so native scroll still happens
setTimeout(() => {
    scrollLockActive = false; // Released too early
}, SCROLL_LOCK_DURATION); // Only 50ms!
```

The "lock" doesn't actually prevent scrolling - it just sets a flag. Native scroll continues, causing drift.

### 5. **Instant Re-Snap on Lock Activation**
```typescript
if (!scrollLockActive) {
    scrollLockActive = true;
    projectSections[currentFocusIndex].scrollIntoView({ 
        behavior: 'instant', // JARRING JUMP
        block: 'center'
    });
}
```

This causes visible jumps whenever the lock activates.

### 6. **CSS Snap Conflicts**
CSS declares:
```css
scroll-snap-type: y mandatory;
scroll-snap-align: center;
scroll-snap-stop: always;
```

But JavaScript also controls scrolling, creating dual authority with no clear winner.

## Why Flicker Happens Specifically on Entry

1. User scrolls down from hero section
2. Projects container enters viewport
3. `isInProjectsArea()` returns true for first time
4. Entry condition triggers: `!wasInProjectsArea && inProjectsArea`
5. JavaScript calls `scrollIntoView()` with smooth behavior
6. **BUT**: CSS scroll-snap also activates simultaneously
7. Both try to scroll to different positions (snap-align vs scrollIntoView target)
8. Momentum continues from user's original scroll
9. Multiple wheel events fire during momentum, each checking entry condition
10. `wasInProjectsArea` hasn't updated yet, so condition triggers AGAIN
11. Result: Multiple competing scrolls fighting each other = flicker/jump

## The Fix Strategy

**Single Source of Truth:** Disable CSS snap entirely, use pure JavaScript control with proper state machine.

**Clear State Transitions:**
- IDLE: Free scrolling, no intervention
- ENTERING: One-time snap when crossing threshold (debounced)
- LOCKED: In section, discrete card navigation only
- EXITING: Release control back to free scroll

**Proper Locking:** Actually prevent native scroll during transitions using `preventDefault()`.

**Cooldown Enforcement:** Prevent gesture from triggering multiple transitions.

**Momentum Handling:** Accumulate wheel delta across multiple events before deciding to transition.
