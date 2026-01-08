# VisualCodeLayout Usage Guide

The `VisualCodeLayout` is a reusable three-column layout designed for both project and blog pages that need to display custom visual/interactive content alongside contextual navigation.

## Layout Structure

```
┌─────────────────┬─────────────────────┬─────────────────┐
│  Similar        │                     │  Similar Blogs  │
│  Projects       │   Main Visual       │                 │
│                 │   Content Area      │  Additional     │
│                 │                     │  Info           │
└─────────────────┴─────────────────────┴─────────────────┘
│                Contact CTA + Footer                     │
└─────────────────────────────────────────────────────────┘
```

## Props Interface

```typescript
interface Props {
  title: string;                    // Page title
  description: string;              // Page description
  publishDate?: Date;               // Optional publish date
  similarProjects?: Array<{         // Related projects in left sidebar
    id: string;
    title: string;
    description: string;
    img?: string;
    img_alt?: string;
  }>;
  similarBlogs?: Array<{            // Related blogs in right sidebar
    id: string;
    title: string;
    description: string;
    publishDate: Date;
  }>;
  additionalInfo?: {                // Additional info in right sidebar
    tags?: string[];
    tech?: string[];
    links?: Array<{ label: string; url: string; }>;
    metadata?: Record<string, string>;
  };
}
```

## Usage Examples

### Project Page (`/work/[slug].astro`)

```astro
---
import VisualCodeLayout from '../../layouts/VisualCodeLayout.astro';
// ... get similar content and project data
---

<VisualCodeLayout 
  title={project.title}
  description={project.description}
  publishDate={project.publishDate}
  similarProjects={similarProjects}
  similarBlogs={similarBlogs}
  additionalInfo={{
    tags: project.tags,
    tech: ['React', 'TypeScript'],
    links: [{ label: 'GitHub', url: 'https://github.com/...' }],
    metadata: {
      'Status': 'Complete',
      'Team Size': '3 people'
    }
  }}
>
  <!-- Your custom visual content goes here -->
  <div class="custom-interactive-demo">
    <!-- Interactive components, visualizations, etc. -->
  </div>
  
  <!-- Traditional markdown content -->
  <div class="project-content">
    <Content />
  </div>
</VisualCodeLayout>
```

### Blog Page (`/blogs/[slug].astro`)

```astro
---
import VisualCodeLayout from '../../layouts/VisualCodeLayout.astro';
// ... get similar content and blog data
---

<VisualCodeLayout 
  title={blog.title}
  description={blog.description}
  publishDate={blog.publishDate}
  similarProjects={relatedProjects}
  similarBlogs={relatedBlogs}
  additionalInfo={{
    tags: blog.tags,
    metadata: {
      'Reading Time': '8 min',
      'Category': 'Tutorial'
    }
  }}
>
  <!-- Blog content with interactive elements -->
  <div class="blog-interactive">
    <!-- Code demos, interactive tutorials, etc. -->
  </div>
  
  <!-- Blog text content -->
  <div class="blog-text">
    <!-- Article content -->
  </div>
</VisualCodeLayout>
```

## Key Features

1. **Flexible Center Area**: Not limited to markdown - can contain any custom visual/interactive components
2. **Contextual Navigation**: Related projects and blogs provide natural discovery paths
3. **Responsive Design**: Gracefully adapts to mobile with collapsing sidebar layout
4. **Reused Footer**: Automatically includes ContactCTA and site Footer components
5. **Theme Integration**: Uses existing CSS variables and follows site's design system

## File Locations

- **Layout**: `src/layouts/VisualCodeLayout.astro`
- **Example Project Usage**: `src/pages/work/[...slug].astro`
- **Example Blog Usage**: `src/pages/blogs/[slug].astro` (placeholder)

## Customization

The layout uses CSS variables from the global theme system, so accent colors, spacing, and other design tokens automatically match the site's current theme. Custom styling can be added within the slot content area without affecting the overall layout structure.

## Next Steps

1. **Blog Collection**: Create `src/content/config.ts` entry for blog collection
2. **Similar Content Logic**: Enhance tag-based similarity matching
3. **Custom Visuals**: Add more interactive components for project and blog demonstrations
4. **Navigation**: Consider adding breadcrumbs or back navigation to layout header