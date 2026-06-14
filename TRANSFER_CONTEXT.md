# Phoenix v2 Transfer Context

## Project Overview
This repository contains Project Phoenix, a device assessment platform with:
- A FastAPI backend in `backend/phoenix_backend.py`
- A frontend app in `frontend/index.html` + `frontend/app.js`
- Celery integration for asynchronous finalization tasks
- MongoDB data storage
- YOLOv8-based visual assessment and LLM-driven recommendation pipeline
- Optional voice diagnostics using Sarvam TTS / STT

## Current Status
The app is now working end-to-end in a local development environment with the following fixes applied:
- `backend` package installed in editable mode so `import backend` works from any working directory
- `backend/.env` loaded explicitly from the backend folder
- Frontend finalization results now render a readable report instead of raw JSON
- Frontend reverse-geocoding now uses OpenStreetMap/Nominatim instead of the old geocode API requiring a key
- Backend agent pipeline now fails loudly instead of silently returning `unknown` results
- Celery task fallback path was hardened so the system still completes when Redis/broker is unavailable

## Important Files
- `backend/phoenix_backend.py` — main API server, video upload/assessment, voice endpoints, agent pipeline
- `backend/tasks.py` — Celery task wrapper for the finalize pipeline
- `backend/celery_app.py` — Celery app configuration
- `frontend/app.js` — frontend UI logic, video upload, voice handling, polling
- `frontend/index.html` — UI container and output panel
- `frontend/styles.css` — styling for status and result display
- `celery_worker.py` — root-level Celery app entrypoint
- `run_backend.ps1` — backend startup helper
- `run_worker.ps1` — Celery worker startup helper
- `TRANSFER_CONTEXT.md` — this file

## Recent Fixes
### Backend
- Explicitly load `backend/.env` with `dotenv_path=backend/.env`
- Added `pyproject.toml` and `setup.cfg` and installed package in editable mode
- Added `sys.path` root insertion for `backend/phoenix_backend.py` and `backend/tasks.py`
- Adjusted `call_agent()` to raise detailed errors on Gemini failures
- Updated `run_agent_pipeline()` to stop if any agent fails
- Updated `classify_damage_on_crop()` to fail instead of returning dummy values

### Frontend
- `reverseGeocode()` now uses `https://nominatim.openstreetmap.org/reverse` and logs failed responses
- Final report display now prints a readable result with Passport ID, status, recommendation, summary, and timings
- UI error handling now highlights backend failures in red and populates the result panel with the error message

## How to Run Locally
From the project root (`phoenixv2`):

```powershell
# Install project and requirements (if not already installed)
& "C:/Users/Mirza Zabiullah/AppData/Local/Programs/Python/Python311/python.exe" -m pip install -r backend/requirements.txt
& "C:/Users/Mirza Zabiullah/AppData/Local/Programs/Python/Python311/python.exe" -m pip install -e .

# Start backend
./run_backend.ps1

# In another terminal, start frontend server
cd frontend
python -m http.server 8080
```

If you want a Celery worker and Redis:
- Start Redis locally or via WSL
- Run `./run_worker.ps1`

## Known Good Test
A test script exists: `test_e2e_ui.py`
It performs:
1. Video upload
2. Voice question flow via transcript answers
3. Finalization request
4. Status polling until completion

## Notes for the New Account
- Ensure `backend/.env` contains valid values for:
  - `GEMINI_API_KEY`
  - `SARVAM_API_KEY`
  - `MONGO_URI`
  - `YOLO_MODEL_PATH`
- Prefer running from the repository root, or use `run_backend.ps1` and `run_worker.ps1`
- If Redis is unavailable, the backend can still finish using the fallback thread, but Celery should be enabled for production

## Current Issue to Watch
If the report still says `unknown`, the problem is likely an external agent failure, not the UI. Check backend logs for detailed Gemini/agent error messages.
