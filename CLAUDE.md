# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Phoenix v2 is a device condition assessment platform for circular economy pathways. Users capture a short video of an electronic device; the system visually analyzes damage, conducts a voice-driven diagnostic interview, then runs a 5-agent LLM pipeline to recommend repair/donate/resell/harvest/recycle.

## Running the Project

**Prerequisites:** Python venv, Redis (for Celery), MongoDB instance, API keys in `backend/.env`.

```powershell
# Setup (once)
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
copy backend\.env.example backend\.env   # then fill in keys

# Run all three processes (separate terminals)
uvicorn backend.phoenix_backend:app --reload --port 8000
python -m celery -A celery_worker worker --loglevel=info --concurrency=2
cd frontend && python -m http.server 8080
```

PowerShell convenience scripts: `./run_backend.ps1` and `./run_worker.ps1`.

**Environment variables** (in `backend/.env`):
- `GEMINI_API_KEY` — Gemini Vision + LLM agents
- `SARVAM_API_KEY` — TTS/STT for voice diagnostics
- `MONGO_URI` — MongoDB connection string
- `YOLO_MODEL_PATH` — path to `yolov8n.pt` (default: repo root)
- `CELERY_BROKER` / `CELERY_BACKEND` — Redis URLs (default: `redis://localhost:6379/0`)

**Testing:**
```bash
python test_e2e_ui.py        # full end-to-end flow
python test_upload_video.py  # video upload + frame extraction only
python test_tts.py           # Sarvam TTS smoke test
python test_video_api.py     # video analysis API
python test_voice_api.py     # voice/STT API
```

## Architecture

### Request Flow

1. **Video upload** → `POST /api/analyze-video` — extracts 5 frames, runs YOLOv8 to localize the device, crops the region, calls Gemini Vision for damage classification. Returns a `session_id` and condition report.
2. **Voice diagnostics** — frontend polls `GET /api/diagnostic-questions/{session_id}` for adaptive follow-up questions; user answers via microphone → `POST /api/voice-response` (Sarvam STT) or typed text.
3. **Finalization** → `POST /api/finalize/{session_id}` — enqueues a Celery task (`tasks.py: finalize_task`) that runs the 5-agent Gemini pipeline asynchronously.
4. **Result polling** → `GET /api/results/{session_id}` — frontend polls until `status: complete`.
5. Results persisted to MongoDB with a `passport_id`; cumulative impact tracked in `impact_ledger` collection.

### Backend (`backend/phoenix_backend.py`)

Single large FastAPI module (~38 KB). Key sections:
- **YOLO frame processing** — extracts frames from uploaded video, detects device bounding box, crops
- **Gemini Vision** — damage classification from cropped device image
- **Sarvam TTS/STT** — converts diagnostic questions to audio; converts user voice replies to text
- **5-agent pipeline** — sequential Gemini calls for Repair, Value, Circularity, Impact, and Action agents; all run inside the Celery worker
- **MongoDB collections**: `assessments`, `impact_ledger`, `ngo_schools`, `repair_shops`, `voice_sessions`, `pipeline_stats`

### Async Processing (`celery_app.py`, `celery_worker.py`, `backend/tasks.py`)

The full agent pipeline is offloaded to Celery. `celery_worker.py` is the entry point; `backend/tasks.py` contains `finalize_task` which calls the pipeline logic from `phoenix_backend.py` and persists results.

### Frontend (`frontend/`)

Vanilla JS + HTML5 — no build step required. Three-phase UI:
1. Camera capture (WebRTC) and video upload
2. Voice diagnostic interview (Web Speech API + Sarvam TTS audio playback)
3. Recommendation display with polling

`app.js` handles the entire flow: camera management, audio playback with browser TTS fallback, result polling, and progress visualization.

## Key External Dependencies

| Service | Purpose |
|---|---|
| Gemini API | Vision damage classification + all 5 LLM agents |
| Sarvam API | Indian-language TTS and STT for voice diagnostics |
| YOLOv8 (`yolov8n.pt`) | Device localization in video frames |
| MongoDB | Assessment persistence, impact ledger, lookup data |
| Redis + Celery | Async agent pipeline execution |
| Nominatim (OSM) | Reverse geocoding for location display |
