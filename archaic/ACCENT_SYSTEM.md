# Theme-Aware Accent System

## Overview

The theme-aware accent system automatically updates all accent colors, gradients, and highlights across the site based on the selected background color. This creates a cohesive visual experience where UI elements remain harmonious with the generated background.

## Features

- ✅ **Automatic color derivation** - Generates light/regular/dark accent shades from any hue
- ✅ **Light/Dark mode aware** - Adjusts contrast automatically for readability
- ✅ **Default preservation** - Purple remains default, existing design unchanged
- ✅ **Persistent theming** - Selected colors persist across page navigations and reloads
- ✅ **Single source of truth** - DEFAULT_CONFIG in backgroundState.ts defines all defaults
- ✅ **Gradient generation** - Creates complementary gradient colors dynamically
- ✅ **System-wide updates** - All accent elements update without manual changes
- ✅ **Zero configuration** - Works automatically when background changes

## How It Works

### 1. Color Selection
When a user selects a background color via the Background Generator:
- User chooses hue: `purple` | `gray` | `red` | `orange` | `yellow` | `green` | `teal` | `blue` | `pink`
- Background is generated with that hue
- `setAccentHue(hue)` is automatically called

### 2. Color Derivation
The accent system derives three shades for each hue:
- **Light** - Lighter, higher saturation (for highlights, hover states)
- **Regular** - Medium tone (for borders, buttons, primary actions)
- **Dark** - Darker, richer tone (for shadows, depth)

Additionally generates:
- **Overlay** - Semi-transparent accent for subtle backgrounds
- **Complementary** - Analogous color for gradient variety

### 3. Theme Adjustment
Colors automatically adjust for light vs dark mode:

**Light Mode**:
- Darker accent tones (better contrast on light backgrounds)
- Slightly higher saturation

**Dark Mode**:
- Lighter accent tones (better contrast on dark backgrounds)
- Slightly lower saturation

### 4. CSS Variable Updates
All accent-related CSS custom properties are updated dynamically:

```css
--accent-light-override
--accent-regular-override
--accent-dark-override
--accent-overlay
--accent-subtle-overlay
--gradient-stop-1
--gradient-stop-2
--gradient-stop-3
--gradient-accent-orange-stop-1
```

### 5. Automatic Application
All UI elements using accent variables automatically update:
- Buttons and borders
- Icons and highlights
- Navigation elements
- Input focus states
- Gradients and overlays

## Usage

### For Developers

The system initializes automatically in [`BaseLayout.astro`](src/layouts/BaseLayout.astro):

```typescript
import { initAccentTheme } from '../scripts/accentTheme';
initAccentTheme();
```

Background generation automatically updates accents in [`backgroundState.ts`](src/scripts/backgroundState.ts):

```typescript
import { setAccentHue } from './accentTheme';

// After successful background generation:
setAccentHue(currentState.hue);
```

### For Users

Simply use the Background Generator popup:
1. Click "Customize Background" button
2. Select a hue from the dropdown
3. Click "Apply"
4. Background generates + all accents update automatically
5. Your selection is saved and persists across page navigations

### Persistence

The system uses **localStorage** to remember user preferences:

- **Storage Key**: `background-theme-config`
- **Stored Data**: Complete BackgroundConfig including hue, pattern, and all parameters
- **Initialization**: On page load, persisted values are restored automatically
- **Default**: If no persisted data exists, uses `DEFAULT_CONFIG` from backgroundState.ts
- **Reset**: The reset button clears persistence and restores defaults

**Benefits**:
- Consistent theme across all pages
- No visual flash or theme re-initialization
- User preferences remembered on reload
- Single source of truth prevents default value drift

## Architecture

### Core Files

#### [`src/scripts/accentTheme.ts`](src/scripts/accentTheme.ts)
Main accent system logic:
- `HUE_COLOR_MAP` - Defines HSL values for each hue
- `updateAccentTheme(hue)` - Updates CSS variables for given hue
- `initAccentTheme()` - Sets up theme change listener
- `setAccentHue(hue)` - Public API to change accent hue

#### [`src/scripts/backgroundState.ts`](src/scripts/backgroundState.ts)
Background generation + accent integration:
- Calls `setAccentHue()` after successful background generation
- Ensures accents always match background hue

#### [`src/styles/global.css`](src/styles/global.css)
CSS variable definitions:
- Original accent colors as fallbacks
- Override variables for dynamic updates
- Gradient definitions using dynamic stops

### Data Flow

```
User selects hue
    ↓
Background Generator UI
    ↓
backgroundState.generateBackground()
    ↓
API generates wallpaper
    ↓
setAccentHue(hue) called
    ↓
updateAccentTheme() calculates colors
    ↓
CSS variables updated
    ↓
All UI elements automatically update
```

## Color Mappings

### Purple (Default)
```typescript
light:   hsl(280, 89%, 67%)   // #c561f6
regular: hsl(280, 80%, 47%)   // #7611a6
dark:    hsl(270, 100%, 17%)  // #1c0056
```

### Gray
```typescript
light:   hsl(220, 15%, 65%)
regular: hsl(220, 20%, 45%)
dark:    hsl(220, 25%, 25%)
```

### Red
```typescript
light:   hsl(0, 75%, 65%)
regular: hsl(0, 70%, 45%)
dark:    hsl(0, 75%, 25%)
```

### Teal
```typescript
light:   hsl(180, 65%, 60%)
regular: hsl(180, 60%, 40%)
dark:    hsl(180, 65%, 20%)
```

*(See [`accentTheme.ts`](src/scripts/accentTheme.ts) for complete mappings)*

## Adding New Hues

To add support for a new hue:

1. Add entry to `HUE_COLOR_MAP` in [`accentTheme.ts`](src/scripts/accentTheme.ts):

```typescript
newhue: {
  light: { h: 150, s: 70, l: 65 },    // Lighter shade
  regular: { h: 150, s: 65, l: 45 },  // Medium shade
  dark: { h: 150, s: 70, l: 25 },     // Darker shade
  complementary: '#6bc4a8'             // Complementary color for gradients
}
```

2. Add hue option to Background Generator dropdown in [`BackgroundGenerator.astro`](src/components/BackgroundGenerator.astro):

```html
<option value="newhue">New Hue</option>
```

3. No other changes needed - system handles everything automatically!

## Contrast Guidelines

When defining new hues, ensure:
- **Light mode**: Dark enough accents (lightness < 50%)
- **Dark mode**: Light enough accents (lightness > 50% after adjustment)
- **Saturation**: 60-90% for vibrant appearance
- **Complementary**: Choose analogous or complementary color on color wheel

## Hardcoded Elements

Some gradients remain hardcoded by design. See [`GRADIENT_ANALYSIS.md`](GRADIENT_ANALYSIS.md) for complete report:

**Intentionally Static**:
- Project card background gradients (project-specific brand colors)
- PaperPigeon showcase subtle glass morphism effects

These elements maintain their fixed colors to preserve visual hierarchy and project identity.

## Debugging

Enable console logging to see accent updates:

```typescript
// In accentTheme.ts, updateAccentTheme() logs:
console.log(`🎨 Updated accent theme for hue: ${hue}`, {
  light: accentLight,
  regular: accentRegular,
  dark: accentDark,
  overlay: accentOverlay,
  complementary: colors.complementary
});
```

Inspect CSS variables in DevTools:
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--accent-regular')
```

## Browser Compatibility

- **CSS Custom Properties**: All modern browsers (IE11 not supported)
- **MutationObserver**: All modern browsers
- **HSL Colors**: All modern browsers

## Performance

- **No reflows**: Only CSS variable updates (GPU-accelerated)
- **Single observer**: One MutationObserver for theme changes
- **Cached calculations**: Color derivations happen once per hue change
- **Zero layout shift**: Colors update without affecting layout

## Future Enhancements

Possible future improvements:
- [ ] Color picker for custom hues (beyond presets)
- [ ] Accent preview before applying
- [ ] Save accent preference to localStorage
- [ ] Animate color transitions (smooth fade between accents)
- [ ] WCAG contrast validation for accessibility
- [ ] Export color palette as CSS/JSON

## Testing

To test the accent system:

1. **Default state**: Page loads with purple accents
2. **Gray background**: Select gray hue → all accents become gray-toned
3. **Red background**: Select red hue → all accents become red-toned
4. **Theme toggle**: Switch light/dark → accents adjust contrast automatically
5. **Navigation**: Visit other pages → accents persist across site

All accent-dependent UI elements should update seamlessly.
