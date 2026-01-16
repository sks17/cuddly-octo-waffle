---
title: WALLS Mental Health Assessment Platform
publishDate: 2025-01-10 00:00:00
img: /assets/WallsDemo2.gif
img_alt: WALLS mental health platform demo showing assessment flow and interactive dashboard
description: |
  A comprehensive mental health assessment platform using PyTorch for stress, anxiety, and depression screening with interactive dashboards and local demo mode.
tags:
  - SinghDevs
  - Python 3.12
  - Flask
  - PyTorch
  - Machine Learning
  - Chart.js
  - Three.js
  - Firebase
---

> **Note:** This is a standalone web implementation with the same ML model architecture. For the mobile version of this project, contact sks17@outlook.com.

## Overview

WALLS is a Flask + PyTorch mental health screening platform with a local demo mode (CSV storage) and optional Firebase authentication. The system provides survey-based screening for stress, anxiety, and depression, using machine learning inference to generate predictions and metrics displayed through interactive dashboards.

The platform is designed to work both online (with Firebase) and offline (with local CSV storage), making it ideal for demonstrations, presentations, and deployments where cloud dependencies may not be available.

## Features

### Assessments + Inference
- Survey-based screening flow (stress/anxiety/depression)
- PyTorch model inference using the included `ml/model.pt`
- Prediction history + metrics endpoints for dashboards

### Dashboard + Visuals
- 2D charts via Chart.js (loaded via CDN)
- 3D visual components via Three.js
- Refresh + persistence (history/metrics backfilled from storage)

### Demo Mode (Offline)
- No Firebase required
- Local CSV persistence under `user_data/demo/`
- Seed script for consistent presentation data

### Optional Firebase
- Firebase Admin + Firestore when credentials are present
- Falls back to local store when unavailable (demo-friendly)

## Architecture

![WALLS Platform Architecture](/assets/WallsBigSplash.png)

At a high level:

1. Browser loads Flask-rendered templates (`templates/`) and static JS (`Static/js/`)
2. Frontend calls API endpoints under `/api/v2/*` for predictions, history, and metrics
3. Backend runs inference through `ml/` and stores results via `services/user_store.py`:
   - Firestore when configured
   - CSV demo store when not

The system is structured to support both cloud and local deployments:

- **Frontend**: Flask templates + vanilla JavaScript
- **ML Layer**: PyTorch for mental health assessment inference
- **Visualization**: Chart.js for 2D charts, Three.js for 3D components
- **Backend**: Flask API with RESTful endpoints
- **Storage**: Dual-mode storage (Firebase Firestore or local CSV)
- **Authentication**: Optional Firebase Auth with demo fallback

Most interactions happen through the API layer, with the frontend making requests for predictions, historical data, and aggregated metrics.

## See It In Action

![WALLS Demo](/assets/WallsDemo2.gif)

## Build & Development

### Prerequisites

- Python 3.12.x
- pip
- (Optional) Node.js if you're touching the Firebase/FullCalendar frontend packages

### Quick Start

```powershell
# From the repo root
pip install -r requirements.txt
python app.py
```

App runs at `http://127.0.0.1:5000` by default.

### Demo Mode (Offline)

This is the fastest "works everywhere" path.

```powershell
# Seed demo data (creates/updates CSVs)
python init_demo_data.py

# Start the server
python app.py
```

Notes:
- Demo data persists in `user_data/demo/*.csv`
- In demo mode, any login is treated as the same effective demo user

Example credentials (if you want something consistent for demos):
- Email: `demo@example.com`
- Password: `demo1234`

### Environment Variables

Copy the template and edit:

```powershell
Copy-Item env.example.txt .env
```

Minimum for local dev:

| Variable | Required | Description |
|----------|:--------:|-------------|
| `SECRET_KEY` | Yes | Flask session/signing key |
| `FLASK_ENV` | No | `development` recommended |
| `FLASK_DEBUG` | No | `true` for debug |
| `PORT` | No | Default `5000` |

Firebase (optional): see `env.example.txt` for the full set.

### Common Endpoints

- `GET /api/v2/status` – API status
- `POST /api/v2/predict` – run inference
- `GET /api/v2/history` – recent evaluations
- `GET /api/v2/metrics` – aggregate metrics for dashboard

## Project Structure

```text
WALLSAI/
├── app.py                      # Flask entrypoint
├── src/
│   └── api.py                   # /api/v2/* endpoints
├── api/                         # additional API blueprint(s)
├── services/
│   ├── user_store.py            # storage abstraction (Firestore or local demo store)
│   └── local_store.py           # CSV-backed demo store
├── ml/
│   ├── model.py                 # model definition
│   ├── preprocess.py            # feature prep
│   └── model.pt                 # trained weights
├── templates/                   # Flask templates
├── Static/
│   ├── js/                      # dashboard + survey + API client JS
│   └── images/
└── user_data/
    └── demo/                    # demo CSVs (evaluations/profiles/notes)
```

## Technical Implementation

The core of WALLS is built around a flexible storage abstraction that allows the same codebase to work both online and offline. The `services/user_store.py` module provides a unified interface that automatically switches between Firestore and local CSV storage based on available credentials.

The machine learning pipeline uses PyTorch with a trained model (`ml/model.pt`) that processes survey responses through preprocessing layers before generating predictions. The model architecture is designed to be lightweight and fast, with inference typically completing in under 100ms.

The frontend visualization layer combines multiple libraries:
- **Chart.js** for standard 2D charts (line graphs, bar charts, histograms)
- **Three.js** for 3D visual components (when enabled)
- **FullCalendar** for timeline and scheduling features

All API endpoints follow RESTful conventions and return JSON responses. The `/api/v2/*` namespace provides versioned endpoints for future compatibility.

## Notes for Contributors

- Keep demo mode working (no Firebase required) to support offline demos
- Prefer changes that keep `/api/v2/history` and `/api/v2/metrics` stable, since the dashboard relies on them
- Test both Firebase and local storage modes when making storage-related changes
- Follow the existing code structure for new API endpoints

## What This Is For

WALLS exists to provide accessible mental health screening through a web interface that works anywhere, with or without cloud infrastructure. By supporting both online and offline modes, the platform can be demonstrated, tested, and deployed in a wide range of environments.

The dual-mode architecture makes it particularly useful for:
- Academic presentations and demos
- Healthcare settings with privacy restrictions
- Development and testing environments
- Deployments in areas with limited connectivity
