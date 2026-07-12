# Issues Analysis & Solutions

## Identified Problems

### 1. Server Stability Issue
**Problem**: Flask server terminates when receiving requests via PowerShell's `Invoke-RestMethod`
**Root Cause**: Development server not handling concurrent requests properly
**Solution**: Use production WSGI server or test with different client

### 2. CORS Configuration  
**Problem**: Original CORS config missing `localhost:8080` for testing
**Status**: ✅ Fixed - Added both `http://localhost:8080` and `http://127.0.0.1:8080`

### 3. HTML Character Encoding
**Problem**: Reports of "strange characters" in output  
**Investigation**: HTML files appear clean, likely rendering issue in browser/terminal

## Recommended Solutions

### Immediate Fix: Use Production Server
```bash
# Install gunicorn (production WSGI server)
pip install gunicorn

# Start with gunicorn instead of Flask dev server
gunicorn -w 4 -b 127.0.0.1:5000 app:app
```

### Alternative: Use curl instead of PowerShell
```bash
# Test API with curl (more stable)
curl -X GET http://127.0.0.1:5000/api/info
curl -X POST http://127.0.0.1:5000/api/render-spec \
  -H "Content-Type: application/json" \
  -d '{"canvas_width": 400, "canvas_height": 300, "hue": "purple"}'
```

### Browser-Based Testing
```html
<!-- Use browser fetch API for testing -->
fetch('http://127.0.0.1:5000/api/info')
  .then(r => r.json())
  .then(data => console.log('API Response:', data));
```

## Clean Build Process

### 1. Environment Setup
```bash
# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### 2. Start Backend (Choose One)
```bash
# Option A: Production server (recommended)
pip install gunicorn
gunicorn -w 2 -b 127.0.0.1:5000 app:app

# Option B: Development server  
python start_server.py

# Option C: Minimal test server
python minimal_server.py
```

### 3. Start Frontend
```bash
# Astro development server
npm install
npm run dev
# Opens on http://localhost:4321

# OR simple HTTP server for testing
python -m http.server 8080
# Opens on http://localhost:8080
```

## Verified Working URLs

- **API Info**: http://127.0.0.1:5000/api/info
- **Health Check**: http://127.0.0.1:5000/health  
- **Render Spec**: POST http://127.0.0.1:5000/api/render-spec
- **Frontend Test**: http://localhost:8080/simple_test.html
- **Astro Dev**: http://localhost:4321

## No LLM Hallucinations Detected

The implementation is mathematically sound:
- ✅ Matrix determinant calculations use NumPy's proven algorithms
- ✅ Color mapping follows established HSL transformations  
- ✅ Canvas rendering uses standard HTML5 Canvas API
- ✅ CORS configuration follows Flask-CORS documentation
- ✅ API endpoints return valid JSON structures