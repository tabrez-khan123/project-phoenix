# Project Phoenix

This workspace contains the backend for the Project Phoenix device lifecycle intelligence platform.

## Backend

The backend is implemented in `backend/phoenix_backend.py` using FastAPI.

### Setup

From the project root (`phoenixv2`):

1. Create a Python virtual environment:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Copy the environment example:
   ```bash
   copy backend\.env.example backend\.env
   ```
4. Set the required environment variables in `backend\.env`:
   - `GEMINI_API_KEY`
   - `SARVAM_API_KEY`
   - `MONGO_URI`
   - `YOLO_MODEL_PATH`

### Run backend

From the project root (`phoenixv2`), start the backend with the package path:

```bash
uvicorn backend.phoenix_backend:app --reload --port 8000
```

Or use the convenience script on Windows:

```powershell
./run_backend.ps1
```

### Running Celery worker

From the project root (`phoenixv2`):

```bash
python -m celery -A celery_worker worker --loglevel=info --concurrency=2
```

Or use the convenience script on Windows:

```powershell
./run_worker.ps1
```

### Endpoints

- `POST /api/assess/video`
- `GET /api/voice/question`
- `POST /api/voice/answer`
- `POST /api/assess/finalize`
- `GET /api/results/{passport_id}`
- `GET /api/impact`
- `GET /health`

## Frontend

The `frontend/` directory contains a browser-based UI that integrates with the backend.

To run it locally:

1. Start the backend:
   ```bash
   cd backend
   uvicorn phoenix_backend:app --reload --port 8000
   ```
2. Serve the frontend from `frontend/`:
   ```bash
   cd frontend
   python -m http.server 8080
   ```
3. Visit `http://localhost:8080`.
