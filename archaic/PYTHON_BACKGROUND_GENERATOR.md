# Python Background Generator Setup and Usage

## Overview
The Python background generator creates mathematical visualizations based on linear algebra concepts, specifically maximum determinant visualizations. It generates beautiful abstract backgrounds for the website.

## Prerequisites

### 1. Python Installation
Ensure you have Python 3.8+ installed:
```bash
python --version
```

### 2. Required Dependencies
Install the necessary Python packages:

```bash
pip install pillow numpy scipy imageio
```

Or create a requirements file and install:
```bash
# Create requirements.txt
echo "pillow>=9.0.0" > requirements.txt
echo "numpy>=1.21.0" >> requirements.txt
echo "scipy>=1.7.0" >> requirements.txt
echo "imageio>=2.15.0" >> requirements.txt

# Install dependencies
pip install -r requirements.txt
```

### 3. Virtual Environment (Recommended)
Set up a virtual environment to avoid conflicts:

```bash
# Create virtual environment
python -m venv background-generator-env

# Activate virtual environment
# On Windows:
background-generator-env\Scripts\activate
# On macOS/Linux:
source background-generator-env/bin/activate

# Install dependencies in virtual environment
pip install pillow numpy scipy imageio
```

## Running the Background Generator

### Using beginning.py (Main Generator)
Navigate to the LinearAlgebraWallpapers directory:

```bash
cd LinearAlgebraWallpapers
python beginning.py
```

### Using test.py (Testing/Development)
For testing or development:

```bash
cd LinearAlgebraWallpapers
python test.py
```

## Generated Output

### Default Output Location
Images are typically generated in:
- `LinearAlgebraWallpapers/output/` (if configured)
- `public/assets/backgrounds/` (for direct website use)

### Image Formats
The generator creates:
- `.png` files for static backgrounds
- `.gif` files for animated sequences (if enabled)
- Various resolutions (typically 1920x1080, 2560x1440)

## Configuration Options

### Common Parameters
The generator can be customized with these parameters:

```python
# Matrix dimensions
n = 3  # 3x3 matrices

# Value ranges
low = 0   # Minimum matrix value
high = 1  # Maximum matrix value

# Visual options
cell_size = 100     # Size of each matrix cell in pixels
hue = "blue"        # Color theme: "red", "blue", "green", "purple", etc.
normalizer = 0.2    # Color intensity (0.0-1.0)
blur_sigma = 2      # Gaussian blur amount

# Output dimensions
width = 1920
height = 1080
```

### Color Themes Available
- `"gray"` - Grayscale
- `"red"` - Red tones
- `"orange"` - Orange gradient
- `"yellow"` - Yellow spectrum
- `"green"` - Green hues
- `"blue"` - Blue theme (default)
- `"purple"` - Purple gradient
- `"pink"` - Pink tones
- `"teal"` - Teal/cyan colors

## Integrating Generated Backgrounds

### 1. Manual Copy
After generation, copy images to the website assets:
```bash
cp LinearAlgebraWallpapers/output/*.png public/assets/backgrounds/
```

### 2. Automated Integration
Modify the generator script to output directly to the website:

```python
# Add to beginning.py or test.py
import shutil
import os

def save_to_website(image_path, filename):
    """Copy generated image to website assets"""
    website_bg_dir = "../public/assets/backgrounds/"
    os.makedirs(website_bg_dir, exist_ok=True)
    dest_path = os.path.join(website_bg_dir, filename)
    shutil.copy2(image_path, dest_path)
    print(f"Saved background to {dest_path}")
```

### 3. Background Generator API
For dynamic generation, you could create a simple HTTP endpoint:

```python
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json

# Add background generation endpoint
class BackgroundHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/generate-background':
            # Parse parameters from request
            # Generate background
            # Return image path
            pass
```

## Performance Considerations

### Matrix Size vs Generation Time
- 2x2 matrices: Nearly instant
- 3x3 matrices: ~1-5 seconds
- 4x4 matrices: ~30-60 seconds
- 5x5 matrices: Several minutes

### Memory Usage
- Larger matrices and higher resolutions require more RAM
- Use lower cell_size for faster generation
- Enable blur_sigma for smoother appearance with lower resolution

### Batch Generation
Generate multiple backgrounds at once:

```python
def generate_batch(count=10):
    """Generate multiple backgrounds with varied parameters"""
    hues = ["blue", "purple", "green", "red", "teal"]
    
    for i in range(count):
        hue = hues[i % len(hues)]
        normalizer = 0.1 + (i * 0.1) % 0.5
        
        # Generate with current parameters
        # Save with unique filename
        pass
```

## Troubleshooting

### Common Issues
1. **Import Errors**: Ensure all dependencies are installed
2. **Memory Errors**: Reduce matrix size or image resolution
3. **Slow Generation**: Use smaller matrices or lower cell_size
4. **File Permission Errors**: Check write permissions to output directory

### Debug Mode
Add debug output to track generation progress:

```python
import logging
logging.basicConfig(level=logging.INFO)

def debug_matrix_generation():
    logger = logging.getLogger(__name__)
    logger.info("Starting background generation...")
    # Your generation code here
    logger.info("Background generation complete!")
```

## Advanced Usage

### Custom Color Functions
Create your own color mapping functions:

```python
def custom_color_mapping(value, theme="cosmic"):
    """Custom color scheme for backgrounds"""
    if theme == "cosmic":
        # Dark space theme with bright accents
        pass
    elif theme == "neon":
        # Bright neon colors
        pass
    # Return RGB tuple
```

### Animation Sequences
Generate animated backgrounds:

```python
def generate_animated_sequence():
    """Create animated background sequences"""
    frames = []
    for frame in range(60):  # 60 frames
        # Vary parameters slightly each frame
        # Generate frame
        # Add to frames list
        pass
    
    # Save as GIF
    import imageio
    imageio.mimsave('animated_background.gif', frames, fps=30)
```

## File Structure After Setup
```
LinearAlgebraWallpapers/
├── beginning.py          # Main generator script
├── test.py              # Testing/development script
├── requirements.txt      # Python dependencies
├── output/              # Generated images
│   ├── background_001.png
│   ├── background_002.png
│   └── ...
└── cache/               # Computation cache (optional)
```

This should give you everything needed to run and customize the Python background generator for your website!