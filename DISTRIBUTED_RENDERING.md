# Distributed Rendering Architecture

## Overview

This document describes the distributed rendering system for the mathematical wallpaper generator, where determinant computation remains on the backend while pixel rendering moves to the frontend.

## Render Spec Contract

### Backend Responsibilities
- **Matrix Generation**: Create deterministic matrix placements using existing algorithms
- **Determinant Calculation**: Compute all determinant values and brightness factors
- **Layout Logic**: Determine exact pixel positions for each matrix block
- **Parameter Validation**: Ensure all visual parameters are within valid ranges
- **Render Spec Generation**: Output structured data describing the complete visual layout

### Frontend Responsibilities  
- **Pixel Rendering**: Convert render spec to actual pixels using HTML5 Canvas
- **Visual Effects**: Apply blur, vignette, and feathering using canvas filters or shader math
- **Memory Management**: Handle large canvas buffers and cleanup
- **Progressive Rendering**: Optionally stream or chunk rendering for better UX

## Render Spec Format

```typescript
interface RenderSpec {
  // Canvas configuration
  canvas: {
    width: number;
    height: number;
    cell_size: number;
  };
  
  // Visual parameters  
  visual: {
    hue: string;
    normalizer: number;
    low: number;
    high: number;
    blur_sigma: number;
    vignette_strength: number;
    feather_strength: number;
    use_determinant: boolean;
    use_max: boolean;
  };
  
  // Determinant range for brightness scaling
  determinant_range: {
    min: number;
    max: number;
  };
  
  // Matrix block placements
  blocks: Array<{
    x: number;           // Pixel position
    y: number;           // Pixel position  
    width: number;       // Block width in pixels
    height: number;      // Block height in pixels
    matrix: number[][];  // Matrix values for color mapping
    determinant: number; // Computed determinant value
    size: number;        // Matrix dimension (n×n)
  }>;
}
```

## Performance Benefits

### Memory Reduction
- **Backend**: Eliminates 6MB+ canvas arrays, only stores placement metadata (~50KB typical)
- **Frontend**: Controls memory lifecycle, can render progressively or in chunks
- **Network**: Render specs are ~100x smaller than PNG files

### Computational Distribution
- **Backend**: Focuses on mathematical complexity (O(n³) determinants)
- **Frontend**: Handles pixel operations using GPU-accelerated canvas rendering
- **Caching**: Render specs can be cached more efficiently than large images

### Future Extensibility  
- **Streaming**: Large canvases can be rendered in tiles
- **WebGL**: Complex effects can use fragment shaders
- **Interactive**: Parameters can be tweaked without backend roundtrips
- **WebSocket**: Real-time parameter adjustment becomes feasible

## Client-Side Rendering Details

### Basic Rendering Pipeline
1. **Parse Render Spec**: Validate and extract parameters
2. **Create Canvas**: Set dimensions and configure rendering context
3. **Render Blocks**: For each matrix block:
   - Calculate colors using determinant and brightness factors
   - Fill rectangular regions using canvas `fillRect` operations
4. **Apply Effects**: Use canvas filters or manual pixel manipulation for:
   - Gaussian blur approximation
   - Radial vignette gradients
   - Edge feathering

### Effect Approximations
- **Blur**: Use canvas `filter: blur(Xpx)` for performance, or manual convolution for precision
- **Vignette**: Radial gradient overlay with multiply blend mode
- **Feathering**: Per-block edge gradients using `createRadialGradient`

## Backwards Compatibility

The existing `/api/generate` PNG endpoint remains unchanged. The render spec mode is additive:

```javascript
// Existing PNG mode (unchanged)
POST /api/generate
{ canvas_width: 1920, hue: "purple", ... }
→ Returns: image/png binary

// New render spec mode  
POST /api/generate  
{ canvas_width: 1920, hue: "purple", output_format: "spec", ... }
→ Returns: application/json render spec
```

## Implementation Guarantees

### Mathematical Preservation
- All determinant calculations use identical NumPy algorithms
- Matrix placement logic remains unchanged
- Random seed behavior is preserved
- Visual output is pixel-perfect equivalent

### Modularity
- Backend changes are isolated to output formatting
- Frontend rendering is self-contained
- No cross-layer mathematical dependencies
- Easy rollback to PNG-only mode if needed

This architecture enables better performance scaling while maintaining the mathematical integrity and visual quality of the determinant-based wallpaper generation system.