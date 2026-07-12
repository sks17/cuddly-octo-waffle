
import os




# Commented methods but O(n^3) complexity
# Fast determinant using NumPy (LAPACK)
def calculate_determinant(M):
    """
    Compute det(M) using NumPy's optimized LU-decomposition.
    Returned as an int when entries are integers.
    """
    A = np.array(M, dtype=float)
    return int(round(np.linalg.det(A)))


# Fast version of calculate_max_determinant
def calculate_max_determinant(n=1, low=0, high=1):
    """
    Brute-force search for matrices with max/min determinant
    using NumPy's optimized determinant engine.
    """
    max_det = -float("inf")
    min_det = float("inf")
    max_A = None
    min_A = None
    vals = [low, high]
    for bits in product(vals, repeat=n*n):
        A = np.frombuffer(np.array(bits, dtype=float)).reshape(n, n)
        d = int(round(np.linalg.det(A)))
        if d > max_det:
            max_det = d
            max_A = A.copy().tolist()
        if d < min_det:
            min_det = d
            min_A = A.copy().tolist()
    return (max_det, min_det), (max_A, min_A)

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
            raise ValueError(f"Unknown hue '{hue_name}'. Options: {', '.join(hues.keys())}")
        return list(hues[hue_name])
    return apply_hue(base_gray, hue)


# Determines a color to generate based on the number provided
def color_stream(matrix, low=0, high=1, normalizer=0.0, hue="gray"):
    flat = [x for row in matrix for x in row]
    i = 0
    while True:
        yield color_from_integer(flat[i], low=low, high=high, normalizer=normalizer, hue=hue)
        i = (i + 1) % len(flat)

def _get_extremal_matrix(n, low, high, use_max, cache):
    if n in cache:
        ((max_det, min_det), (max_A, min_A)) = cache[n]
    else:
        res = calculate_max_determinant(n, low=low, high=high)
        cache[n] = res
        ((max_det, min_det), (max_A, min_A)) = res
    if use_max:
        return max_A, max_det
    else:
        return min_A, min_det


def _matrix_to_color_block(A, det, low, high, cell_size,
                           normalizer, hue,
                           use_determinant, use_max,
                           det_min, det_max, blur_sigma=0):
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
                A[i][j],
                low=low,
                high=high,
                normalizer=normalizer,
                hue=hue
            )
            r = min(255, int(base_color[0] * brightness_factor))
            g = min(255, int(base_color[1] * brightness_factor))
            b = min(255, int(base_color[2] * brightness_factor))

            y0 = i * cell_size
            y1 = (i + 1) * cell_size
            x0 = j * cell_size
            x1 = (j + 1) * cell_size   
            block[y0:y1, x0:x1, :] = (r, g, b)

    # Apply Gaussian blur between cells for softer transitions
    if blur_sigma > 0:
        for c in range(3):
            block[:, :, c] = gaussian_filter(block[:, :, c].astype(float), sigma=blur_sigma).astype(np.uint8)

    return block


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
    vignette_strength=0.3
):
    """
    Generate a canvas filled with visualizations of extremal determinant matrices.
    
    Parameters:
    - max_matrix_size: Maximum n×n matrix size (default 4 for speed, <2s)
    - pattern: "mixed" (varied sizes), "uniform" (similar sizes), "gradient" (size increases)
    - blur_sigma: Gaussian blur between cells (0=sharp, 1.5=soft, 3=very soft)
    - vignette_strength: Radial darkening at edges (0=none, 0.3=subtle, 0.6=strong)
    """
    Wc = canvas_width // cell_size
    Hc = canvas_height // cell_size
    canvas = np.zeros((canvas_height, canvas_width, 3), dtype=np.uint8)
    cache = {}
    placements = []
    
    all_dets = []
    for n in range(1, min(max_matrix_size + 1, min(Wc, Hc) + 1)):
        _, det = _get_extremal_matrix(n, low, high, use_max, cache)
        all_dets.append(det)
    
    det_min = min(all_dets) if all_dets else 0.0
    det_max = max(all_dets) if all_dets else 0.0
    
    if pattern == "uniform":
        size_weights = [0.1, 0.3, 0.4, 0.2] + [0.0] * max(0, max_matrix_size - 4)
    elif pattern == "gradient":
        size_weights = [1.0 / (i + 1) for i in range(max_matrix_size)]
    else:
        size_weights = [0.15, 0.25, 0.30, 0.20, 0.08, 0.02][:max_matrix_size]
    
    size_weights = size_weights[:max_matrix_size]
    total = sum(size_weights)
    if total > 0:
        size_weights = [w / total for w in size_weights]
    
    margin = 1
    y_cell = 0
    np.random.seed(42)
    
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
            A, det = _get_extremal_matrix(n, low, high, use_max, cache)
            placements.append({"A": A, "det": det, "n": n, "x_cell": x_cell, "y_cell": y_cell})
            row_height = max(row_height, n)
            x_cell += n + margin
        y_cell += row_height + margin
    
    for p in placements:
        A, det, n = p["A"], p["det"], p["n"]
        x0, y0 = p["x_cell"] * cell_size, p["y_cell"] * cell_size
        block = _matrix_to_color_block(A, det, low, high, cell_size, normalizer, hue,
                                       use_determinant, use_max, det_min, det_max, blur_sigma)
        block_h, block_w = block.shape[:2]
        x1, y1 = min(canvas_width, x0 + block_w), min(canvas_height, y0 + block_h)
        sub_w, sub_h = x1 - x0, y1 - y0
        if sub_w > 0 and sub_h > 0:
            canvas[y0:y1, x0:x1, :] = block[0:sub_h, 0:sub_w, :]
    
    # Apply radial vignette for depth
    if vignette_strength > 0:
        cy, cx = canvas_height / 2, canvas_width / 2
        Y, X = np.ogrid[:canvas_height, :canvas_width]
        dist = np.sqrt((X - cx)**2 + (Y - cy)**2)
        max_dist = np.sqrt(cx**2 + cy**2)
        vignette = 1 - (dist / max_dist) * vignette_strength
        vignette = np.clip(vignette, 0, 1)
        for c in range(3):
            canvas[:, :, c] = (canvas[:, :, c] * vignette).astype(np.uint8)

    if output_path:
        imageio.imwrite(output_path, canvas)
    return canvas


def main():
    print("\n=== Maximum Determinant Visualizer ===")
    print("Saksham Singh — Singh Parlays (Singh Learns)")
    print("------------------------------------------\n")

    # Make output folder
    os.makedirs("text_canvases", exist_ok=True)

    while True:
        try:
            canvas_width = int(input("Canvas width (px): "))
            canvas_height = int(input("Canvas height (px): "))
            cell_size = int(input("Matrix cell size (px): "))

            low = int(input("Minimum value allowed in matrices: "))
            high = int(input("Maximum value allowed in matrices: "))

            normalizer = float(input("Color normalizer (0 = full range, 1 = uniform) [0–1]: "))
            hue = input("Hue (gray, red, orange, yellow, green, blue, purple, pink, teal): ").strip()

            use_det_str = input("Scale colors by determinant? (y/n): ").strip().lower()
            use_determinant = (use_det_str == "y")

            use_max_str = input("Use maximum determinant matrices? (y/n, else uses minimum): ").strip().lower()
            use_max = (use_max_str == "y")

            max_matrix_size = int(input("Maximum matrix size to generate (recommended ≤ 6): "))

            pattern = input("Pattern (mixed / uniform / gradient): ").strip().lower()
            if pattern not in ("mixed", "uniform", "gradient"):
                pattern = "mixed"

            blur_sigma = float(input("Blur strength (0 = sharp, 1–3 = soft): "))
            vignette_strength = float(input("Vignette strength (0–0.6): "))

            filename = input("Output PNG filename (without extension): ").strip()
            output_path = os.path.join("text_canvases", filename + ".png")

            print("\nGenerating canvas... please wait...\n")

            canvas = generate_determinant_canvas(
                canvas_width=canvas_width,
                canvas_height=canvas_height,
                low=low,
                high=high,
                cell_size=cell_size,
                normalizer=normalizer,
                hue=hue,
                use_determinant=use_determinant,
                use_max=use_max,
                max_matrix_size=max_matrix_size,
                pattern=pattern,
                blur_sigma=blur_sigma,
                vignette_strength=vignette_strength,
                output_path=output_path
            )

            print(f"Canvas saved to: text_canvases/{filename}.png\n")

        except Exception as e:
            print(f"\nERROR: {e}\n")
        
        again = input("Generate another? (y/n): ").strip().lower()
        if again != "y":
            print("\nGoodbye!\n")
            break

if __name__ == "__main__":
    main()