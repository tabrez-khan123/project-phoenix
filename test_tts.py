import requests
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"

headers = {"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"}
payload = {
    "inputs": ["Does the device turn on?"],
    "target_language_code": "en-IN",
    "speaker": "anushka",
    "pace": 1.0,
    "speech_sample_rate": 16000,
    "enable_preprocessing": True,
    "model": "bulbul:v3",
}

try:
    print("Calling Sarvam TTS with speaker: anushka...")
    resp = requests.post(SARVAM_TTS_URL, headers=headers, json=payload, timeout=30)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        print("✅ TTS Success - Got audio")
        data = resp.json()
        if "audios" in data and data["audios"]:
            audio_b64 = data["audios"][0]
            print(f"Audio base64 length: {len(audio_b64)} chars")
    else:
        print(f"Response: {resp.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
