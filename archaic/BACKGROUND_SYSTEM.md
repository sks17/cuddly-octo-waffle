# Background Generator System - Data Flow Documentation

## Overview
The background generator is now a fully functional system where popup controls actually generate new backgrounds via the LinearAlgebraWallpapers API server.

## Architecture

### Single Source of Truth: `backgroundState.ts`
- Manages background configuration state
- Coordinates API calls to the Flask server
- Updates the DOM with new backgrounds
- Provides clean async handling (loading states, errors)

### Component Responsibilities

#### 1. `BackgroundGenerator.astro` (UI Input)
**Role:** User interface for background customization

**Controls:**
- Hue dropdown (gray, blue, teal, purple, pink, red, orange, yellow, green)
- Pattern segmented control (mixed, uniform, gradient)
- 3 toggles (det brightness, use max, feathered)
- 3 sliders (blur 0-5, vignette 0-1, gap 0-4)

**Actions:**
- **Apply Button:** Collects UI state → Updates global state → Triggers generation
- **Reset Button:** Resets state to defaults → Updates UI

#### 2. `backgroundState.ts` (State Management)
**Role:** Central state manager and API coordinator

**State Interface:**
```typescript
interface BackgroundConfig {
  hue: string;
  pattern: 'mixed' | 'uniform' | 'gradient';
  use_determinant: boolean;
  use_max: boolean;
  feathered: boolean;
  blur_sigma: number;
  vignette_strength: number;
  gap_cells: number;
}
```

**Key Functions:**
- `getState()` - Read current configuration
- `updateState(partial)` - Update configuration
- `resetState()` - Reset to defaults
- `generateBackground()` - API call + DOM update
- `registerBackgroundElement(el)` - Connect to DOM element

#### 3. `heroBackground.ts` (DOM Management)
**Role:** DOM manipulation and animation only

**Responsibilities:**
- Create background div element
- Handle z-index stacking
- Manage fade in/out animations
- Register element with state manager

## Data Flow

### 1. Initial Load
```
Page Load
  ↓
heroBackground.ts → initHeroBackground()
  ↓
Create DOM element with placeholder image
  ↓
registerBackgroundElement(el)
  ↓
initializeBackground()
  ↓
generateBackground() with default state
  ↓
API call to Flask server
  ↓
Server generates wallpaper
  ↓
Response with image URL
  ↓
updateBackgroundImage(url)
  ↓
Fade animation → Background visible
```

### 2. User Changes Settings
```
User adjusts controls in popup
  ↓
User clicks "Apply"
  ↓
Collect UI state into config object
  ↓
updateState(config)
  ↓
generateBackground()
  ↓
API POST to /api/generate
  ↓
Server generates new wallpaper
  ↓
Response with new image URL
  ↓
updateBackgroundImage(url)
  ↓
Fade out old → Update src → Fade in new
  ↓
Panel closes automatically
```

### 3. API Request/Response

**Request to Flask Server:**
```json
POST http://localhost:5000/api/generate
{
  "canvas_width": 3840,  // window.innerWidth * 2
  "canvas_height": 2160, // window.innerHeight * 2
  "cell_size": 12,
  "low": 0,
  "high": 1,
  "normalizer": 0.5,
  "hue": "blue",
  "use_determinant": true,
  "use_max": true,
  "max_matrix_size": 4,
  "pattern": "mixed",
  "blur_sigma": 1.5,
  "vignette_strength": 0.3,
  "gap_cells": 1,
  "filename": "hero_1734398400000"
}
```

**Response:**
```json
{
  "success": true,
  "filename": "hero_1734398400000-map.png",
  "path": "/api/wallpapers/hero_1734398400000-map.png",
  "full_path": "/path/to/HomeWallpapers/hero_1734398400000-map.png",
  "parameters": { ... }
}
```

## Async State Handling

### Loading States
```typescript
isGenerating: boolean // Prevents concurrent generations

generateBackground():
  - Sets isGenerating = true
  - Disables Apply button
  - Shows "Generating..." text
  - On success: Updates background + closes panel
  - On error: Shows alert + keeps panel open
  - Finally: Resets button state
```

### Error Handling
- Network errors caught and logged
- User notified via alert
- Panel stays open for retry
- State remains unchanged on failure

## Extension Guide

### Adding New Controls

**1. Add to State Interface (backgroundState.ts):**
```typescript
interface BackgroundConfig {
  // ... existing
  my_new_option: boolean;
}
```

**2. Add to Default Config:**
```typescript
const DEFAULT_CONFIG = {
  // ... existing
  my_new_option: true
};
```

**3. Add UI Control (BackgroundGenerator.astro):**
```html
<input type="checkbox" data-control="my-option" checked />
```

**4. Wire Up in Script:**
```typescript
const myOptionToggle = panel.querySelector('[data-control="my-option"]');

generateBtn.addEventListener('click', async () => {
  const config = {
    // ... existing
    my_new_option: myOptionToggle.checked
  };
  updateState(config);
  await generateBackground();
});
```

**5. Update API Payload:**
```typescript
// backgroundState.ts - generateBackground()
const payload = {
  // ... existing
  my_new_option: currentState.my_new_option
};
```

### Adding New Hue Colors
Just add options to the select dropdown - no code changes needed:
```html
<option value="cyan">Cyan</option>
```

## Verification

### 1. Check State Updates
```
Open DevTools Console
→ Click controls in popup
→ Look for: "📝 State update requested"
→ Verify config matches UI
```

### 2. Check API Calls
```
Open Network tab
→ Click Apply button
→ Look for: POST to /api/generate
→ Check payload matches state
```

### 3. Check Background Updates
```
Click Apply
→ Look for: "🎨 Starting background generation"
→ Look for: "✅ Background generated successfully"
→ Look for: "🖼️ Updating background image"
→ Verify background changes visually
```

### 4. Check Server
```
Terminal running: python beginning.py --api
→ Look for: "🎨 Generating wallpaper: hero_..."
→ Look for: "✅ Saved to: ..."
```

## Server Setup

**Start API Server:**
```bash
cd LinearAlgebraWallpapers
python beginning.py --api
```

**Server runs on:** http://localhost:5000

**Endpoints:**
- `GET /api/wallpapers` - List all wallpapers
- `GET /api/wallpapers/<name>` - Get specific wallpaper
- `POST /api/generate` - Generate new wallpaper

## Troubleshooting

### Background doesn't change
1. Check console for errors
2. Verify API server is running
3. Check Network tab for failed requests
4. Verify Flask CORS is enabled

### "Failed to generate" error
1. Check Flask server terminal for errors
2. Verify ImgMap.jpg exists in LinearAlgebraWallpapers/
3. Check server logs for Python errors
4. Try generating directly: `curl -X POST http://localhost:5000/api/generate`

### UI doesn't update state
1. Check data-control attributes match
2. Verify querySelector is finding elements
3. Check console for "State update requested" logs

## Code Quality Notes

- **No hardcoded backgrounds:** All generation goes through state manager
- **Single source of truth:** State lives in one place only
- **Clean separation:** UI ↔ State ↔ API ↔ DOM
- **Type safety:** TypeScript interfaces for config
- **Error boundaries:** Try/catch with user feedback
- **Logging:** Console logs trace entire flow
