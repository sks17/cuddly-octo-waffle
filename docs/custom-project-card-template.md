# Custom Project Card Visual Template Guide

This guide explains how to create custom visual components for project cards, using the Paper Pigeon card as a reference implementation.

## Overview

Custom project visuals replace the default content overlay on project cards, giving you full creative control over the presentation. The Paper Pigeon card demonstrates a 3-column layout with GIF, text content, and a technologies table.

## Card Height Customization

Each project card can have its own unique height by setting properties in `projectRegistry.ts`:

```typescript
{
  id: 'your-project',
  title: 'Your Project',
  // ... other properties
  cardHeight: '50vh',      // Card viewport height (default: 60vh)
  cardMinHeight: '400px',  // Minimum pixel height (default: 450px)
  visualComponent: 'YourProjectVisual'
}
```

### Height Examples

**Shorter card (like Paper Pigeon):**
```typescript
cardHeight: '50vh',
cardMinHeight: '400px'
```

**Medium card (default):**
```typescript
// Omit properties or use:
cardHeight: '60vh',
cardMinHeight: '450px'
```

**Taller card:**
```typescript
cardHeight: '75vh',
cardMinHeight: '550px'
```

**Very tall card:**
```typescript
cardHeight: '90vh',
cardMinHeight: '700px'
```

## Template Structure

### File Location
Create your visual component in:
```
src/components/visuals/YourProjectVisual.astro
```

### Basic Template

```astro
---
/**
 * Your Project Visual Component
 * 
 * Custom visual for the [Project Name] project card.
 * Brief description of what makes this visual unique.
 */
---

<div class="your-project-visual">
  <div class="container">
    <!-- Your layout here -->
  </div>
</div>

<style>
  .your-project-visual {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white; /* or your preferred background */
    position: relative;
    overflow: hidden;
  }

  .container {
    display: grid;
    grid-template-columns: 350px 1fr 180px; /* Adjust column widths */
    gap: 2.5rem;
    align-items: center;
    max-width: 80%;
    width: 100%;
    padding: 0.5rem 2rem; /* Vertical | Horizontal spacing */
  }
</style>
```

## Paper Pigeon Pattern: 3-Column Flexible Layout

### Current Layout (GIF | Title+Description | Tech Table)

**HTML:**
```astro
<div class="pp-container">
  <!-- Left: GIF -->
  <div class="pp-gif-col">
    <div class="pp-demo">
      <img src="/assets/YourGif.gif" alt="Demo" class="pp-gif" />
    </div>
  </div>

  <!-- Center: Title and Description -->
  <div class="pp-center-col">
    <div class="pp-header">
      <img src="/assets/YourLogo.png" alt="Logo" class="pp-logo" />
      <h2 class="pp-title">Project Name</h2>
    </div>
    <div class="pp-description">
      <p>Your project description here.</p>
    </div>
  </div>

  <!-- Right: Tech Table -->
  <div class="pp-tech-col">
    <div class="pp-tech">
      <h3 class="tech-title">Technologies</h3>
      <div class="tech-grid">
        <div class="tech-item">Tech 1</div>
        <div class="tech-item">Tech 2</div>
      </div>
    </div>
  </div>
</div>
```

### Rearranging Columns

You can swap the three sections in **any order** by simply rearranging the HTML blocks:

#### Option 1: Title | GIF | Tech (Title on left)
```astro
<div class="pp-container">
  <!-- Left: Title and Description -->
  <div class="pp-center-col">
    <div class="pp-header">...</div>
    <div class="pp-description">...</div>
  </div>

  <!-- Center: GIF -->
  <div class="pp-gif-col">
    <div class="pp-demo">
      <img src="/assets/YourGif.gif" />
    </div>
  </div>

  <!-- Right: Tech Table -->
  <div class="pp-tech-col">
    <div class="pp-tech">...</div>
  </div>
</div>
```

#### Option 2: Tech | Title | GIF (GIF on right)
```astro
<div class="pp-container">
  <!-- Left: Tech Table -->
  <div class="pp-tech-col">...</div>

  <!-- Center: Title and Description -->
  <div class="pp-center-col">...</div>

  <!-- Right: GIF -->
  <div class="pp-gif-col">...</div>
</div>
```

#### Option 3: GIF | Tech | Title (Tech in middle)
```astro
<div class="pp-container">
  <!-- Left: GIF -->
  <div class="pp-gif-col">...</div>

  <!-- Center: Tech Table -->
  <div class="pp-tech-col">...</div>

  <!-- Right: Title and Description -->
  <div class="pp-center-col">...</div>
</div>
```

**The key:** Grid columns flow left-to-right in the order you write the HTML. Change the HTML order to change the visual layout.

### Adjusting Column Widths for Different Arrangements

When rearranging, adjust `grid-template-columns` to match your content:

**GIF on left (current Paper Pigeon):**
```css
grid-template-columns: 350px 1fr 180px; /* Large GIF | Flexible text | Small tech */
```

**Title on left, GIF center:**
```css
grid-template-columns: 300px 400px 1fr; /* Title | Large GIF | Flexible tech */
```

**Tech on left, title center, GIF right:**
```css
grid-template-columns: 200px 1fr 350px; /* Small tech | Flexible title | Large GIF */
```

**Equal columns:**
```css
grid-template-columns: 1fr 1fr 1fr; /* All equal width */
```

## Styling Individual Elements

### GIF/Visual Styling

**Current Paper Pigeon (no border, transparent):**
```css
.pp-demo {
  background: transparent;
  border: none;
  padding: 0;
  width: 100%;
  max-height: 350px;
}

.pp-gif {
  width: 100%;
  height: auto;
  max-height: 320px;
  object-fit: contain;
  border-radius: 4px;
}
```

**With border/background:**
```css
.pp-demo {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  width: 100%;
  max-height: 350px;
}
```

### Title and Description

**Current sizes:**
```css
.pp-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
}

.pp-description p {
  font-size: 1.05rem;
  line-height: 1.65;
  color: #4a5568;
}
```

**Larger/smaller variations:**
```css
/* Larger */
.pp-title { font-size: 2.8rem; }
.pp-description p { font-size: 1.2rem; }

/* Smaller */
.pp-title { font-size: 1.6rem; }
.pp-description p { font-size: 0.9rem; }
```

### Technologies Table

**Vertical list (current):**
```css
.tech-grid {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.tech-item {
  padding: 0.35rem 0.6rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.68rem;
  text-align: center;
}
```

**Horizontal pills:**
```css
.tech-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

**2-column grid:**
```css
.tech-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
```

## Adjusting Vertical Space

### Container Padding (Top/Bottom spacing)

**Current Paper Pigeon:**
```css
padding: 0.5rem 2rem; /* Very tight vertical */
```

**Common values:**
```css
padding: 0 2rem;      /* No vertical padding */
padding: 0.25rem 2rem; /* Minimal */
padding: 0.5rem 2rem;  /* Tight (current) */
padding: 1rem 2rem;    /* Comfortable */
padding: 2rem;         /* Spacious */
```

### Element Gaps

**Current spacing:**
```css
.pp-container {
  gap: 2.5rem; /* Space between columns */
}

.pp-center-col {
  gap: 1.5rem; /* Space between title and description */
}
```

**Adjust to taste:**
```css
gap: 1rem;   /* Tight */
gap: 2rem;   /* Medium */
gap: 3rem;   /* Loose */
```

## Complete Column Width Reference

### Fixed-width columns
```css
grid-template-columns: 350px 1fr 180px;
```
- `350px` - GIF column (fixed large)
- `1fr` - Text (flexible, takes remaining space)
- `180px` - Tech table (fixed small)

### Proportional columns
```css
grid-template-columns: 2fr 3fr 1fr;
```
- Divides space into 6 parts: 2 parts, 3 parts, 1 part

### Mixed approach
```css
grid-template-columns: 400px 1fr 200px;
```
- Fixed outer columns, flexible center

### Two-column layout
```css
grid-template-columns: 1fr 1fr;
/* or */
grid-template-columns: 450px 1fr;
```

### Single column (mobile)
```css
grid-template-columns: 1fr;
```

## Responsive Behavior

The Paper Pigeon template includes 3 breakpoints:

### Desktop (default)
```css
.pp-container {
  grid-template-columns: 350px 1fr 180px;
  gap: 2.5rem;
  max-width: 80%;
  padding: 0.5rem 2rem;
}
```

### Tablet (@media max-width: 1400px)
```css
@media (max-width: 1400px) {
  .pp-container {
    grid-template-columns: 320px 1fr 170px; /* Smaller columns */
    gap: 2rem;
    max-width: 85%;
  }
}
```

### Mobile (@media max-width: 1200px)
```css
@media (max-width: 1200px) {
  .pp-container {
    grid-template-columns: 1fr; /* Stack vertically */
    gap: 1.75rem;
    max-width: 600px;
    padding: 1.5rem;
  }
}
```

### Small Mobile (@media max-width: 49.9em)
```css
@media (max-width: 49.9em) {
  .pp-container {
    max-width: 95%;
    padding: 1rem;
    gap: 1.25rem;
  }
  
  .pp-title {
    font-size: 1.3rem; /* Smaller text */
  }
  
  .tech-grid {
    grid-template-columns: repeat(2, 1fr); /* 2-column tech grid */
  }
}
```

## Integration Steps

### 1. Create Visual Component
Save your component in `src/components/visuals/YourProjectVisual.astro`

### 2. Import in ProjectSection.astro
```typescript
// At top of src/components/ProjectSection.astro
import YourProjectVisual from './visuals/YourProjectVisual.astro';

// In visualComponents mapping:
const visualComponents = {
  'PaperPigeonVisual': PaperPigeonVisual,
  'YourProjectVisual': YourProjectVisual, // Add this
};
```

### 3. Register in projectRegistry.ts
```typescript
{
  id: 'your-project',
  title: 'Your Project',
  description: 'Brief description',
  tags: ['Tag1', 'Tag2'],
  publishDate: new Date('2026-01-12'),
  colorTheme: 'white',          // or cyan, purple, orange
  visualComponent: 'YourProjectVisual',
  cardHeight: '55vh',           // Optional: custom card height
  cardMinHeight: '420px'        // Optional: minimum height
}
```

### 4. Add Assets
Place images in `public/assets/`:
- `YourProjectDemo.gif` (or .png/.jpg)
- `YourProjectLogo.png`
- Any decorative elements

## Quick Reference: Paper Pigeon Settings

**Current configuration:**
- **Card height:** Default (60vh / 450px) - can be customized per card
- **Layout:** GIF (350px) | Title+Text (flexible) | Tech (180px)
- **GIF:** No border, transparent background, max 320px height
- **Title:** 2.2rem
- **Description:** 1.05rem
- **Technologies:** 5 items, vertical list
- **Vertical padding:** 0.5rem (very tight)
- **Column gap:** 2.5rem
- **Max width:** 80% of card

## Layout Templates by Use Case

### Heavy Visual Focus
```css
grid-template-columns: 500px 1fr 150px;
/* Large GIF/image dominates */
```

### Text-Heavy Project
```css
grid-template-columns: 250px 1fr 150px;
/* More space for description */
```

### Technical/Code Project
```css
grid-template-columns: 300px 1fr 250px;
/* Larger tech list on right */
```

### Minimal/Clean
```css
grid-template-columns: 1fr 1fr;
/* Just two elements, no tech list */
```

## Design Tips

### Do's:
✓ **Keep content centered** with `max-width` constraints  
✓ **Use consistent padding** across similar elements  
✓ **Limit text length** to maintain readability  
✓ **Test responsive behavior** on multiple screen sizes  
✓ **Set custom card heights** for better content fit  
✓ **Remove borders/backgrounds** for cleaner visuals  
✓ **Rearrange columns** to emphasize most important content

### Don'ts:
✗ **Avoid absolute positioning** for main content (breaks responsiveness)  
✗ **Don't hardcode colors** - use CSS custom properties  
✗ **Don't exceed max-height constraints** on visuals  
✗ **Avoid tiny font sizes** (< 0.7rem) for accessibility  
✗ **Don't ignore mobile breakpoints** - always test stacking behavior

## Troubleshooting

**Content too wide:**
- Reduce `max-width` percentage on `.container`
- Check for fixed widths on child elements
- Reduce column widths in `grid-template-columns`

**Too much vertical space:**
- Reduce `padding` top/bottom values on `.container`
- Reduce `gap` values in grid
- Set custom `cardHeight` and `cardMinHeight` in registry

**Too little vertical space:**
- Increase `padding` on `.container`
- Increase `gap` values
- Set larger `cardHeight` in registry (e.g., `70vh`)

**Layout breaks on mobile:**
- Ensure responsive media queries are present
- Use `grid-template-columns: 1fr` for mobile breakpoint
- Test with browser dev tools at various widths

**Images too large:**
- Set explicit `max-height` on container
- Set `max-height` on `<img>` element itself
- Use `object-fit: contain` to prevent distortion

**Columns in wrong order:**
- Rearrange HTML blocks (not CSS) to change visual order
- Grid flows left-to-right based on HTML order

## Example Variations

See existing implementations:
- `PaperPigeonVisual.astro` - 3-column layout with borderless GIF
- `LinearAlgebraVisual.astro` - Canvas-based generative visual

## Color Themes

Available in `projectRegistry.ts`:
- `'cyan'` - Light blue/teal (Paper Pigeon uses `'white'`)
- `'purple'` - Deep purple
- `'orange'` - Warm orange
- `'white'` - Neutral/minimal (most flexible)

Background colors are automatically applied via `ProjectSection.astro` based on theme selection.

---

**Need help?** Reference the Paper Pigeon implementation as a complete working example.

