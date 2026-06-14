# Project Phoenix Frontend

This frontend provides a browser-based, zero-text workflow for the Project Phoenix backend.

## Features

- Camera capture for device video frames
- Voice-guided diagnostics with Sarvam TTS/STT
- Geolocation capture and reverse geocoding
- Final recommendation playback and action summary

## Run locally

1. Start the backend in `backend/`:
   ```bash
   uvicorn phoenix_backend:app --reload --port 8000
   ```
2. Serve the frontend from the `frontend/` folder. For example:
   ```bash
   cd frontend
   python -m http.server 8080
   ```
3. Open `http://localhost:8080` in your browser.

## Notes

- The frontend is configured to call `http://localhost:8000` for the backend API.
- Use a modern browser with camera and microphone access.
- The app currently uses `audio/webm` recording for browser compatibility.
