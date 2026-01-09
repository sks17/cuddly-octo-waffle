/**
 * Background State Management
 * 
 * Single source of truth for background configuration.
 * Manages the state of the background generator popup inputs
 * and coordinates background generation API calls.
 * 
 * Data Flow:
 * 1. Popup UI changes → updateState()
 * 2. State change → generateBackground()
 * 3. API call → Server generates wallpaper OR render spec
 * 4. Response → Server PNG OR Client-side rendering
 * 5. DOM update → Background visible
 * 6. Accent theme updates based on hue
 */

import { setAccentHue } from './accentTheme';
import { 
  getCachedBackground, 
  setCachedBackground,
  getCacheStats,
  clearCache,
  listCachedBackgrounds 
} from './backgroundCache';
import { generateDistributedBackground } from './backgroundRenderer';

// Use environment variable for API URL - falls back to production if not set
const API_BASE = import.meta.env.PUBLIC_API_URL || 'https://mathematical-wallpaper-api.fly.dev/api';

// Enable distributed rendering (can be toggled for testing)
const USE_DISTRIBUTED_RENDERING = import.meta.env.PUBLIC_USE_DISTRIBUTED_RENDERING === 'true' || false;

const STORAGE_KEY = 'background-theme-config';

// Background configuration state (single source of truth)
export interface BackgroundConfig {
  hue: string;
  pattern: 'mixed' | 'uniform' | 'gradient';
  use_determinant: boolean;
  use_max: boolean;
  feathered: boolean;
  blur_sigma: number;
  vignette_strength: number;
  gap_cells: number;
  cell_size: number;
  matrix_size: number;
  normalizer: number;
  brightness_low: number;
  brightness_high: number;
}

/**
 * DEFAULT_CONFIG: Single source of truth for default values
 * 
 * IMPORTANT: This is the ONLY place where default values should be defined.
 * All other parts of the system (UI, reset functions, initialization) should
 * reference this configuration to ensure consistency.
 * 
 * Default hue is 'purple' to maintain the original site theme.
 */
export const DEFAULT_CONFIG: BackgroundConfig = {
  hue: 'purple',
  pattern: 'mixed',
  use_determinant: true,
  use_max: true,
  feathered: true,
  blur_sigma: 1.5,
  vignette_strength: 0.3,
  gap_cells: 1,
  cell_size: 12,
  matrix_size: 4,
  normalizer: 0.5,
  brightness_low: 0,
  brightness_high: 1
};

/**
 * Load configuration from localStorage or use defaults
 */
function loadPersistedConfig(): BackgroundConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle any new properties
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load persisted config:', error);
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Save configuration to localStorage
 */
function saveConfig(config: BackgroundConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('Failed to save config:', error);
  }
}

// Current state (initialized with persisted values or defaults)
let currentState: BackgroundConfig = loadPersistedConfig();

// Loading state
let isGenerating = false;

// Background element reference
let backgroundElement: HTMLDivElement | null = null;

/**
 * Get current state (read-only copy)
 */
export function getState(): Readonly<BackgroundConfig> {
  return { ...currentState };
}

/**
 * Update state with partial config and persist to localStorage
 */
export function updateState(partialConfig: Partial<BackgroundConfig>): void {
  console.log('📝 State update requested:', partialConfig);
  currentState = { ...currentState, ...partialConfig };
  saveConfig(currentState);
  console.log('✅ New state (persisted):', currentState);
}

/**
 * Reset state to defaults and persist
 */
export function resetState(): void {
  console.log('🔄 Resetting state to defaults');
  currentState = { ...DEFAULT_CONFIG };
  saveConfig(currentState);
  console.log('✅ State reset (persisted):', currentState);
}

/**
 * Initialize accent theme with current hue on page load
 * This ensures the accent colors match the persisted background immediately
 */
export function initializeAccentTheme(): void {
  console.log('🎨 Initializing accent theme with hue:', currentState.hue);
  console.log('🎨 Current document classes:', document.documentElement.classList.toString());
  // Note: Don't call setAccentHue immediately to allow intro animation to play first
  // setAccentHue(currentState.hue);
}

/**
 * Check if currently generating
 */
export function isLoading(): boolean {
  return isGenerating;
}

/**
 * Generate background from current state with caching
 * Supports both traditional server PNG generation and distributed rendering
 */
export async function generateBackground(): Promise<void> {
  if (isGenerating) {
    console.warn('⚠️ Generation already in progress, skipping');
    return;
  }

  // Check cache first
  const cachedUrl = getCachedBackground(currentState);
  if (cachedUrl) {
    console.log('🗄️ Using cached background');
    updateBackgroundImage(cachedUrl);
    setAccentHue(currentState.hue);
    return;
  }

  isGenerating = true;
  console.log(`🎨 Starting background generation (${USE_DISTRIBUTED_RENDERING ? 'distributed' : 'traditional'}) with state:`, currentState);
  console.log('🌐 API_BASE configured as:', API_BASE);

  try {
    // Build API request payload
    const payload = {
      canvas_width: 7200, // Match ImgMap.jpg dimensions
      canvas_height: 4800,
      cell_size: currentState.cell_size,
      low: currentState.brightness_low,
      high: currentState.brightness_high,
      normalizer: currentState.normalizer,
      hue: currentState.hue,
      use_determinant: currentState.use_determinant,
      use_max: currentState.use_max,
      max_matrix_size: currentState.matrix_size,
      pattern: currentState.pattern,
      blur_sigma: currentState.blur_sigma,
      vignette_strength: currentState.vignette_strength,
      gap_cells: currentState.gap_cells,
      feather_strength: currentState.feathered ? 0.1 : 0.0,
      filename: `hero_${Date.now()}`
    };

    let imageBlob: Blob;

    if (USE_DISTRIBUTED_RENDERING) {
      // Use distributed rendering (render spec + client-side canvas)
      console.log('📡 Using distributed rendering');
      imageBlob = await generateDistributedBackground(payload);
    } else {
      // Traditional server-side PNG generation
      console.log('📡 Sending traditional API request to:', `${API_BASE}/generate`);
      console.log('📡 Request payload:', payload);

      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${response.statusText} - ${errorText}`);
      }

      // Ensure response is actually an image
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        throw new Error('API returned non-image response');
      }

      imageBlob = await response.blob();
    }

    const imageUrl = URL.createObjectURL(imageBlob);
    
    console.log('✅ Background generated successfully');
    
    // Cache the generated background
    setCachedBackground(currentState, imageUrl);
    
    updateBackgroundImage(imageUrl);
    
    // Update accent theme to match selected hue
    setAccentHue(currentState.hue);
    
  } catch (error) {
    console.error('❌ Background generation failed:', error);
    
    // Differentiate error types for better debugging
    if (error instanceof TypeError) {
      console.error('❌ Network error - check if API server is accessible');
    } else if (error.message?.includes('API Error')) {
      console.error('❌ API returned an error response');
    } else {
      console.error('❌ Unknown error during background generation');
    }
    
    throw error;
  } finally {
    isGenerating = false;
  }
}

/**
 * Update the background image in the DOM
 */
function updateBackgroundImage(imageUrl: string): void {
  console.log('🖼️ Updating background image:', imageUrl);

  if (!backgroundElement) {
    console.error('❌ Background element not found');
    return;
  }

  // Preload the new image to prevent flicker
  const img = new Image();
  img.onload = () => {
    // Enable GPU acceleration and optimize transition
    backgroundElement!.style.willChange = 'opacity';
    backgroundElement!.style.transition = 'opacity 0.5s ease-in-out';
    
    // Fade out current background
    backgroundElement!.style.opacity = '0';
    
    // After fade out, update image and fade in
    setTimeout(() => {
      backgroundElement!.style.backgroundImage = `url('${imageUrl}')`;
      
      // Use requestAnimationFrame for smooth animation
      requestAnimationFrame(() => {
        backgroundElement!.style.opacity = '1';
        
        // Clean up GPU hints after animation
        setTimeout(() => {
          backgroundElement!.style.willChange = 'auto';
        }, 500);
      });
    }, 500); // Reduced timeout for faster transitions
  };
  
  img.src = imageUrl;
}

/**
 * Register the background element (called from heroBackground.ts)
 */
export function registerBackgroundElement(element: HTMLDivElement): void {
  console.log('📌 Registering background element');
  backgroundElement = element;
}

/**
 * Cache debugging utilities (exposed for console debugging)
 */
export const cache = {
  stats: getCacheStats,
  clear: clearCache,
  list: listCachedBackgrounds
};

/**
 * Initialize with default background
 */
export async function initializeBackground(): Promise<void> {
  console.log('🚀 Initializing background with default state');
  await generateBackground();
}
