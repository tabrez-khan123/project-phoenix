# Project Phoenix Backend

This backend implements the core device assessment and multi-agent decision pipeline for Project Phoenix.

## Files

- `phoenix_backend.py` - main FastAPI application.
- `requirements.txt` - Python dependencies.
- `.env.example` - environment variable template.

## Running locally

1. Install dependencies:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Copy `.env.example` to `.env` and fill in the API keys and Mongo URI.
3. Start the app:
   ```bash
   uvicorn phoenix_backend:app --reload --port 8000
   ```

## Notes

- The backend expects YOLO model weights at the path set by `YOLO_MODEL_PATH`.
- Sarvam TTS/STT and Gemini calls require valid API keys.
- MongoDB is used for assessment persistence, impact ledger, and nearby resource lookups.
