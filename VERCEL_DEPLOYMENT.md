# Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with the mathematical wallpaper API running on Fly.io.

### Prerequisites

1. **Backend API**: The Python backend is deployed at `https://mathematical-wallpaper-api.fly.dev`
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Code pushed to GitHub

### Deployment Steps

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub Integration** (recommended):
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will automatically detect the Astro framework
   - Deploy with default settings

3. **Deploy via CLI**:
   ```bash
   vercel
   ```

### Configuration

- **Framework**: Astro (auto-detected)
- **Build Command**: `npm run build` 
- **Output Directory**: `dist`
- **API Proxy**: `/api/*` routes are proxied to the Fly.io backend
- **Environment Variables**: Production API URL is pre-configured

### Environment Variables

The project uses the production API by default. For local development:

```bash
# Copy environment template
cp .env.example .env.local

# Edit for local development (optional)
PUBLIC_API_URL=http://localhost:5000
```

### Performance Features

- **Static Generation**: All pages pre-rendered for maximum speed
- **Asset Caching**: Static assets cached for 1 year
- **Distributed Rendering**: 8.8x more efficient background generation
- **Client-side Caching**: Backgrounds cached in browser localStorage

### Verification

After deployment, test the following:
- ✅ Home page loads with background generator
- ✅ Work portfolio pages display correctly  
- ✅ Background generation works (both traditional and distributed modes)
- ✅ API calls reach the Fly.io backend
- ✅ Theme switching functions properly

### API Integration

The frontend automatically uses:
- **Production**: `https://mathematical-wallpaper-api.fly.dev` 
- **Development**: `http://localhost:5000` (when `PUBLIC_API_URL` is set)

API routes are proxied through Vercel for seamless integration.