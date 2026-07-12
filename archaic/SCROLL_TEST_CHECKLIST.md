# Scroll System Test Checklist

## Code Changes Summary

### 1. **Removed CSS Scroll-Snap** (index.astro, ProjectSection.astro)
- Removed `scroll-snap-type`, `scroll-snap-align`, `scroll-snap-stop`
- JavaScript now has exclusive control over navigation

### 2. **Implemented State Machine** (projectFocus.ts)
- **IDLE**: Free scrolling outside section
- **ENTERING**: Debounced one-time entry snap (150ms debounce)
- **LOCKED**: Discrete card navigation with wheel threshold (100 deltaY)
- **TRANSITIONING**: Cooldown period (600ms) prevents multi-advance

### 3. **Fixed Entry Logic**
- Single entry detection based on container visibility (>50% viewport)
- Debounced to prevent multiple rapid snaps
- Clear state transitions with proper cleanup

### 4. **Added Proper Scroll Blocking**
- `preventDefault()` only in LOCKED/TRANSITIONING states
- Free scroll in IDLE/ENTERING states
- No competing scroll mechanisms

### 5. **Added Spotlight Effect**
- Dims work-header and work-cta when in LOCKED mode
- Focused project remains sharp
- Smooth transitions with CSS

### 6. **Accessibility**
- Keyboard navigation (Arrow keys, PageUp/PageDown)
- `prefers-reduced-motion` support (instant transitions)
- Proper focus management

## Manual Test Cases

### Mouse Wheel Tests

#### Test 1: Slow Scroll Entry
1. Start at top of page (hero section)
2. Slowly scroll down with mouse wheel
3. **Expected:** Smooth scroll until projects container >50% visible
4. **Expected:** One smooth snap to nearest project (no double-snap)
5. **Expected:** Work header/CTA dim slightly (spotlight effect)
6. **Status:** ✅ Pass / ❌ Fail

#### Test 2: Fast Scroll Entry
1. Start at top of page
2. Quick aggressive scroll down
3. **Expected:** Smooth entry with single snap (no jumping)
4. **Expected:** No skipping multiple projects on entry
5. **Status:** ✅ Pass / ❌ Fail

#### Test 3: Discrete Navigation
1. Enter projects section
2. Make small wheel movements (< 100 delta accumulation)
3. **Expected:** No movement until threshold crossed
4. Make larger wheel movement (> 100 delta)
5. **Expected:** Advance exactly one project
6. **Status:** ✅ Pass / ❌ Fail

#### Test 4: Rapid Scrolling (Cooldown Test)
1. In projects section
2. Rapidly scroll wheel many times
3. **Expected:** Projects advance one at a time with 600ms cooldown
4. **Expected:** Cannot skip multiple projects in <600ms
5. **Status:** ✅ Pass / ❌ Fail

#### Test 5: Reverse Scroll
1. In projects section at card 2 or 3
2. Scroll up
3. **Expected:** Navigate backwards one card at a time
4. **Expected:** Same cooldown behavior
5. **Status:** ✅ Pass / ❌ Fail

#### Test 6: Exit Section (Scroll Down Past Last Card)
1. Navigate to last project
2. Continue scrolling down
3. **Expected:** Exit to free scroll (ContactCTA section)
4. **Expected:** Spotlight effect removed
5. **Status:** ✅ Pass / ❌ Fail

#### Test 7: Exit Section (Scroll Up Before First Card)
1. At first project
2. Scroll up
3. **Expected:** Exit to free scroll (work header section)
4. **Expected:** Spotlight effect removed
5. **Status:** ✅ Pass / ❌ Fail

### Trackpad Tests

#### Test 8: Trackpad Momentum Entry
1. Start at hero
2. Use trackpad with momentum gesture (fast swipe)
3. **Expected:** Momentum carries through until >50% visible
4. **Expected:** Single entry snap (no flicker from momentum)
5. **Expected:** No double-advance
6. **Status:** ✅ Pass / ❌ Fail

#### Test 9: Trackpad Delta Accumulation
1. In projects section
2. Make many small trackpad movements (each < 100 delta)
3. **Expected:** Delta accumulates across gestures
4. **Expected:** Advance when cumulative delta > 100
5. **Status:** ✅ Pass / ❌ Fail

#### Test 10: Trackpad Precision Scroll
1. In projects section
2. Use precise two-finger drag (very slow)
3. **Expected:** Accumulates smoothly
4. **Expected:** Transitions when threshold met
5. **Status:** ✅ Pass / ❌ Fail

### Keyboard Tests

#### Test 11: Arrow Key Navigation
1. Enter projects section
2. Press ArrowDown
3. **Expected:** Advance one project
4. Press ArrowUp
5. **Expected:** Go back one project
6. **Status:** ✅ Pass / ❌ Fail

#### Test 12: Page Keys
1. In projects section
2. Press PageDown
3. **Expected:** Advance one project
4. Press PageUp
5. **Expected:** Go back one project
6. **Status:** ✅ Pass / ❌ Fail

#### Test 13: Keyboard Exit
1. At last project
2. Press ArrowDown or PageDown
3. **Expected:** Exit to free scroll
4. **Status:** ✅ Pass / ❌ Fail

### Edge Cases

#### Test 14: Scroll During Transition
1. Trigger project transition
2. Immediately scroll wheel during animation
3. **Expected:** Scroll ignored until cooldown expires
4. **Expected:** No jank or competing animations
5. **Status:** ✅ Pass / ❌ Fail

#### Test 15: Page Resize
1. Enter projects section at card 2
2. Resize browser window
3. **Expected:** Card 2 remains focused
4. **Expected:** Layout adjusts gracefully
5. **Status:** ✅ Pass / ❌ Fail

#### Test 16: Fast Back-Forth Scrolling
1. In projects section
2. Quickly scroll down then up then down
3. **Expected:** State machine handles correctly
4. **Expected:** No stuck states or double-advance
5. **Status:** ✅ Pass / ❌ Fail

#### Test 17: Browser Back/Forward
1. Navigate to project detail page
2. Click browser back button
3. **Expected:** Return to correct scroll position
4. **Expected:** No automatic snap on load
5. **Status:** ✅ Pass / ❌ Fail

### Mobile / Touch Tests

#### Test 18: Touch Scroll Entry
1. On mobile/tablet
2. Swipe up to scroll into projects
3. **Expected:** Smooth entry with snap
4. **Expected:** Touch scroll still works (not blocked)
5. **Status:** ✅ Pass / ❌ Fail

#### Test 19: Touch Fling Gesture
1. Fast swipe/fling in projects section
2. **Expected:** Momentum carries but snaps to cards
3. **Expected:** No multiple rapid transitions
4. **Status:** ✅ Pass / ❌ Fail

### Accessibility Tests

#### Test 20: Reduced Motion
1. Enable "Reduce Motion" in OS settings
2. Enter projects section
3. **Expected:** Transitions are instant (no animation)
4. **Expected:** Navigation still works
5. **Status:** ✅ Pass / ❌ Fail

#### Test 21: Screen Reader
1. Use screen reader
2. Navigate through projects
3. **Expected:** Focus states announced correctly
4. **Expected:** Keyboard navigation works
5. **Status:** ✅ Pass / ❌ Fail

## Known Behaviors (Not Bugs)

- **600ms cooldown**: Intentional to prevent rapid multi-advance
- **100 delta threshold**: Requires moderate scroll gesture, prevents accidental triggers
- **Entry snap**: Happens when container >50% visible, may feel delayed on very slow scroll
- **Spotlight dims by 70%**: Non-focused projects intentionally faded for focus effect

## Regression Tests

After fixes, verify:
- ✅ Hero text animation still works
- ✅ Mathematical background still renders
- ✅ Scroll overlay fade still works
- ✅ Project links still clickable
- ✅ Other page sections scroll normally
- ✅ Footer accessible
- ✅ No console errors

## Performance Checks

- Check console for excessive event logs
- Verify smooth 60fps during transitions (DevTools Performance tab)
- Monitor memory (should not leak on repeated navigation)
- Test on slower devices/browsers

## Why This Prevents Flicker By Construction

1. **Single Authority**: Only JavaScript controls scroll position in section
2. **Clear States**: State machine prevents ambiguous "who's in control" moments
3. **Debounced Entry**: 150ms debounce prevents multiple entry snaps
4. **Cooldown Lock**: 600ms prevents gestures from triggering multiple transitions
5. **Proper preventDefault**: Blocks native scroll only when necessary
6. **Threshold-Based**: Requires deliberate gesture, ignores noise
7. **No CSS Snap Conflict**: CSS scroll-snap removed entirely
