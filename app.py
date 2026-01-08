"""
Production Flask API for Mathematical Wallpaper Generation
Refactored from beginning.py for Fly.io deployment

Changes made:
- Removed all filesystem writes - images generated in memory using BytesIO
- Removed app.run() calls and standalone execution
- Exposed Flask app object for WSGI deployment
- Added CORS for cross-origin requests from sakshamsingh.dev
- Converted to pure request/response model
- Production-ready error handling and logging
"""

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from PIL import Image
from itertools import product
import numpy as np
from scipy.ndimage import gaussian_filter
import io
import logging
import os

# Configure logging for production
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS for production deployment
CORS(app, 
     origins=[
         "https://sakshamsingh.dev",
         "https://www.sakshamsingh.dev", 
         "https://far-flare.vercel.app",
         "http://localhost:4321"  # Local Astro dev server
     ], 
     methods=["GET", "POST", "OPTIONS"], 
     allow_headers=["Content-Type"],
     supports_credentials=False)

# Global cache for matrix computations (kept in memory)
matrix_cache = {}

# ================================================================
#  CONSTANTS & CONFIGURATION
# ================================================================

# Tile size for memory-efficient processing (pixels)
# Smaller tiles use less memory but increase processing time
TILE_SIZE = 512  # 512x512 tiles for balanced memory/performance on Fly.io

# Color palettes for different themes
COLOR_PALETTES = {
    "gray": [(64, 64, 64), (192, 192, 192)],
    "red": [(128, 0, 0), (255, 128, 128)],
    "orange": [(255, 140, 0), (255, 218, 185)],
    "yellow": [(255, 215, 0), (255, 255, 224)],
    "green": [(0, 128, 0), (144, 238, 144)],
    "blue": [(0, 100, 200), (173, 216, 230)],
    "purple": [(128, 0, 128), (221, 160, 221)],
    "pink": [(255, 20, 147), (255, 182, 193)],
    "teal": [(0, 128, 128), (175, 238, 238)]
}

# ================================================================
#  MATHEMATICAL FUNCTIONS (UNCHANGED)
# ================================================================

def calculate_determinant(M):
    """
    Compute det(M) using NumPy's optimized LU-decomposition.
    Returned as an int when entries are integers.
    """
    A = np.array(M, dtype=float)
    return int(round(np.linalg.det(A)))

def calculate_max_determinant(n=1, low=0, high=1):
    """Brute force search for max/min determinant matrices."""
    max_det = -float("inf")
    min_det = float("inf")
    max_A = None
    min_A = None
    vals = [low, high]

    for bits in product(vals, repeat=n*n):
        A = np.array(bits, dtype=float).reshape(n, n)
        d = int(round(np.linalg.det(A)))
        if d > max_det:
            max_det = d
            max_A = A.copy().tolist()
        if d < min_det:
            min_det = d
            min_A = A.copy().tolist()

    return (max_det, min_det), (max_A, min_A)

def choose_matrix_variant(n, low, high, use_max, use_kronecker=False, use_top_k=False, cache=None):
    """Choose matrix variant with caching."""
    if cache is None:
        cache = matrix_cache

    key = (n, low, high)
    if key not in cache:
        cache[key] = calculate_max_determinant(n, low, high)

    ((max_det, min_det), (max_A, min_A)) = cache[key]
    A = max_A if use_max else min_A
    det = max_det if use_max else min_det

    return A, det

def feather_edges(block, feather_strength):
    """Apply feathering to block edges for smooth transitions."""
    if feather_strength <= 0:
        return block

    H, W, _ = block.shape
    if H == 0 or W == 0:
        return block

    yy, xx = np.mgrid[:H, :W]
    edge_x = np.minimum(xx, W - 1 - xx)
    edge_y = np.minimum(yy, H - 1 - yy)
    dist = np.minimum(edge_x, edge_y)

    max_feather = min(H, W) * feather_strength * 0.5
    if max_feather <= 0:
        return block

    mask = np.clip(dist / max_feather, 0, 1)
    mask = 0.5 * (1 - np.cos(np.pi * mask))
    mask = mask[..., None]

    bg = np.array([128, 128, 128], dtype=float)
    faded = block.astype(float) * mask + bg * (1 - mask)
    return faded.astype(np.uint8)

def color_from_integer(n=0, low=0, high=1, normalizer=0.0, hue="gray"):
    """Convert integer to RGB color based on hue."""
    if n < low or n > high:
        raise ValueError(f"Value n={n} is not within range [{low}, {high}].")
    
    if low == 0 and high == 1:
        base_gray = 255 if n == 0 else 0
    else:
        rng = high - low
        if rng == 0:
            base_gray = 255
        else:
            t = (n - low) / rng
            base_gray = int(255 * (1 - t))
    
    base_gray = int((1 - normalizer) * base_gray + normalizer * 128)
    base_gray = max(0, min(255, base_gray))

    hues = {
        "gray":   (base_gray, base_gray, base_gray),
        "red":    (255, base_gray, base_gray),
        "orange": (255, 165 * base_gray // 255, base_gray),
        "yellow": (255, 255, base_gray),
        "green":  (base_gray, 255, base_gray),
        "blue":   (base_gray, base_gray, 255),
        "purple": (150 * base_gray // 255, 0, 255),
        "pink":   (255, base_gray, 200),
        "teal":   (0, 255, 200),
    }
    
    hue_lower = hue.lower()
    if hue_lower not in hues:
        raise ValueError(f"Unknown hue '{hue}'. Options: {', '.join(hues.keys())}")
    
    return list(hues[hue_lower])

def _matrix_to_color_block(A, det, low, high, cell_size, normalizer, hue,
                          use_determinant, use_max, det_min, det_max,
                          blur_sigma=0, feather_strength=0.0):
    """Convert matrix to colored block."""
    n = len(A)
    block_h = n * cell_size
    block_w = n * cell_size
    block = np.zeros((block_h, block_w, 3), dtype=np.uint8)

    if use_determinant and det_max > det_min:
        det_norm = (det - det_min) / (det_max - det_min)
        if use_max:
            brightness_factor = 0.5 + 0.5 * det_norm
        else:
            brightness_factor = 0.5 + 0.5 * (1.0 - det_norm)
    else:
        brightness_factor = 1.0

    for i in range(n):
        for j in range(n):
            base_color = color_from_integer(
                A[i][j], low=low, high=high,
                normalizer=normalizer, hue=hue
            )
            r = min(255, int(base_color[0] * brightness_factor))
            g = min(255, int(base_color[1] * brightness_factor))
            b = min(255, int(base_color[2] * brightness_factor))

            y0 = i * cell_size
            y1 = (i + 1) * cell_size
            x0 = j * cell_size
            x1 = (j + 1) * cell_size
            block[y0:y1, x0:x1, :] = (r, g, b)

    if blur_sigma > 0:
        for c in range(3):
            block[..., c] = gaussian_filter(
                block[..., c].astype(float),
                sigma=blur_sigma
            ).astype(np.uint8)

    if feather_strength > 0:
        block = feather_edges(block, feather_strength)

    return block

def generate_determinant_canvas(canvas_width, canvas_height, low, high, cell_size,
                               normalizer=0.0, hue="gray", use_determinant=True,
                               use_max=True, max_matrix_size=4, pattern="mixed",
                               blur_sigma=1.5, vignette_strength=0.3,
                               feather_strength=0.0, gap_cells=1):
    """
    Generate determinant visualization with tiled rendering for memory efficiency.
    
    Uses tile-based processing to prevent OOM crashes on large canvases while
    maintaining the same mathematical placement algorithm and visual effects.
    """
    logger.info(f"Generating {canvas_width}x{canvas_height} canvas with tiled rendering (tile_size={TILE_SIZE})")
    
    # For large canvases, use tiled rendering
    if canvas_width * canvas_height > TILE_SIZE * TILE_SIZE * 4:  # Use tiling for large images
        return generate_determinant_canvas_tiled(
            canvas_width, canvas_height, low, high, cell_size,
            normalizer, hue, use_determinant, use_max, max_matrix_size, 
            pattern, blur_sigma, vignette_strength, feather_strength, gap_cells
        )
    
    # For smaller canvases, use original monolithic approach
    return generate_determinant_canvas_monolithic(
        canvas_width, canvas_height, low, high, cell_size,
        normalizer, hue, use_determinant, use_max, max_matrix_size, 
        pattern, blur_sigma, vignette_strength, feather_strength, gap_cells
    )

def generate_determinant_canvas_monolithic(canvas_width, canvas_height, low, high, cell_size,
                                         normalizer=0.0, hue="gray", use_determinant=True,
                                         use_max=True, max_matrix_size=4, pattern="mixed",
                                         blur_sigma=1.5, vignette_strength=0.3,
                                         feather_strength=0.0, gap_cells=1):
    """Original monolithic implementation for smaller canvases."""
    Wc = canvas_width // cell_size
    Hc = canvas_height // cell_size

    canvas = np.zeros((canvas_height, canvas_width, 3), dtype=np.uint8)
    cache = {}
    placements = []

    # Precompute determinant range
    all_dets = []
    for n in range(1, min(max_matrix_size + 1, min(Wc, Hc) + 1)):
        A, d = choose_matrix_variant(n, low, high, use_max, cache=cache)
        all_dets.append(d)

    det_min = min(all_dets) if all_dets else 0.0
    det_max = max(all_dets) if all_dets else 0.0

    # Pattern selection
    if pattern == "uniform":
        size_weights = [0.1, 0.3, 0.4, 0.2]
    elif pattern == "gradient":
        size_weights = [1.0 / (i + 1) for i in range(max_matrix_size)]
    else:  # mixed
        size_weights = [0.15, 0.25, 0.30, 0.20, 0.08, 0.02]

    size_weights = size_weights[:max_matrix_size]
    total = sum(size_weights)
    if total > 0:
        size_weights = [w / total for w in size_weights]

    margin = max(0, int(gap_cells))
    y_cell = 0
    np.random.seed(42)

    # Layout generation
    while y_cell < Hc:
        x_cell = 0
        row_height = 0

        while x_cell < Wc:
            available_h = Hc - y_cell
            available_w = Wc - x_cell
            max_n = min(max_matrix_size, available_h, available_w)
            if max_n < 1:
                break

            valid_sizes = list(range(1, max_n + 1))
            valid_weights = size_weights[:max_n]
            valid_weights = [w / sum(valid_weights) for w in valid_weights]

            n = np.random.choice(valid_sizes, p=valid_weights)
            A, det = choose_matrix_variant(n, low, high, use_max, cache=cache)

            placements.append({
                "A": A, "det": det, "n": n,
                "x_cell": x_cell, "y_cell": y_cell
            })

            row_height = max(row_height, n)
            x_cell += n + margin

        y_cell += row_height + margin

    # Render blocks onto canvas
    for p in placements:
        A, det, n = p["A"], p["det"], p["n"]
        x0 = p["x_cell"] * cell_size
        y0 = p["y_cell"] * cell_size

        block = _matrix_to_color_block(
            A, det, low, high, cell_size, normalizer, hue,
            use_determinant, use_max, det_min, det_max,
            blur_sigma, feather_strength
        )

        bh, bw = block.shape[:2]
        x1 = min(canvas_width, x0 + bw)
        y1 = min(canvas_height, y0 + bh)
        sw = x1 - x0
        sh = y1 - y0
        if sw > 0 and sh > 0:
            canvas[y0:y1, x0:x1, :] = block[:sh, :sw]

    # Apply vignette effect
    if vignette_strength > 0:
        cy, cx = canvas_height / 2, canvas_width / 2
        Y, X = np.ogrid[:canvas_height, :canvas_width]
        dist = np.sqrt((X - cx)**2 + (Y - cy)**2)
        max_dist = np.sqrt(cx**2 + cy**2)
        vignette = 1 - (dist / max_dist) * vignette_strength
        vignette = np.clip(vignette, 0, 1)
        for c in range(3):
            canvas[..., c] = (canvas[..., c] * vignette).astype(np.uint8)

    return canvas

def generate_determinant_canvas_tiled(canvas_width, canvas_height, low, high, cell_size,
                                    normalizer=0.0, hue="gray", use_determinant=True,
                                    use_max=True, max_matrix_size=4, pattern="mixed",
                                    blur_sigma=1.5, vignette_strength=0.3,
                                    feather_strength=0.0, gap_cells=1):
    """Tiled rendering implementation for memory efficiency on large canvases."""
    
    # Calculate overlap needed for effects
    overlap = max(int(blur_sigma * 3), max_matrix_size * cell_size, 32)
    
    # Calculate tiles needed
    tiles_x = (canvas_width + TILE_SIZE - 1) // TILE_SIZE
    tiles_y = (canvas_height + TILE_SIZE - 1) // TILE_SIZE
    
    logger.info(f"Processing {tiles_x}x{tiles_y} = {tiles_x * tiles_y} tiles with overlap={overlap}")
    
    # Generate global placement layout (but don't render yet)
    placements = generate_placement_layout(
        canvas_width, canvas_height, low, high, cell_size,
        use_max, max_matrix_size, pattern, gap_cells
    )
    
    # Pre-compute determinant range for consistent brightness
    cache = {}
    det_min, det_max = compute_determinant_range(placements, cache)
    
    # Initialize final canvas
    canvas = np.zeros((canvas_height, canvas_width, 3), dtype=np.uint8)
    
    # Process each tile
    for tile_y in range(tiles_y):
        for tile_x in range(tiles_x):
            logger.debug(f"Processing tile ({tile_x}, {tile_y})")
            
            # Calculate tile boundaries  
            start_x = tile_x * TILE_SIZE
            end_x = min(start_x + TILE_SIZE, canvas_width)
            start_y = tile_y * TILE_SIZE
            end_y = min(start_y + TILE_SIZE, canvas_height)
            
            # Expand for overlap (for seamless effects)
            overlap_start_x = max(0, start_x - overlap)
            overlap_end_x = min(canvas_width, end_x + overlap)
            overlap_start_y = max(0, start_y - overlap)
            overlap_end_y = min(canvas_height, end_y + overlap)
            
            overlap_width = overlap_end_x - overlap_start_x
            overlap_height = overlap_end_y - overlap_start_y
            
            # Render overlapped tile
            tile_canvas = render_tile_region(
                overlap_start_x, overlap_start_y, overlap_width, overlap_height,
                placements, low, high, cell_size, normalizer, hue,
                use_determinant, use_max, det_min, det_max,
                blur_sigma, feather_strength
            )
            
            # Apply vignette to overlapped tile
            if vignette_strength > 0:
                tile_canvas = apply_vignette_to_tile(
                    tile_canvas, overlap_start_x, overlap_start_y,
                    canvas_width, canvas_height, vignette_strength
                )
            
            # Extract core tile (without overlap) and place into main canvas
            core_start_x = start_x - overlap_start_x
            core_end_x = core_start_x + (end_x - start_x)
            core_start_y = start_y - overlap_start_y
            core_end_y = core_start_y + (end_y - start_y)
            
            canvas[start_y:end_y, start_x:end_x] = tile_canvas[core_start_y:core_end_y, core_start_x:core_end_x]
            
            # Explicit cleanup
            del tile_canvas
    
    logger.info("Tiled rendering complete")
    return canvas

def generate_placement_layout(canvas_width, canvas_height, low, high, cell_size,
                            use_max, max_matrix_size, pattern, gap_cells):
    """Generate the placement layout without rendering (for consistency across tiles)."""
    
    Wc = canvas_width // cell_size
    Hc = canvas_height // cell_size
    placements = []
    cache = {}

    # Pattern selection (same as monolithic)
    if pattern == "uniform":
        size_weights = [0.1, 0.3, 0.4, 0.2]
    elif pattern == "gradient":
        size_weights = [1.0 / (i + 1) for i in range(max_matrix_size)]
    else:  # mixed
        size_weights = [0.15, 0.25, 0.30, 0.20, 0.08, 0.02]

    size_weights = size_weights[:max_matrix_size]
    total = sum(size_weights)
    if total > 0:
        size_weights = [w / total for w in size_weights]

    margin = max(0, int(gap_cells))
    y_cell = 0
    np.random.seed(42)  # Same seed for consistency

    # Layout generation (same algorithm as monolithic)
    while y_cell < Hc:
        x_cell = 0
        row_height = 0

        while x_cell < Wc:
            available_h = Hc - y_cell
            available_w = Wc - x_cell
            max_n = min(max_matrix_size, available_h, available_w)
            if max_n < 1:
                break

            valid_sizes = list(range(1, max_n + 1))
            valid_weights = size_weights[:max_n]
            valid_weights = [w / sum(valid_weights) for w in valid_weights]

            n = np.random.choice(valid_sizes, p=valid_weights)
            A, det = choose_matrix_variant(n, low, high, use_max, cache=cache)

            placements.append({
                "A": A, "det": det, "n": n,
                "x_cell": x_cell, "y_cell": y_cell,
                "x_pixel": x_cell * cell_size,
                "y_pixel": y_cell * cell_size
            })

            row_height = max(row_height, n)
            x_cell += n + margin

        y_cell += row_height + margin
    
    return placements

def compute_determinant_range(placements, cache):
    """Compute determinant range for consistent brightness normalization."""
    all_dets = [p["det"] for p in placements]
    det_min = min(all_dets) if all_dets else 0.0
    det_max = max(all_dets) if all_dets else 0.0
    return det_min, det_max

def render_tile_region(start_x, start_y, width, height, placements, 
                      low, high, cell_size, normalizer, hue,
                      use_determinant, use_max, det_min, det_max,
                      blur_sigma, feather_strength):
    """Render a specific region of the canvas using relevant placements."""
    
    tile_canvas = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Find placements that intersect with this tile
    for p in placements:
        block_x0 = p["x_pixel"]
        block_y0 = p["y_pixel"] 
        block_size = p["n"] * cell_size
        block_x1 = block_x0 + block_size
        block_y1 = block_y0 + block_size
        
        # Check intersection with tile region
        if (block_x1 <= start_x or block_x0 >= start_x + width or
            block_y1 <= start_y or block_y0 >= start_y + height):
            continue
        
        # Calculate intersection
        intersect_x0 = max(block_x0, start_x)
        intersect_y0 = max(block_y0, start_y)
        intersect_x1 = min(block_x1, start_x + width)
        intersect_y1 = min(block_y1, start_y + height)
        
        if intersect_x1 <= intersect_x0 or intersect_y1 <= intersect_y0:
            continue
        
        # Generate the block
        block = _matrix_to_color_block(
            p["A"], p["det"], low, high, cell_size, normalizer, hue,
            use_determinant, use_max, det_min, det_max,
            blur_sigma, feather_strength
        )
        
        # Extract relevant portion and place in tile
        block_src_x0 = intersect_x0 - block_x0
        block_src_y0 = intersect_y0 - block_y0
        block_src_x1 = intersect_x1 - block_x0
        block_src_y1 = intersect_y1 - block_y0
        
        tile_dst_x0 = intersect_x0 - start_x
        tile_dst_y0 = intersect_y0 - start_y
        tile_dst_x1 = intersect_x1 - start_x
        tile_dst_y1 = intersect_y1 - start_y
        
        tile_canvas[tile_dst_y0:tile_dst_y1, tile_dst_x0:tile_dst_x1] = \
            block[block_src_y0:block_src_y1, block_src_x0:block_src_x1]
    
    return tile_canvas

def apply_vignette_to_tile(tile_canvas, tile_start_x, tile_start_y, 
                          canvas_width, canvas_height, vignette_strength):
    """Apply vignette effect to a tile region."""
    
    tile_height, tile_width = tile_canvas.shape[:2]
    
    # Canvas center
    cx, cy = canvas_width / 2, canvas_height / 2
    max_dist = np.sqrt(cx**2 + cy**2)
    
    # Create coordinate grids for this tile
    tile_y_coords = np.arange(tile_start_y, tile_start_y + tile_height)
    tile_x_coords = np.arange(tile_start_x, tile_start_x + tile_width)
    X, Y = np.meshgrid(tile_x_coords, tile_y_coords)
    
    # Calculate distances from center
    dist = np.sqrt((X - cx)**2 + (Y - cy)**2)
    vignette = 1 - (dist / max_dist) * vignette_strength
    vignette = np.clip(vignette, 0, 1)
    
    # Apply vignette to each channel
    for c in range(3):
        tile_canvas[..., c] = (tile_canvas[..., c] * vignette).astype(np.uint8)
    
    return tile_canvas

def generate_canvas_with_alpha(canvas_width, canvas_height, alpha_map_data=None, **kwargs):
    """
    Generate RGBA canvas with alpha mapping.
    
    CHANGED: alpha_map_path parameter removed - no filesystem reads
    Alpha mapping now uses built-in algorithm instead of external image file
    """
    # Generate RGB determinant canvas
    rgb_canvas = generate_determinant_canvas(
        canvas_width=canvas_width,
        canvas_height=canvas_height,
        **kwargs
    )

    # Generate procedural alpha channel based on canvas content
    # Convert RGB to luminance-based alpha
    r, g, b = rgb_canvas[..., 0], rgb_canvas[..., 1], rgb_canvas[..., 2]
    luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    
    # Create alpha based on color intensity
    color_intensity = np.sqrt(
        (r - luminance)**2 + 
        (g - luminance)**2 + 
        (b - luminance)**2
    )
    
    # Normalize to 0-255 range
    if color_intensity.max() > 0:
        alpha = (color_intensity / color_intensity.max()) * 255.0
    else:
        alpha = np.full_like(luminance, 255.0)
    
    alpha = np.clip(alpha, 0, 255).astype(np.uint8)

    # Combine RGB + Alpha
    rgba = np.dstack([rgb_canvas, alpha])
    return rgba

# ================================================================
#  API ROUTES
# ================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Fly.io."""
    return jsonify({
        "status": "healthy",
        "service": "mathematical-wallpaper-api",
        "version": "1.0.0"
    })

@app.route('/api/generate', methods=['POST'])
def generate_wallpaper():
    """
    Generate a mathematical wallpaper and return it directly as PNG.
    
    CHANGED: No filesystem writes - image generated and returned in memory
    """
    try:
        data = request.get_json() or {}
        logger.info(f"Generating wallpaper with params: {data}")

        # Extract parameters with defaults
        params = {
            "canvas_width": int(data.get("canvas_width", 1920)),
            "canvas_height": int(data.get("canvas_height", 1080)),
            "cell_size": int(data.get("cell_size", 12)),
            "low": int(data.get("low", 0)),
            "high": int(data.get("high", 1)),
            "normalizer": float(data.get("normalizer", 0.5)),
            "hue": str(data.get("hue", "purple")),
            "use_determinant": bool(data.get("use_determinant", True)),
            "use_max": bool(data.get("use_max", True)),
            "max_matrix_size": int(data.get("max_matrix_size", 4)),
            "pattern": str(data.get("pattern", "mixed")),
            "blur_sigma": float(data.get("blur_sigma", 1.5)),
            "vignette_strength": float(data.get("vignette_strength", 0.25)),
            "gap_cells": int(data.get("gap_cells", 1)),
            "feather_strength": float(data.get("feather_strength", 0.0))
        }

        # Generate RGBA image in memory
        rgba_array = generate_canvas_with_alpha(**params)
        
        # Convert NumPy array to PIL Image
        image = Image.fromarray(rgba_array, 'RGBA')
        
        # Save to memory buffer instead of filesystem
        img_buffer = io.BytesIO()
        image.save(img_buffer, format='PNG', optimize=True)
        img_buffer.seek(0)

        logger.info(f"Successfully generated {params['canvas_width']}x{params['canvas_height']} wallpaper")
        
        # Return image directly via send_file
        return send_file(
            img_buffer,
            mimetype='image/png',
            as_attachment=False,
            download_name=f"wallpaper_{params['hue']}_{params['canvas_width']}x{params['canvas_height']}.png"
        )

    except Exception as e:
        logger.error(f"Error generating wallpaper: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/info', methods=['GET'])
def get_api_info():
    """Get API information and available parameters."""
    return jsonify({
        "name": "Mathematical Wallpaper Generator API",
        "description": "Generates mathematical visualizations using matrix determinants",
        "version": "1.0.0",
        "endpoints": {
            "/health": "Health check",
            "/api/generate": "Generate wallpaper (POST)",
            "/api/info": "API information (GET)"
        },
        "parameters": {
            "canvas_width": {"type": "int", "default": 1920, "description": "Canvas width in pixels"},
            "canvas_height": {"type": "int", "default": 1080, "description": "Canvas height in pixels"},
            "cell_size": {"type": "int", "default": 12, "description": "Size of each matrix cell in pixels"},
            "low": {"type": "int", "default": 0, "description": "Minimum matrix value"},
            "high": {"type": "int", "default": 1, "description": "Maximum matrix value"},
            "normalizer": {"type": "float", "default": 0.5, "description": "Brightness normalization (0-1)"},
            "hue": {"type": "str", "default": "purple", "options": ["gray", "red", "orange", "yellow", "green", "blue", "purple", "pink", "teal"]},
            "use_determinant": {"type": "bool", "default": True, "description": "Use determinant for brightness"},
            "use_max": {"type": "bool", "default": True, "description": "Use maximum determinant matrices"},
            "max_matrix_size": {"type": "int", "default": 4, "description": "Maximum matrix dimension"},
            "pattern": {"type": "str", "default": "mixed", "options": ["mixed", "uniform", "gradient"]},
            "blur_sigma": {"type": "float", "default": 1.5, "description": "Gaussian blur strength"},
            "vignette_strength": {"type": "float", "default": 0.25, "description": "Vignette effect strength (0-1)"},
            "gap_cells": {"type": "int", "default": 1, "description": "Gap between matrices in cells"},
            "feather_strength": {"type": "float", "default": 0.0, "description": "Edge feathering strength (0-1)"}
        }
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

# ================================================================
#  PRODUCTION WSGI ENTRY POINT
# ================================================================

if __name__ == '__main__':
    # This should not run in production
    logger.warning("Running in development mode - use Gunicorn for production")
    app.run(debug=False, host='0.0.0.0', port=5000)

# WSGI application object for production deployment
# This is what Gunicorn will look for
application = app