# Saksham Singh
# Singh Parlays (Singh Learns)
# Maximum Determinant Visualizer

from PIL import Image
from itertools import product
import imageio
import numpy as np
from scipy.ndimage import gaussian_filter
import os



# ================================================================
#  Determinant (Fast NumPy Version)
# ================================================================
def calculate_determinant(M):
    """
    Compute det(M) using NumPy's optimized LU-decomposition.
    Returned as an int when entries are integers.
    """
    A = np.array(M, dtype=float)
    return int(round(np.linalg.det(A)))


# ================================================================
#  Max/Min Determinant Search (Brute Force)
# ================================================================
def calculate_max_determinant(n=1, low=0, high=1):
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



# ================================================================
#  ==== NEW METHODS ADDED (OPTION 1 + OPTION 3) ====
# ================================================================

# ------------------------------------------------
# Variant (2): Kronecker expansion of a matrix
# ------------------------------------------------
def kronecker_variant(A):
    """
    Returns several Kronecker variants of matrix A:
      A⊗A, A⊗I, I⊗A
    Encapsulation: caller chooses which to use.
    """
    A_np = np.array(A, dtype=float)
    I = np.eye(len(A), dtype=float)

    return {
        "A_kron_A": np.kron(A_np, A_np).tolist(),
        "A_kron_I": np.kron(A_np, I).tolist(),
        "I_kron_A": np.kron(I, A_np).tolist(),
    }


# ------------------------------------------------
# Variant (5): Top-k determinant matrices
# ------------------------------------------------
def top_k_det_matrices(n, low, high, k=3):
    vals = [low, high]
    candidates = []

    for bits in product(vals, repeat=n*n):
        A = np.array(bits, dtype=float).reshape(n, n)
        d = int(round(np.linalg.det(A)))
        candidates.append((d, A.copy().tolist()))

    candidates.sort(key=lambda x: x[0])  # ascending

    return {
        "bottom": candidates[:k],
        "top": candidates[-k:]
    }



# ------------------------------------------------
# Main abstraction: pick which matrix variant to use
# ------------------------------------------------
def choose_matrix_variant(n, low, high, use_max, use_kronecker, use_top_k, cache):
    """
    Encapsulates all determinant-matrix selection logic.
    Replaces direct calls to _get_extremal_matrix.
    """

    # Cached?
    key = (n, low, high)
    if key not in cache:
        cache[key] = calculate_max_determinant(n, low, high)

    # Original max/min matrices
    ((max_det, min_det), (max_A, min_A)) = cache[key]

    # 1) Basic selection
    A = max_A if use_max else min_A
    det = max_det if use_max else min_det

    # 2) Kronecker variants requested?
    if use_kronecker:
        variants = kronecker_variant(A)
        # Choose the one with largest or smallest determinant
        best_A = A
        best_det = det
        for name, varA in variants.items():
            d = calculate_determinant(varA)
            if use_max and d > best_det:
                best_det = d
                best_A = varA
            if not use_max and d < best_det:
                best_det = d
                best_A = varA
        return best_A, best_det

    # 3) Top-k selection?
    if use_top_k:
        results = top_k_det_matrices(n, low, high, k=3)
        group = "top" if use_max else "bottom"
        chosen_det, chosen_A = results[group][-1]  # for "top", last is largest
        return chosen_A, chosen_det

    # Default
    return A, det



# ------------------------------------------------
# Feathering for soft matrix edges
# ------------------------------------------------
def feather_edges(block, feather_strength):
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
    mask = 0.5 * (1 - np.cos(np.pi * mask))  # cosine ramp
    mask = mask[..., None]  # broadcast to RGB

    bg = np.array([128, 128, 128], dtype=float)  # soft gray background

    faded = block.astype(float) * mask + bg * (1 - mask)
    return faded.astype(np.uint8)


def color_from_integer(n=0, low=0, high=1, normalizer=0.0, hue="gray"):
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

    def apply_hue(gray, hue_name):
        gray = int(gray)
        hues = {
            "gray":   (gray, gray, gray),
            "red":    (255, gray, gray),
            "orange": (255, 165 * gray // 255, gray),
            "yellow": (255, 255, gray),
            "green":  (gray, 255, gray),
            "blue":   (gray, gray, 255),
            "purple": (150 * gray // 255, 0, 255),
            "pink":   (255, gray, 200),
            "teal":   (0, 255, 200),
        }
        hue_name = hue_name.lower()
        if hue_name not in hues:
            raise ValueError(
                f"Unknown hue '{hue_name}'. Options: {', '.join(hues.keys())}"
            )
        return list(hues[hue_name])

    return apply_hue(base_gray, hue)

# ================================================================
#  _matrix_to_color_block — now with feather edge support
# ================================================================
def _matrix_to_color_block(
    A, det, low, high, cell_size,
    normalizer, hue,
    use_determinant, use_max,
    det_min, det_max,
    blur_sigma=0,
    feather_strength=0.0
):
    n = len(A)
    block_h = n * cell_size
    block_w = n * cell_size
    block = np.zeros((block_h, block_w, 3), dtype=np.uint8)

    # Determinant-based brightness scaling
    if use_determinant and det_max > det_min:
        det_norm = (det - det_min) / (det_max - det_min)
        if use_max:
            brightness_factor = 0.5 + 0.5 * det_norm
        else:
            brightness_factor = 0.5 + 0.5 * (1.0 - det_norm)
    else:
        brightness_factor = 1.0

    # Fill each cell
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

    # Soft blur between cells
    if blur_sigma > 0:
        for c in range(3):
            block[..., c] = gaussian_filter(
                block[..., c].astype(float),
                sigma=blur_sigma
            ).astype(np.uint8)

    # Add feathered edges
    if feather_strength > 0:
        block = feather_edges(block, feather_strength)

    return block

# ================================================================
#  Alpha Mapping Utilities (RGB → Alpha)
# ================================================================
def load_alpha_map_rgb(path, target_size):
    """
    Loads a color alpha map and converts it to an alpha channel
    using luminance (perceptual brightness).
    """
    img = Image.open(path).convert("RGB")

    if img.size != target_size:
        img = img.resize(target_size, Image.LANCZOS)

    arr = np.asarray(img, dtype=np.float32)

    # Perceptual luminance (sRGB)
    alpha = (
        0.2126 * arr[..., 0] +
        0.7152 * arr[..., 1] +
        0.0722 * arr[..., 2]
    )

    return np.clip(alpha, 0, 255).astype(np.uint8)


def apply_alpha_map(rgb_canvas, alpha_map):
    """
    Combines RGB canvas with alpha map → RGBA image.
    """
    if rgb_canvas.shape[:2] != alpha_map.shape:
        raise ValueError("Alpha map size does not match canvas size.")

    rgba = np.dstack([rgb_canvas, alpha_map])
    return rgba


# ================================================================
#  generate_determinant_canvas — updated to use matrix variants
# ================================================================
def generate_determinant_canvas(
    canvas_width,
    canvas_height,
    low,
    high,
    cell_size,
    normalizer=0.0,
    hue="gray",
    use_determinant=True,
    use_max=True,
    output_path=None,
    max_matrix_size=4,
    pattern="mixed",
    blur_sigma=1.5,
    vignette_strength=0.3,
    use_kronecker=False,
    use_top_k=False,
    feather_strength=0.0,
    gap_cells=1  # NEW: spacing between matrices, in cells
):
    """
    Updated canvas generator.
    Now supports:
      • kronecker variants
      • top-k determinant matrices
      • feathered edges
    """
    Wc = canvas_width // cell_size
    Hc = canvas_height // cell_size

    canvas = np.zeros((canvas_height, canvas_width, 3), dtype=np.uint8)
    cache = {}
    placements = []

    # Precompute determinant range
    all_dets = []
    for n in range(1, min(max_matrix_size + 1, min(Wc, Hc) + 1)):
        A, d = choose_matrix_variant(
            n, low, high, use_max,
            use_kronecker=False,
            use_top_k=False,
            cache=cache
        )
        all_dets.append(d)

    det_min = min(all_dets) if all_dets else 0.0
    det_max = max(all_dets) if all_dets else 0.0

    # Pattern selection
    if pattern == "uniform":
        size_weights = [0.1, 0.3, 0.4, 0.2]
    elif pattern == "gradient":
        size_weights = [1.0 / (i + 1) for i in range(max_matrix_size)]
    else:
        size_weights = [0.15, 0.25, 0.30, 0.20, 0.08, 0.02]

    size_weights = size_weights[:max_matrix_size]
    total = sum(size_weights)
    if total > 0:
        size_weights = [w / total for w in size_weights]

    margin = max(0, int(gap_cells))  # NEW
    y_cell = 0
    np.random.seed(42)

    # ------------------------
    # Layout generation
    # ------------------------
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

            # 🔥 NEW: flexible matrix selection
            A, det = choose_matrix_variant(
                n, low, high, use_max,
                use_kronecker=use_kronecker,
                use_top_k=use_top_k,
                cache=cache
            )

            placements.append({
                "A": A,
                "det": det,
                "n": n,
                "x_cell": x_cell,
                "y_cell": y_cell
            })

            row_height = max(row_height, n)
            x_cell += n + margin

        y_cell += row_height + margin

    # ------------------------
    # Render blocks onto canvas
    # ------------------------
    for p in placements:
        A, det, n = p["A"], p["det"], p["n"]
        x0 = p["x_cell"] * cell_size
        y0 = p["y_cell"] * cell_size

        block = _matrix_to_color_block(
            A, det, low, high, cell_size,
            normalizer, hue,
            use_determinant, use_max,
            det_min, det_max,
            blur_sigma,
            feather_strength  # NEW
        )

        bh, bw = block.shape[:2]
        x1 = min(canvas_width, x0 + bw)
        y1 = min(canvas_height, y0 + bh)
        sw = x1 - x0
        sh = y1 - y0
        if sw > 0 and sh > 0:
            canvas[y0:y1, x0:x1, :] = block[:sh, :sw]
    # If gaps are minimal, fill remaining empty pixels with nearby averages
    if gap_cells == 0:
        canvas = fill_empty_with_average(canvas, sigma=max(1.0, blur_sigma))

    # ------------------------
    # Vignette
    # ------------------------
    if vignette_strength > 0:
        cy, cx = canvas_height / 2, canvas_width / 2
        Y, X = np.ogrid[:canvas_height, :canvas_width]
        dist = np.sqrt((X - cx)**2 + (Y - cy)**2)
        max_dist = np.sqrt(cx**2 + cy**2)
        vignette = 1 - (dist / max_dist) * vignette_strength
        vignette = np.clip(vignette, 0, 1)
        for c in range(3):
            canvas[..., c] = (canvas[..., c] * vignette).astype(np.uint8)

    if output_path:
        imageio.imwrite(output_path, canvas)

    return canvas

def fill_empty_with_average(canvas, sigma=3.0):
    """
    Fills pure-black (0,0,0) pixels with a blurred average of nearby colors.
    Used when gap_cells is minimal to avoid harsh black gaps.
    """
    # Identify empty pixels (pure black)
    mask = (
        (canvas[..., 0] == 0) &
        (canvas[..., 1] == 0) &
        (canvas[..., 2] == 0)
    )

    if not np.any(mask):
        return canvas

    # Blur the entire image, but only copy into previously-empty pixels
    blurred = gaussian_filter(canvas.astype(float), sigma=(sigma, sigma, 0))

    filled = canvas.copy()
    filled[mask] = blurred[mask].astype(np.uint8)
    return filled


def parse_comma_inputs(input_line, schema):
    """
    Parse a comma-separated input line according to a schema.
    Schema example:
    [
        ("canvas_width", int),
        ("canvas_height", int),
        ("cell_size", int),
        ("low", int),
        ("high", int),
        ("normalizer", float),
        ("hue", str),
        ("use_determinant", bool),
        ("use_max", bool),
        ("max_matrix_size", int),
        ("pattern", str),
        ("blur_sigma", float),
        ("vignette_strength", float),
        ("filename", str)
    ]

    The parameter count is flexible—add more fields to schema to extend inputs.
    """

    parts = [p.strip() for p in input_line.split(",")]
    if len(parts) != len(schema):
        raise ValueError(
            f"Expected {len(schema)} values, but got {len(parts)}.\n"
            f"Schema fields: {[name for (name, _) in schema]}"
        )

    parsed = {}
    for (raw_value, (name, type_fn)) in zip(parts, schema):

        if type_fn is bool:
            parsed[name] = raw_value.lower() in ("y", "yes", "1", "true", "t")
        else:
            parsed[name] = type_fn(raw_value)

    return parsed

# ================================================================
#  Canvas Generator with RGB Alpha Mapping
# ================================================================
def generate_canvas_with_alpha(
    canvas_width,
    canvas_height,
    alpha_map_path,
    **kwargs
):
    # Load ImgMap as RGB
    map_img = Image.open(alpha_map_path).convert("RGB")
    map_w, map_h = map_img.size

    # Enforce size correctness
    if (canvas_width, canvas_height) != (map_w, map_h):
        print(
            f"[INFO] Requested size {canvas_width}x{canvas_height} "
            f"does not match ImgMap size {map_w}x{map_h}. "
            f"Regenerating canvas to match map."
        )
        canvas_width, canvas_height = map_w, map_h
        map_img = map_img.resize((canvas_width, canvas_height), Image.LANCZOS)

    # Generate RGB determinant canvas
    rgb_canvas = generate_determinant_canvas(
        canvas_width=canvas_width,
        canvas_height=canvas_height,
        **kwargs
    )

    # Calculate color intensity from ImgMap.jpg
    map_array = np.asarray(map_img, dtype=np.float32)
    
    # Calculate saturation/color intensity
    # Method: distance from grayscale (measure how "colorful" each pixel is)
    r, g, b = map_array[..., 0], map_array[..., 1], map_array[..., 2]
    
    # Calculate luminance (grayscale value)
    luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    
    # Color intensity = how far RGB values deviate from the gray value
    color_intensity = np.sqrt(
        (r - luminance)**2 + 
        (g - luminance)**2 + 
        (b - luminance)**2
    )
    
    # Normalize to 0-255 range
    if color_intensity.max() > 0:
        color_intensity = (color_intensity / color_intensity.max()) * 255.0
    
    alpha = np.clip(color_intensity, 0, 255).astype(np.uint8)

    # Apply alpha to determinant canvas
    # Strong colors → opaque canvas
    # Weak colors → transparent canvas
    rgba = np.dstack([rgb_canvas, alpha])

    return rgba

# ================================================================
#  MAIN TEXT UI
# ================================================================
def main():
    print("\n=== Maximum Determinant Visualizer ===")
    print("Saksham Singh — Singh Parlays (Singh Learns)")
    print("------------------------------------------\n")

    os.makedirs("HomeWallpapers", exist_ok=True)

    # Unified parameter schema
    schema = [
        ("canvas_width", int),
        ("canvas_height", int),
        ("cell_size", int),
        ("low", int),
        ("high", int),
        ("normalizer", float),
        ("hue", str),
        ("use_determinant", bool),
        ("use_max", bool),
        ("max_matrix_size", int),
        ("pattern", str),
        ("blur_sigma", float),
        ("vignette_strength", float),
        ("gap_cells", int),
        ("filename", str)
    ]

    print("Input modes:")
    print("  1 = Interactive prompts")
    print("  2 = Comma-separated input (for fast repeated testing)\n")

    while True:
        mode = input("Choose mode (1 or 2): ").strip()

        try:
            if mode == "2":
                print("\nEnter values in this order:")
                print(", ".join([name for (name, _) in schema]))
                print("\nExample:")
                print("1200, 800, 12, 0, 1, 0.5, blue, y, y, 4, mixed, 1.5, 0.3, my_canvas\n")

                line = input("Enter comma-separated values: ").strip()
                params = parse_comma_inputs(line, schema)

            else:
                # Interactive fallback
                params = {}
                for name, type_fn in schema:
                    raw = input(f"{name}: ").strip()

                    if type_fn is bool:
                        params[name] = (raw.lower() in ("y", "yes", "1", "true", "t"))
                    else:
                        params[name] = type_fn(raw)

            # Build output path
            output_path = os.path.join(
                "HomeWallpapers",
                params["filename"] + "-map.png"
            )

            print("\nGenerating canvas… please wait…\n")

            rgba = generate_canvas_with_alpha(
                canvas_width=params["canvas_width"],
                canvas_height=params["canvas_height"],
                alpha_map_path="ImgMap.jpg",
                low=params["low"],
                high=params["high"],
                cell_size=params["cell_size"],
                normalizer=params["normalizer"],
                hue=params["hue"],
                use_determinant=params["use_determinant"],
                use_max=params["use_max"],
                max_matrix_size=params["max_matrix_size"],
                pattern=params["pattern"],
                blur_sigma=params["blur_sigma"],
                vignette_strength=params["vignette_strength"],
                gap_cells=params["gap_cells"]
            )

            imageio.imwrite(output_path, rgba)

            print(f"Canvas saved to: {output_path}\n")

        except Exception as e:
            print(f"\nERROR: {e}\n")

        again = input("Generate another? (y/n): ").strip().lower()
        if again != "y":
            print("\nGoodbye!\n")
            break


# ================================================================
#  API SERVER FOR ASTRO WEBSITE
# ================================================================
def create_api_server():
    """
    Flask API server to serve wallpapers to Astro-based website.
    """
    from flask import Flask, send_file, jsonify, request
    from flask_cors import CORS
    import glob

    app = Flask(__name__)
    CORS(app)  # Enable CORS for Astro frontend

    WALLPAPER_DIR = "HomeWallpapers"
    os.makedirs(WALLPAPER_DIR, exist_ok=True)

    @app.route("/api/wallpapers", methods=["GET"])
    def list_wallpapers():
        """List all available wallpapers."""
        files = glob.glob(os.path.join(WALLPAPER_DIR, "*.png"))
        wallpapers = [
            {
                "filename": os.path.basename(f),
                "path": f"/api/wallpapers/{os.path.basename(f)}",
                "size": os.path.getsize(f)
            }
            for f in files
        ]
        return jsonify(wallpapers)

    @app.route("/api/wallpapers/<filename>", methods=["GET"])
    def get_wallpaper(filename):
        """Serve a specific wallpaper image."""
        filepath = os.path.join(WALLPAPER_DIR, filename)
        if os.path.exists(filepath):
            return send_file(filepath, mimetype="image/png")
        return jsonify({"error": "Wallpaper not found"}), 404

    @app.route("/api/generate", methods=["POST"])
    def generate_wallpaper():
        """
        Generate a new wallpaper with provided parameters.
        
        Example POST body:
        {
            "canvas_width": 7200,
            "canvas_height": 4800,
            "cell_size": 12,
            "low": 0,
            "high": 1,
            "normalizer": 0.5,
            "hue": "orange",
            "use_determinant": true,
            "use_max": true,
            "max_matrix_size": 4,
            "pattern": "mixed",
            "blur_sigma": 1.5,
            "vignette_strength": 0.25,
            "gap_cells": 1,
            "filename": "my_wallpaper"
        }
        """
        try:
            data = request.json or {}
            
            # Generate unique filename if not provided
            filename = data.get("filename", f"wallpaper_{int(np.random.random() * 100000)}")
            
            # Extract all parameters with defaults
            params = {
                "canvas_width": int(data.get("canvas_width", 7200)),
                "canvas_height": int(data.get("canvas_height", 4800)),
                "cell_size": int(data.get("cell_size", 12)),
                "low": int(data.get("low", 0)),
                "high": int(data.get("high", 1)),
                "normalizer": float(data.get("normalizer", 0.5)),
                "hue": str(data.get("hue", "orange")),
                "use_determinant": bool(data.get("use_determinant", True)),
                "use_max": bool(data.get("use_max", True)),
                "max_matrix_size": int(data.get("max_matrix_size", 4)),
                "pattern": str(data.get("pattern", "mixed")),
                "blur_sigma": float(data.get("blur_sigma", 1.5)),
                "vignette_strength": float(data.get("vignette_strength", 0.25)),
                "gap_cells": int(data.get("gap_cells", 1))
            }
            
            output_path = os.path.join(WALLPAPER_DIR, filename + "-map.png")

            print(f"\n🎨 Generating wallpaper: {filename}")
            print(f"   Size: {params['canvas_width']}x{params['canvas_height']}")
            print(f"   Hue: {params['hue']}, Cell: {params['cell_size']}px")

            rgba = generate_canvas_with_alpha(
                canvas_width=params["canvas_width"],
                canvas_height=params["canvas_height"],
                alpha_map_path=data.get("alpha_map_path", "ImgMap.jpg"),
                low=params["low"],
                high=params["high"],
                cell_size=params["cell_size"],
                normalizer=params["normalizer"],
                hue=params["hue"],
                use_determinant=params["use_determinant"],
                use_max=params["use_max"],
                max_matrix_size=params["max_matrix_size"],
                pattern=params["pattern"],
                blur_sigma=params["blur_sigma"],
                vignette_strength=params["vignette_strength"],
                gap_cells=params["gap_cells"]
            )

            imageio.imwrite(output_path, rgba)

            print(f"✅ Saved to: {output_path}\n")

            return jsonify({
                "success": True,
                "filename": os.path.basename(output_path),
                "path": f"/api/wallpapers/{os.path.basename(output_path)}",
                "full_path": output_path,
                "parameters": params
            })
        except Exception as e:
            print(f"❌ Error: {str(e)}\n")
            return jsonify({"success": False, "error": str(e)}), 500

    return app


# ================================================================
#  EXECUTION ENTRY POINT
# ================================================================
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--api":
        print("\n🚀 Starting API server for Astro website...\n")
        print("📁 Serving wallpapers from: HomeWallpapers/")
        print("🌐 API Endpoints:")
        print("   GET  /api/wallpapers          - List all wallpapers")
        print("   GET  /api/wallpapers/<name>   - Get specific wallpaper")
        print("   POST /api/generate            - Generate new wallpaper")
        print("\n🔗 Server running at: http://localhost:5000\n")
        
        app = create_api_server()
        app.run(host="0.0.0.0", port=5000, debug=True)
    else:
        main()
