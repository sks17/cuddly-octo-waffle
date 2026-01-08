# Adding New Projects: Complete Guide

This guide walks you through adding a new project to your portfolio website, from homepage card to detailed project page.

## Overview

Projects appear in three places:
1. **Homepage** - Featured project cards with custom visuals
2. **Work Page** - Complete project listing
3. **Project Detail Page** - Individual project showcase

## Step-by-Step Process

### 1. Add Project to Registry

**File**: [`src/data/projectRegistry.ts`](src/data/projectRegistry.ts)

Add your new project entry to the `projectRegistry` array:

```typescript
{
  id: 'your-project-id',
  title: 'Your Project Name',
  description: 'A compelling description that appears on cards and in listings.',
  tags: ['Dev', 'Frontend', 'API'], // Categories for filtering/grouping
  publishDate: new Date('2024-01-15'), // Controls sorting order
  colorTheme: 'cyan', // 'cyan' | 'purple' | 'orange' | 'white'
  
  // Optional: Custom visual component
  visualComponent: 'YourProjectVisual' // If you want custom homepage visual
  
  // Optional: Fallback image (if no custom visual)
  img: '/assets/your-project-image.jpg',
  img_alt: 'Description of your project image'
}
```

**Important Notes:**
- `id`: Must be unique and URL-friendly (used for routing)
- `publishDate`: Determines order on homepage (newest first)
- `colorTheme`: Affects card styling and accent colors
- `visualComponent`: Optional custom component name (see step 2)

### 2. Create Custom Visual (Optional)

**File**: `src/components/visuals/YourProjectVisual.astro`

If you specified a `visualComponent` in the registry:

```astro
---
// Custom visual component for your project
// This replaces the standard image on the homepage card
---

<div class="your-project-visual">
  <!-- Your custom visual content -->
  <div class="custom-demo">
    <!-- Interactive elements, animations, etc. -->
  </div>
</div>

<style>
  .your-project-visual {
    /* Your custom styling */
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custom-demo {
    /* Visual styling that matches your project theme */
  }
</style>
```

### 3. Create Project Detail Page

**File**: `src/content/work/your-project-id.md`

Create a markdown file with the same ID as your registry entry:

```markdown
---
title: Your Project Name
description: Detailed description for the project page
publishDate: 2024-01-15
tags:
  - Dev
  - Frontend
  - API
img: /assets/your-project-detail-image.jpg
img_alt: Description of detail page image
---

# Your Project Name

Detailed content about your project goes here. This supports full markdown including:

- Lists and formatting
- Code blocks
- Images and media
- Links and references

## Project Overview

Explain what your project does, the problems it solves, and the technologies used.

## Technical Implementation

Describe your technical approach, interesting challenges, and solutions.

## Results and Impact

Share outcomes, metrics, or user feedback if available.
```

**Alternative: Astro Page (for complex projects)**

For projects requiring custom layouts or interactive elements, create:

**File**: `src/pages/work/your-project-id.astro`

```astro
---
import VisualCodeLayout from '../../layouts/VisualCodeLayout.astro';
// Import any custom components needed
---

<VisualCodeLayout 
  title="Your Project Name"
  description="Detailed description"
  publishDate={new Date('2024-01-15')}
>
  <!-- Custom project content with interactive elements -->
  <div class="custom-project-content">
    <!-- Your custom layout and components -->
  </div>
</VisualCodeLayout>
```

### 4. Add Project Assets

**Directory**: `public/assets/`

Add any images or media files your project needs:
- Homepage card images: `public/assets/project-card-image.jpg`
- Detail page images: `public/assets/project-detail-image.jpg`
- Additional media: `public/assets/project-name/`

### 5. Verification Checklist

After adding your project, verify:

- [ ] Project appears on homepage in correct order
- [ ] Project card displays properly with chosen color theme
- [ ] Custom visual component renders correctly (if used)
- [ ] Project appears in work page listing
- [ ] Project detail page loads without errors
- [ ] All images display correctly
- [ ] Links and navigation work properly

## Registry Configuration Options

### Color Themes

Each theme provides different styling:
- **`cyan`**: Blue/teal accent colors
- **`purple`**: Purple/magenta accent colors  
- **`orange`**: Orange/amber accent colors
- **`white`**: Minimalist white/gray theme

### Visual Components

Custom visual components replace the standard image on homepage cards:
- Must be placed in `src/components/visuals/`
- Should be responsive and accessible
- Can include animations, interactive elements, or custom graphics
- Will be automatically imported and rendered by the project card system

### Project Ordering

Projects are automatically sorted by `publishDate` (newest first). To feature an older project:
1. Update its `publishDate` to be more recent
2. Or create a `featured: true` flag (requires registry modification)

## Troubleshooting

**Project doesn't appear on homepage:**
- Check that the registry entry is valid JavaScript/TypeScript
- Verify the `publishDate` format
- Ensure no syntax errors in `projectRegistry.ts`

**Custom visual doesn't load:**
- Verify the component file exists in `src/components/visuals/`
- Check that the `visualComponent` name matches the file name exactly
- Look for console errors in the browser

**Detail page shows 404:**
- Ensure the markdown file ID matches the registry ID exactly
- Check that the file is in the correct location (`src/content/work/`)
- Verify the frontmatter is valid YAML

**Images don't load:**
- Check that image paths start with `/assets/`
- Verify files exist in the `public/assets/` directory
- Ensure proper file extensions and naming

## Best Practices

1. **Use descriptive IDs**: Choose clear, URL-friendly project identifiers
2. **Optimize images**: Compress images for web performance
3. **Write compelling descriptions**: Both registry and detail descriptions should be engaging
4. **Tag consistently**: Use consistent tag names across projects for better organization
5. **Test thoroughly**: Always check all three locations where the project appears
6. **Keep content updated**: Refresh project content and images periodically

## Example Implementation

See the existing projects in [`src/data/projectRegistry.ts`](src/data/projectRegistry.ts) for complete examples of:
- Projects with custom visuals (Paper Pigeon, Linear Algebra Visualizer)
- Projects with fallback images (Bloom Box, Markdown Mystery Tour)
- Different color themes and tag combinations