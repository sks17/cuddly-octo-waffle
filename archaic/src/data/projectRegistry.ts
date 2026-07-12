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
  cardHeight?: string;      // Optional card height (e.g., '50vh', '60vh', '70vh')
  cardMinHeight?: string;   // Optional minimum height (e.g., '400px', '450px', '500px')
  projectTag?: string;      // Optional project tag label (e.g., 'SinghDevs', 'SinghLearns')
  excludeFromWorkPage?: boolean; // Optional flag to hide from work page
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
    description: '3D force-directed graph mapping the University of Washington Allen School\'s research ecosystem. Features RAG pipelines for paper Q&A, resume matching against researcher profiles, and VR rendering paths to make connections between labs, researchers, and papers visible and intuitive.',
    tags: ['React 19', 'TypeScript', 'Three.js', 'AWS Bedrock', 'DynamoDB', 'Flask', 'Vite', 'A-Frame VR'],
    publishDate: new Date('2025-11-15'),
    colorTheme: 'white',
    visualComponent: 'PaperPigeonVisual' // Custom component
  },
  {
    id: 'walls',
    title: 'WALLS',
    description: 'A comprehensive mental health assessment platform using PyTorch for stress, anxiety, and depression screening with interactive dashboards and local demo mode.',
    tags: ['Python', 'Flask', 'PyTorch', 'Chart.js', 'Three.js', 'Firebase', 'Machine Learning'],
    publishDate: new Date('2025-01-10'),
    img: '/assets/WallsDemo2.gif',
    img_alt: 'WALLS mental health platform demo showing assessment flow and dashboard',
    colorTheme: 'purple',
    visualComponent: 'WallsVisual',
    projectTag: 'SinghDevs'
  },
  {
    id: 'quantitative-pairs-trading',
    title: 'Quantitative Pairs Trading',
    description: 'A quantitative research pipeline using pairs trading strategies. Downloads historical stock data, identifies correlated pairs, generates mean-reversion signals using the Ornstein-Uhlenbeck process, and produces 25+ research-grade visualizations validating trading assumptions.',
    tags: ['Python', 'Quantitative Finance', 'Data Science', 'Statistical Analysis', 'Machine Learning'],
    publishDate: new Date('2024-06-15'),
    colorTheme: 'cyan',
    visualComponent: 'QuantitativeTradingVisual',
    projectTag: 'SinghLearns'
  },
  {
    id: 'data-science-projects',
    title: 'High School Data Science',
    description: 'Data science projects I made for assignments in high school using Python, Pandas, GeoPandas, NumPy, Scikit-learn, Matplotlib, and Seaborn.',
    tags: ['Python', 'Data Science', 'Pandas', 'GeoPandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Seaborn'],
    publishDate: new Date('2024-05-01'),
    colorTheme: 'cyan',
    visualComponent: 'DataScienceVisual',
    projectTag: 'SinghParlays'
  },
  {
    id: 'linear-algebra-visualizer',
    title: 'Background Generation System',
    description: 'The entire background of this website is generated using brute-force linear algebra. The system searches for matrices with maximized determinants and renders abstract geometric patterns. Click to customize!',
    tags: ['Math', 'Visualization', 'Generative', 'Linear Algebra'],
    publishDate: new Date('2024-03-20'),
    colorTheme: 'white',
    visualComponent: 'LinearAlgebraVisual', // Custom component
    projectTag: 'SinghParlays',
    excludeFromWorkPage: true // This project is the background system, not a standalone project
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