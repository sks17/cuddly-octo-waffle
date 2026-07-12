# Copilot Instructions for far-flare

## Project Overview
**far-flare** is an Astro-based portfolio website showcasing professional work and skills. This is a content-driven static site with a sophisticated theming system and dynamic work portfolio routing.

## Architecture

### Key Structure
- **Pages** (`src/pages/`) - Route-based content (home, about, work list, dynamic work detail pages)
- **Layouts** (`src/layouts/`) - `BaseLayout.astro` wraps all pages with navigation, footer, and background styling
- **Components** (`src/components/`) - Reusable UI building blocks (Hero, Nav, Grid, PortfolioPreview, etc.)
- **Content** (`src/content/work/`) - Markdown files with frontmatter schema (title, description, publishDate, tags, img, img_alt)
- **Styles** (`src/styles/global.css`) - Global CSS variables for theming, colors, gradients, typography

### Data Flow
1. Work collection defined in [src/content.config.ts](src/content.config.ts) - Zod schema enforces: title, description, publishDate, tags, img, img_alt
2. [src/pages/index.astro](src/pages/index.astro) - Fetches and sorts work by publishDate (newest first), displays top 4
3. [src/pages/work/[...slug].astro](src/pages/work/[...slug].astro) - Dynamic route rendering individual work items using `getStaticPaths()` and `render()` from astro:content

### Theme System
- **Light/Dark Mode**: Toggle in [src/components/ThemeToggle.astro](src/components/ThemeToggle.astro)
  - CSS variables in [global.css](src/styles/global.css) define colors, gradients, and background images
  - `:root.theme-dark` selector switches between light/dark overrides
  - Backgrounds use CSS custom properties for dynamic blending and sizing

- **Accent Color System** (Theme-Aware):
  - [src/scripts/accentTheme.ts](src/scripts/accentTheme.ts) - Automatically updates accent colors based on background hue
  - When background generator changes hue → all accents (buttons, borders, highlights) update
  - Maintains proper contrast in both light/dark modes
  - See [ACCENT_SYSTEM.md](ACCENT_SYSTEM.md) for complete documentation
  - Gradient analysis in [GRADIENT_ANALYSIS.md](GRADIENT_ANALYSIS.md)

## Development Workflow

### Commands
```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build for production to ./dist/
npm run preview   # Preview production build locally
npm run astro     # Raw astro CLI access
```

### Adding Work Projects
1. Create markdown file in `src/content/work/` (or nested subdirectories)
2. Include YAML frontmatter matching the schema in content.config.ts
3. File basename becomes the route slug (e.g., `bloom-box.md` → `/work/bloom-box`)
4. Use `publishDate` to control portfolio ordering

## Project Conventions

### Component Patterns
- Components accept `Props` interface defining all inputs
- Use `class:list={}` for conditional CSS classes (Astro syntax)
- Spread custom HTML attributes with `{...attrs}` (see [Hero.astro](src/components/Hero.astro) for titleAttrs/taglineAttrs example)
- Reusable layout wrapper: `<div class="stack gap-X">` for vertical spacing using CSS gap utilities

### Styling Approach
- **No CSS frameworks** - Pure CSS with custom properties
- **Stack utility**: `stack` class + `gap-*` modifiers for flexible spacing (gap-2, gap-4, gap-8, etc.)
- **Color tokens**: Use `--gray-*`, `--accent-light/regular/dark` variables, not hardcoded colors
- **Responsive**: CSS `@container` and `@media` queries; classes like `lg:gap-48` indicate responsive modifiers
- **Typography**: Text size variables like `--text-lg`, `--text-3xl` defined in global.css

### Astro Specifics
- Astro components are `.astro` files with YAML frontmatter for server-side logic
- `getCollection()` + `render()` for content collections with dynamic routes
- Static site generation via `getStaticPaths()` - all work pages pre-built at build time
- No runtime JavaScript by default; add `<script>` tags in component style blocks for interactivity (see BaseLayout's "loaded" class injection)

## Key Files Reference
- [astro.config.mjs](astro.config.mjs) - Empty config (using defaults)
- [package.json](package.json) - Only Astro 5.16.5 dependency
- [src/content.config.ts](src/content.config.ts) - Content schema definition
- [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) - Main layout with theme variables
- [src/pages/work/[...slug].astro](src/pages/work/[...slug].astro) - Dynamic routing pattern
- [src/components/Hero.astro](src/components/Hero.astro) - Example of attribute forwarding pattern
- [global.css](src/styles/global.css) - All design tokens and theming logic
- [src/scripts/accentTheme.ts](src/scripts/accentTheme.ts) - Theme-aware accent color system
- [src/scripts/backgroundState.ts](src/scripts/backgroundState.ts) - Background generator state management

## Critical Patterns to Preserve
1. **Content-first**: Work items are markdown files, not code—avoid changing schema without migration planning
2. **Static generation**: All pages pre-rendered—no server-side requests or dynamic API calls
3. **CSS tokens**: Always use `var(--token-name)`, never hardcoded colors or sizes
6. **Dynamic accents**: Accent colors auto-update via `accentTheme.ts` when background changes—don't hardcode accent colors
7. **Gradient system**: Use `--gradient-stop-1/2/3` for theme-aware gradients (see GRADIENT_ANALYSIS.md for hardcoded exceptions)
4. **Responsive spacing**: Maintain gap utilities and container queries for flexibility
5. **Theme support**: Light/dark modes use CSS variable overrides, not separate stylesheets

## No External Dependencies
- Project intentionally minimal: only Astro as a dependency
- No UI libraries, no JavaScript frameworks, no build tools beyond Astro
- Avoid adding npm packages without strong justification
