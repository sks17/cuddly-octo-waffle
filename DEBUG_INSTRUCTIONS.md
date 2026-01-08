# Debug Instructions - Background Visibility Issue

## Changes Made
Added comprehensive console logging to `heroBackground.ts` to diagnose why the background image is not visible.

## What to Do Next

### 1. Rebuild and Run the Dev Server
```powershell
npm run dev
```

### 2. Open the Page in Browser
Navigate to `http://localhost:4321/`

### 3. Open Browser DevTools
- Press F12 or right-click → Inspect
- Go to the **Console** tab

### 4. Wait for Animations to Complete
The text animation sequence takes about 5 seconds:
- Title appears immediately
- Tagline appears at 900ms
- Pills appear at 4000ms
- Hero transition starts
- Background initialization starts

### 5. Review Console Output

You should see logs in this order:

```
🎨 Background element created with properties:
  z-index: 0
  position: absolute
  top: [some number]px
  width: 100vw
  height: calc(100vh - [some number]px)
  backgroundImage: url('/assets/FirstBackground-map.png')
  opacity: 0
  clipPath: circle(0% at 100% 0%)

📏 Body dimensions BEFORE insert:
  body.offsetHeight: [number]
  body.clientHeight: [number]
  body.scrollHeight: [number]
  window.innerHeight (viewport): [number]
  body computed height: [value]

✅ Background element inserted into DOM
Element dimensions: { offsetWidth: [number], offsetHeight: [number], ... }

🎬 animateBackgroundIn called
Initial opacity: 0
Initial clipPath: circle(0% at 100% 0%)

⏰ Animation timeout fired (100ms elapsed)
Set opacity to: 1
Set clipPath to: circle(150% at 100% 0%)

📊 COMPUTED STYLES:
  opacity: [actual computed value]
  clipPath: [actual computed value]
  display: [value]
  visibility: [value]
  position: [value]
  zIndex: [value]
  width: [value]
  height: [value]
  top: [value]
  left: [value]
  backgroundImage: [url]
```

### 6. Critical Values to Check

Compare these values from the console:

**Body Height vs Viewport:**
- Is `body.offsetHeight` < `window.innerHeight`?
- If YES → Body is shorter than viewport, may clip absolute child

**Element Dimensions:**
- Is `offsetWidth` = 0 or `offsetHeight` = 0?
- If YES → Element has no size, won't render

**Computed Styles:**
- Is `opacity` = "1"? (Should be after animation)
- Is `display` = "block" or "none"?
- Is `visibility` = "visible" or "hidden"?
- Is `clipPath` = "circle(150% at 100% 0%)"? (Should be after animation)
- Does `backgroundImage` show the correct URL?

**Network Tab:**
- Switch to Network tab
- Filter by "Img" or "All"
- Look for request to `/assets/FirstBackground-map.png`
- Is status 200 (success) or 404 (not found)?

### 7. Elements Tab Inspection

In DevTools Elements tab:
1. Find the `<body>` element
2. Expand to see its children
3. Look for `<div class="hero-math-background">`
4. If it exists:
   - Check its computed styles (right panel)
   - Check its box model (dimensions)
   - Hover over element - does it highlight anything on page?
5. If it doesn't exist:
   - JavaScript error prevented insertion

### 8. Report Findings

Please share:
1. **All console logs** (copy/paste the output)
2. **Body height comparison**: body.offsetHeight vs window.innerHeight
3. **Element existence**: Does `.hero-math-background` appear in Elements tab?
4. **Computed opacity and clipPath**: Final values after animation
5. **Network request**: Did `/assets/FirstBackground-map.png` load successfully?
6. **Visual result**: Still not visible, or now working?

## Expected Diagnosis Outcomes

Based on the data, we can identify:

**Scenario A: Body Too Short**
- body.offsetHeight < window.innerHeight
- Element height = calc(100vh - navHeight) extends beyond body
- Element gets clipped by body's overflow

**Scenario B: Animation Not Running**
- animateBackgroundIn logs don't appear
- Opacity stays at 0
- Element exists but is invisible

**Scenario C: Image Not Loading**
- Network tab shows 404 for image
- Background shows but is blank/color only

**Scenario D: Element Not Created**
- No logs appear
- JavaScript error prevented execution

**Scenario E: CSS Override**
- Element exists, animation runs
- Computed opacity = 1, clipPath correct
- But display: none or visibility: hidden from CSS

Each scenario has a different fix. The console logs will tell us which one.
