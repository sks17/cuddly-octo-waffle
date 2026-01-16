/**
 * Blog Registry System
 * 
 * Typed registry for blog entries with editorial-style metadata.
 * Provides structured data for NYT-style blog layout.
 */

export interface BlogMetadata {
  id: string;              // Stable identifier (used for routing to /blogs/{id})
  title: string;
  description: string;     // Short editorial description
  author?: string;         // Optional author attribution
  publishDate: Date;
  readTime?: string;       // Optional estimated read time
  tags?: string[];         // Optional category tags
  featuredImage: string;   // Prominent image for editorial layout
  featuredImageAlt: string; // Alt text for featured image
  isHighlighted?: boolean; // Optional flag for featured content
}

export interface BlogEntry extends BlogMetadata {
  category?: 'tech' | 'design' | 'thoughts' | 'updates'; // Optional categorization
  categoryDisplay?: string; // Optional custom category display text
}

/**
 * Central blog registry - single source of truth for blog entries
 * 
 * To add a new blog:
 * 1. Add entry here with metadata
 * 2. Create blog detail page in src/content/blogs/ or src/pages/blogs/
 * 3. Add featured image to public/assets/blogs/
 */
export const blogRegistry: BlogEntry[] = [
  {
    id: 'mathematics-in-motion',
    title: 'Mathematics in Motion: Generative Art with Linear Algebra',
    description: 'Coming soon!',
    author: 'Saksham Singh',
    publishDate: new Date('2026-01-01'),
    readTime: '8 min read',
    tags: ['Mathematics', 'Generative Art', 'Linear Algebra'],
    featuredImage: '/assets/backgrounds/bg-main-dark-1440w.jpg',
    featuredImageAlt: 'Colorful matrix visualization with geometric patterns',
    category: 'tech',
    categoryDisplay: 'MATH / EXPLORATION',
    isHighlighted: true
  },
  {
    id: 'ai-resource-scarcity',
    title: 'AI Usage limiting in Resource-Scarce environments',
    description: 'Coming soon!',
    author: 'Saksham Singh',
    publishDate: new Date('2026-01-01'),
    readTime: '8 min read',
    tags: ['AI Safety', 'Resource Management'],
    featuredImage: '/assets/stock-2.jpg',
    featuredImageAlt: 'AI and resource management visualization',
    category: 'tech',
    categoryDisplay: 'AI SAFETY'
  }
];

/**
 * Get blogs sorted by publish date (newest first)
 */
export function getRegistryBlogs(): BlogEntry[] {
  return [...blogRegistry].sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
}

/**
 * Get highlighted/featured blogs
 */
export function getFeaturedBlogs(): BlogEntry[] {
  return getRegistryBlogs().filter(blog => blog.isHighlighted);
}

/**
 * Get blog by ID for detail page routing
 */
export function getBlogById(id: string): BlogEntry | undefined {
  return blogRegistry.find(blog => blog.id === id);
}

/**
 * Get blogs by category
 */
export function getBlogsByCategory(category: BlogEntry['category']): BlogEntry[] {
  return getRegistryBlogs().filter(blog => blog.category === category);
}