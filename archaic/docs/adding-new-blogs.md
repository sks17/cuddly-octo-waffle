# Adding New Blogs: Complete Guide

This guide walks you through adding a new blog post to your website, from the NYT-style blog listing to individual blog pages.

## Overview

Blog posts appear in two places:
1. **Blogs & Misc Page** - Editorial-style blog listing with prominent images
2. **Blog Detail Page** - Individual blog post with full content

## Step-by-Step Process

### 1. Add Blog to Registry

**File**: [`src/data/blogRegistry.ts`](src/data/blogRegistry.ts)

Add your new blog entry to the `blogRegistry` array:

```typescript
{
  id: 'your-blog-slug',
  title: 'Your Blog Post Title',
  description: 'A compelling editorial description that appears in the blog listing.',
  author: 'Your Name', // Optional
  publishDate: new Date('2024-01-15'),
  readTime: '8 min read', // Optional estimated reading time
  tags: ['Tech', 'Design', 'Tutorial'], // Optional categorization tags
  featuredImage: '/assets/your-blog-image.jpg',
  featuredImageAlt: 'Description of your blog image',
  category: 'tech', // 'tech' | 'design' | 'thoughts' | 'updates'
  isHighlighted: false // Optional: true for featured content
}
```

**Important Notes:**
- `id`: Must be unique and URL-friendly (used for routing to `/blogs/your-blog-slug`)
- `publishDate`: Determines order on blogs page (newest first)
- `featuredImage`: Prominent image displayed in the editorial layout
- `category`: Affects styling and organization
- `isHighlighted`: Optional flag for featuring specific posts

### 2. Add Blog Featured Image

**Directory**: `public/assets/`

Add the featured image for your blog post:
- **Recommended size**: 800x500px minimum
- **Format**: JPG or PNG
- **Location**: `public/assets/your-blog-image.jpg`
- **Alt text**: Include descriptive alt text in the registry

**Image Guidelines:**
- Use high-quality, relevant images
- Ensure images work well with the dark theme
- Consider aspect ratio consistency across blog posts
- Optimize for web performance

### 3. Create Blog Detail Content

The blog detail page is automatically generated from your registry entry. The current implementation includes:

- **Header section** with category, author, and read time
- **Featured image** prominently displayed
- **Introduction** using your description
- **Placeholder content** for the full article

**To add real blog content:**

You can either:

**Option A: Extend the current system**
Modify [`src/pages/blogs/[slug].astro`](src/pages/blogs/[slug].astro) to pull from markdown files:

1. Create `src/content/blogs/your-blog-slug.md`:
```markdown
---
title: Your Blog Post Title
description: Editorial description
publishDate: 2024-01-15
author: Your Name
category: tech
tags: [Tech, Tutorial]
featuredImage: /assets/your-blog-image.jpg
---

# Your Blog Post Title

Your full blog content goes here with markdown support:

## Section Headers

Regular paragraphs with **bold** and *italic* text.

### Code Examples

```javascript
function example() {
  return "This is a code block";
}
```

### Lists and More

- Bullet points
- More items
- Additional content

> Blockquotes for emphasis

[Links to resources](https://example.com)
```

**Option B: Use rich content in registry**
Add a `content` field to your blog registry entry with HTML or markdown.

### 4. Category System

**Available Categories:**
- **`tech`**: Technical posts, tutorials, development content
- **`design`**: Design systems, UX/UI, visual design
- **`thoughts`**: Opinion pieces, industry insights, personal reflections  
- **`updates`**: Project updates, announcements, news

Categories affect the visual styling and can be used for filtering or organization.

### 5. Featured Blog System

Set `isHighlighted: true` in your registry entry to feature a blog post. Featured posts can be:
- Displayed prominently on the homepage
- Highlighted in the blog listing
- Used in promotional content

Access featured blogs with:
```typescript
import { getFeaturedBlogs } from '../data/blogRegistry.ts';
const featured = getFeaturedBlogs();
```

### 6. Verification Checklist

After adding your blog post, verify:

- [ ] Blog appears in `/blogs` page in correct order
- [ ] Featured image displays properly and loads quickly
- [ ] Blog metadata (author, read time, category) shows correctly
- [ ] Blog detail page loads at `/blogs/your-blog-slug`
- [ ] Blog content renders properly with all formatting
- [ ] Links and navigation work correctly
- [ ] Responsive design works on mobile

## Registry Configuration Options

### Editorial Styling

The blog listing uses a New York Times-inspired layout:
- **Large featured images** for visual impact
- **Clear typography hierarchy** for readability
- **Metadata display** showing author, date, and read time
- **Category labels** for content organization
- **Hover effects** for professional interaction

### Blog Metadata

**Required Fields:**
- `id`: URL slug and unique identifier
- `title`: Blog post headline
- `description`: Editorial description for listing
- `publishDate`: Publication date for sorting
- `featuredImage`: Path to image file
- `featuredImageAlt`: Accessibility description

**Optional Fields:**
- `author`: Author attribution
- `readTime`: Estimated reading duration
- `tags`: Topical categorization
- `category`: Content type classification
- `isHighlighted`: Featured content flag

### Blog Ordering

Blogs are automatically sorted by `publishDate` (newest first). To reorder:
1. Update the `publishDate` of posts you want to feature
2. Use `isHighlighted: true` for special promotion
3. Consider category-based organization for large numbers of posts

## Extending the System

### Adding New Categories

To add new blog categories:

1. **Update the type definition** in [`src/data/blogRegistry.ts`](src/data/blogRegistry.ts):
```typescript
category?: 'tech' | 'design' | 'thoughts' | 'updates' | 'your-new-category';
```

2. **Add category styling** in [`src/pages/blogs.astro`](src/pages/blogs.astro) if needed

3. **Update the category system** to handle the new type

### Adding Rich Content Support

To support full markdown content:

1. **Create content collection** in [`src/content/config.ts`](src/content/config.ts)
2. **Modify blog detail pages** to render markdown
3. **Update registry** to reference markdown files
4. **Add content validation** and type safety

### Adding Blog Search/Filtering

Implement filtering by:
```typescript
// Filter by category
const techBlogs = getBlogsByCategory('tech');

// Filter by tags
const filteredBlogs = getRegistryBlogs().filter(blog => 
  blog.tags?.includes('Tutorial')
);

// Search by content
const searchResults = getRegistryBlogs().filter(blog =>
  blog.title.toLowerCase().includes(query.toLowerCase()) ||
  blog.description.toLowerCase().includes(query.toLowerCase())
);
```

## Best Practices

1. **Write compelling descriptions**: The description appears in the listing and should entice readers
2. **Choose relevant images**: Featured images are prominent and should relate to your content
3. **Use consistent categories**: Stick to the established category system for organization
4. **Estimate read times accurately**: Help readers understand the time commitment
5. **Tag thoughtfully**: Use tags that readers might search for or filter by
6. **Update regularly**: Fresh content keeps the blog section active and engaging
7. **Optimize images**: Compress featured images for fast loading
8. **Write for your audience**: Match tone and technical level to your portfolio visitors

## Troubleshooting

**Blog doesn't appear in listing:**
- Check that the registry entry syntax is valid
- Verify the `publishDate` format is correct
- Ensure no errors in `blogRegistry.ts`

**Featured image doesn't load:**
- Verify the image path starts with `/assets/`
- Check that the file exists in `public/assets/`
- Ensure correct file extension and naming

**Blog detail page shows 404:**
- Confirm the blog ID matches the URL slug exactly
- Check that the blog exists in the registry
- Verify no typos in the navigation link

**Styling looks wrong:**
- Check browser console for CSS errors
- Verify the category is one of the supported types
- Ensure featured image has proper aspect ratio

## Example Implementation

See the existing blogs in [`src/data/blogRegistry.ts`](src/data/blogRegistry.ts) for complete examples of:
- Technical blog posts with code content
- Design-focused posts with visual emphasis
- Thought pieces with editorial styling
- Different categories and metadata usage

## Future Enhancements

Consider implementing:
- **Content Management**: Integration with a CMS for easier editing
- **Comments System**: Reader engagement and feedback
- **Social Sharing**: Easy sharing on social platforms
- **Related Posts**: Algorithmic or manual content suggestions
- **Newsletter Integration**: Email subscriptions and notifications
- **Analytics**: Track popular content and reader behavior