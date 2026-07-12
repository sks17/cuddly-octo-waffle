# far-flare Build Guide

## Prerequisites

### Required Software
- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Git** (for version control)

### Python Dependencies
```bash
pip install flask flask-cors pillow numpy scipy
```

### Node.js Dependencies  
```bash
npm install
```

## Quick Start Guide

### 1. Start the Backend API Server

```bash
# Method 1: Direct execution
python app.py

# Method 2: Using Flask CLI
export FLASK_APP=app.py
flask run --host=127.0.0.1 --port=5000

# Method 3: Production-like (recommended for testing)
python -c "from app import app; app.run(host='127.0.0.1', port=5000, debug=False)"
```

The server should start on `http://localhost:5000` or `http://127.0.0.1:5000`

### 2. Test the API

```bash
# Test basic connectivity
curl http://localhost:5000/api/info

# Test render spec generation (PowerShell)
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/render-spec" -Method POST -ContentType "application/json" -Body '{"canvas_width": 400, "canvas_height": 300, "hue": "purple", "cell_size": 20}'
Write-Host "Blocks generated: $($response.blocks.Count)"
```

### 3. Start the Frontend (Astro Development)

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The Astro dev server will start on `http://localhost:4321`

### 4. Test Distributed Rendering

For testing the distributed rendering system:

```bash
# Start a simple HTTP server for test files
python -m http.server 8080

# Open browser to: http://localhost:8080/simple_test.html
```

## Project Structure

```
far-flare/
├── app.py                      # Flask API server (mathematical computation)
├── package.json               # Node.js dependencies
├── requirements.txt           # Python dependencies  
├── src/
│   ├── components/
│   │   └── BackgroundGenerator.astro  # UI controls
│   ├── scripts/
│   │   ├── backgroundState.ts        # State management
│   │   ├── backgroundRenderer.ts     # Client-side rendering
│   │   └── accentTheme.ts           # Theme coordination
│   ├── styles/
│   │   └── global.css               # CSS custom properties
│   └── layouts/
│       └── BaseLayout.astro         # Main layout
├── simple_test.html           # Basic API test
└── test_distributed.html     # Full distributed rendering test
```

## API Endpoints

- **GET** `/health` - Health check
- **GET** `/api/info` - API information and parameters
- **POST** `/api/generate` - Generate complete PNG wallpaper
- **POST** `/api/render-spec` - Generate render specification for distributed rendering

## Common Issues & Solutions

### 1. "Failed to fetch" Error
- **Cause**: CORS policy blocking requests between localhost:8080 and localhost:5000
- **Solution**: Ensure Flask server includes `http://localhost:8080` in CORS origins
- **Check**: Server logs should show CORS headers being set

### 2. HTML Character Issues
- **Cause**: UTF-8 encoding problems or HTML entities in templates
- **Solution**: Ensure files are saved as UTF-8 and avoid emoji/special characters in critical text

### 3. Server Crashes
- **Cause**: Missing dependencies or port conflicts
- **Solution**: 
  ```bash
  pip install -r requirements.txt
  netstat -ano | findstr :5000  # Check if port is in use
  ```

### 4. Import Errors
- **Cause**: Missing Python packages
- **Solution**: Install all required packages
  ```bash
  pip install flask flask-cors pillow numpy scipy
  ```

## Development Workflow

1. **Backend Changes**: Modify `app.py` → Restart Flask server
2. **Frontend Changes**: Modify Astro files → Hot reload automatic
3. **Testing**: Use `simple_test.html` for API validation
4. **Styling**: Edit `src/styles/global.css` for theme changes

## Deployment Notes

- **Backend**: Deploy Flask app to Fly.io or similar platform
- **Frontend**: Deploy Astro build to Vercel or Netlify
- **Environment**: Set `PUBLIC_API_URL` for production API endpoint
- **CORS**: Update allowed origins for production domains

## Mathematical Background

The system generates wallpapers using:
- **Linear Algebra**: Matrix determinant maximization
- **Optimization**: Brute force search for optimal matrices  
- **Visualization**: Determinant-based brightness mapping
- **Color Theory**: HSL-based hue transformations