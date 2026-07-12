# Flask Backend Deployment Guide

## Refactoring Summary

### Key Changes Made:
1. **Eliminated Filesystem Writes**: All image generation now happens in memory using `BytesIO`
2. **Removed Development Server**: Removed `app.run()` calls, exposed WSGI `application` object
3. **Production-Ready Flask App**: Added proper error handling, logging, and CORS configuration
4. **Pure Request/Response Model**: No background jobs or global state beyond memory cache
5. **Gunicorn Compatible**: WSGI application ready for production deployment

### Files Created/Modified:

#### New Production Files:
- **`app.py`** - Main Flask application (renamed from `beginning.py`)
- **`requirements.txt`** - Clean production dependencies  
- **`Dockerfile`** - Optimized for Fly.io deployment
- **`.dockerignore`** - Excludes unnecessary files from Docker build
- **`fly.toml`** - Fly.io deployment configuration

#### Modified Frontend Files:
- **`src/scripts/backgroundState.ts`** - Updated API endpoints for production
- **`astro.config.mjs`** - Added Vercel adapter configuration

### Code Removed/Changed:

#### From Original `beginning.py`:
- ❌ **Removed**: All filesystem write operations (`imageio.imwrite()`, file saving)
- ❌ **Removed**: `HomeWallpapers/` directory dependencies  
- ❌ **Removed**: `app.run()` and standalone execution
- ❌ **Removed**: File-based wallpaper listing endpoint
- ❌ **Removed**: Alpha map file loading (replaced with procedural generation)
- ✅ **Kept**: All NumPy/SciPy mathematical logic intact
- ✅ **Kept**: Matrix determinant calculations and visualization algorithms

#### API Changes:
- **Old**: `POST /api/generate` → Returns JSON with file path
- **New**: `POST /api/generate` → Returns PNG image directly via `send_file()`
- **Added**: `/health` endpoint for Fly.io health checks
- **Added**: `/api/info` endpoint for API documentation

## Deployment Instructions

### 1. Deploy to Fly.io:
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and create app
fly auth login
fly launch --name mathematical-wallpaper-api

# Deploy
fly deploy
```

### 2. Update Frontend Environment:
- Production API URL: `https://mathematical-wallpaper-api.fly.dev/api`
- Frontend automatically switches based on `import.meta.env.PROD`

### 3. Deploy Frontend to Vercel:
```bash
# Frontend will now work with production API
npm run build
vercel deploy --prod
```

## Architecture Benefits

### Memory-Only Image Generation:
- ✅ No filesystem persistence required
- ✅ Stateless request/response model
- ✅ Scales horizontally on Fly.io
- ✅ No cleanup required between requests

### Production Optimizations:
- ✅ Gunicorn WSGI server with 2 workers, 4 threads
- ✅ Health checks and auto-scaling
- ✅ CORS configured for `sakshamsingh.dev` domain
- ✅ Error handling and structured logging
- ✅ Non-root Docker container for security

### Cost Efficiency:
- ✅ Fly.io: Auto-stop/start machines → minimal cost when idle
- ✅ Vercel: Static site generation → free tier compatible
- ✅ Small resource footprint (512MB RAM, 1 CPU)

## API Usage

```javascript
// Generate wallpaper
const response = await fetch('https://mathematical-wallpaper-api.fly.dev/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    canvas_width: 1920,
    canvas_height: 1080,
    hue: 'purple',
    pattern: 'mixed',
    cell_size: 12
  })
});

const imageBlob = await response.blob();
const imageUrl = URL.createObjectURL(imageBlob);
```

The refactored backend maintains all mathematical complexity while being optimized for serverless deployment and direct image delivery.