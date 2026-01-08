/**
 * Project Registry System
 * 
 * Typed registry for homepage project cards with optional custom visuals.
 * Replaces markdown-driven homepage rendering while preserving project detail pages.
 */

export interface ProjectMetadata {
  id: string;              // Stable identifier (used for routing to /work/{id})
  title: string;
  description: string;
  tags: string[];
  publishDate: Date;
  img?: string;           // Optional fallback image
  img_alt?: string;
}

export interface ProjectCard extends ProjectMetadata {
  visualComponent?: string; // Optional custom visual component name
  colorTheme: 'cyan' | 'purple' | 'orange' | 'white';
}

/**
 * Central project registry - single source of truth for homepage cards
 * 
 * To add a new project:
 * 1. Add entry here with metadata
 * 2. Optionally create custom visual component in src/components/visuals/
 * 3. Ensure matching project detail page exists in src/content/work/
 */
export const projectRegistry: ProjectCard[] = [
  {
    id: 'paper-pigeon',
    title: 'Paper Pigeon',
    description: 'A modern messaging platform with real-time chat, file sharing, and collaborative workspaces. Built with TypeScript, React, and WebSocket technology.',
    tags: ['Dev', 'Frontend', 'Real-time'],
    publishDate: new Date('2023-11-01'),
    colorTheme: 'cyan',
    visualComponent: 'PaperPigeonVisual' // Custom component
  },
  {
    id: 'bloom-box',
    title: 'Bloom Box',
    description: 'We paired with a cutting-edge music API and a team of horticulturalists to build AI-generated playlists that maximize houseplant health.',
    tags: ['Dev', 'Branding', 'Backend'],
    publishDate: new Date('2019-12-01'),
    colorTheme: 'purple'
    // No visualComponent - will use fallback
  },
  {
    id: 'markdown-mystery-tour',
    title: 'Markdown Mystery Tour',
    description: 'An interactive guide through the world of markdown, featuring live editing, syntax highlighting, and collaborative storytelling.',
    tags: ['Frontend', 'Education', 'Interactive'],
    publishDate: new Date('2022-05-15'),
    colorTheme: 'orange'
    // No visualComponent - will use fallback
  },
  {
    id: 'linear-algebra-visualizer',
    title: 'Linear Algebra Visualizer',
    description: 'Mathematical background generation system using matrix determinants and linear transformations to create abstract geometric patterns.',
    tags: ['Math', 'Visualization', 'Generative'],
    publishDate: new Date('2024-03-20'),
    colorTheme: 'white',
    visualComponent: 'LinearAlgebraVisual' // Custom component
  }
];

/**
 * Get projects sorted by publish date (newest first) - matches existing behavior
 */
export function getRegistryProjects(): ProjectCard[] {
  return [...projectRegistry].sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
}

/**
 * Get project by ID for detail page routing
 */
export function getProjectById(id: string): ProjectCard | undefined {
  return projectRegistry.find(project => project.id === id);
}