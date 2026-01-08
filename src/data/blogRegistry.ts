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
    id: 'building-with-astro',
    title: 'Building a Modern Portfolio with Astro and TypeScript',
    description: 'An in-depth look at creating a performance-focused portfolio website using Astro\'s static site generation and TypeScript\'s type safety.',
    author: 'Saksham Singh',
    publishDate: new Date('2024-12-15'),
    readTime: '8 min read',
    tags: ['Astro', 'TypeScript', 'Performance'],
    featuredImage: '/assets/stock-1.jpg',
    featuredImageAlt: 'Code editor showing Astro and TypeScript files',
    category: 'tech',
    isHighlighted: true
  },
  {
    id: 'design-systems-thinking',
    title: 'Design Systems: Beyond Components and Tokens',
    description: 'Exploring how design systems shape not just visual consistency, but the entire product development process and team collaboration.',
    author: 'Saksham Singh',
    publishDate: new Date('2024-11-28'),
    readTime: '6 min read',
    tags: ['Design Systems', 'Process', 'Collaboration'],
    featuredImage: '/assets/stock-2.jpg',
    featuredImageAlt: 'Abstract representation of interconnected design elements',
    category: 'design'
  },
  {
    id: 'mathematics-in-motion',
    title: 'Mathematics in Motion: Generative Art with Linear Algebra',
    description: 'How mathematical concepts like matrix transformations and determinants create beautiful, dynamic visual patterns in generative art.',
    author: 'Saksham Singh',
    publishDate: new Date('2024-10-22'),
    readTime: '12 min read',
    tags: ['Mathematics', 'Generative Art', 'Linear Algebra'],
    featuredImage: '/assets/stock-3.jpg',
    featuredImageAlt: 'Mathematical equations overlaying geometric art patterns',
    category: 'tech'
  },
  {
    id: 'future-of-interfaces',
    title: 'The Future of Human-Computer Interfaces',
    description: 'Thoughts on where digital interfaces are heading, from voice and gesture to brain-computer interactions and spatial computing.',
    author: 'Saksham Singh',
    publishDate: new Date('2024-09-14'),
    readTime: '5 min read',
    tags: ['Future Tech', 'UX', 'Interfaces'],
    featuredImage: '/assets/stock-4.jpg',
    featuredImageAlt: 'Futuristic interface concepts with holographic elements',
    category: 'thoughts'
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