import os
import sys
from pathlib import Path
import re
import uuid
import base64
import json
import tempfile
from datetime import datetime, timezone
from typing import Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from fastapi import FastAPI, UploadFile, File, Form, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from ultralytics import YOLO


# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

# Ensure project root is on sys.path so importing `backend` works
# even when the process is started from inside the `backend/` directory.
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY", "")
MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://mirzazabiullah16_db_user:jvx9ts0neVACQRtw@cluster0.qymqrqh.mongodb.net/?appName=Cluster0")

GEMINI_TEXT_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
GROQ_TEXT_MODEL = "llama-3.1-8b-instant"
SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"
SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"

# YOLOv8 pretrained weights
YOLO_MODEL_PATH = os.environ.get("YOLO_MODEL_PATH", "yolov8n.pt")

DB = MongoClient(MONGO_URI)["phoenix"]
ASSESSMENTS = DB["assessments"]
IMPACT_LEDGER = DB["impact_ledger"]
NGO_SCHOOLS = DB["ngo_schools"]
REPAIR_SHOPS = DB["repair_shops"]
SESSIONS = DB["voice_sessions"]  # tracks in-progress voice diagnostic flows
PIPELINE_STATS = DB["pipeline_stats"]
DONATIONS = DB["donations"]


# ---------------------------------------------------------------------------
# YOLO — VISUAL CONDITION ASSESSMENT
# ---------------------------------------------------------------------------

_yolo_model = None


def get_yolo_model():
    """Lazy-load YOLOv8 pretrained model (cached across requests)."""
    global _yolo_model
    if _yolo_model is None:
        _yolo_model = YOLO(YOLO_MODEL_PATH)
    return _yolo_model


# Create a requests.Session with retries to improve reliability and reduce repeated cold setups
SESSION = requests.Session()
retries = Retry(total=3, backoff_factor=0.5, status_forcelist=(429, 500, 502, 503, 504))
adapter = HTTPAdapter(max_retries=retries)
SESSION.mount("https://", adapter)
SESSION.mount("http://", adapter)



DEVICE_CLASSES = {"laptop", "cell phone", "tv", "keyboard", "remote"}


def run_yolo_on_frames(frames_b64: list[str]) -> dict:
    """
    Runs YOLOv8 on each frame to localize the device and crop the region of
    interest. Returns top 3 crops (sorted by YOLO confidence) so the vision
    model has multiple angles — increasing the chance of seeing a logo.
    """
    import cv2
    import numpy as np

    model = get_yolo_model()
    candidate_crops = []  # list of (confidence, crop_b64, detection_info)
    all_detections = []

    for frame_b64 in frames_b64:
        try:
            img_bytes = base64.b64decode(frame_b64)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is None:
                continue

            results = model(img, verbose=False)[0]

            for box in results.boxes:
                cls_name = model.names[int(box.cls[0])]
                conf = float(box.conf[0])
                all_detections.append({"class": cls_name, "confidence": conf})

                if cls_name in DEVICE_CLASSES:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    crop = img[max(0, y1):y2, max(0, x1):x2]
                    if crop.size > 0:
                        _, buf = cv2.imencode(".jpg", crop)
                        crop_b64 = base64.b64encode(buf).decode("utf-8")
                        candidate_crops.append((conf, crop_b64, {
                            "class": cls_name, "confidence": conf, "bbox": [x1, y1, x2, y2]
                        }))
        except Exception as e:
            print(f"Error processing frame: {e}")
            continue

    # Sort by confidence descending, keep top 3
    candidate_crops.sort(key=lambda x: x[0], reverse=True)
    top_crops = candidate_crops[:3]

    best_detection = top_crops[0][2] if top_crops else None
    best_crop_b64 = top_crops[0][1] if top_crops else (frames_b64[0] if frames_b64 else None)
    top_crops_b64 = [c[1] for c in top_crops] if top_crops else [frames_b64[0]] if frames_b64 else []

    return {
        "detections": all_detections,
        "best_detection": best_detection,
        "best_crop_b64": best_crop_b64,
        "top_crops_b64": top_crops_b64,
    }


def extract_frames_from_video(video_path: str, count: int = 5) -> list[str]:
    """Extract a handful of evenly spaced frames from the uploaded video."""
    import cv2

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return []

    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    frames = []

    if frame_count > 0:
        indices = []
        for i in range(count):
            idx = int(((i + 0.5) / count) * frame_count)
            if idx >= frame_count:
                idx = frame_count - 1
            if idx < 0:
                idx = 0
            indices.append(idx)

        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret or frame is None:
                continue
            _, buf = cv2.imencode('.jpg', frame)
            frames.append(base64.b64encode(buf).decode('utf-8'))
    else:
        read = 0
        while read < count:
            ret, frame = cap.read()
            if not ret or frame is None:
                break
            _, buf = cv2.imencode('.jpg', frame)
            frames.append(base64.b64encode(buf).decode('utf-8'))
            read += 1

    cap.release()
    return frames


def classify_damage_on_crop(crop_b64: str, extra_crops_b64: list[str] | None = None) -> dict:
    """
    Sends the YOLO-localized device crop to Groq vision for damage classification.
    Falls back to a default report if the call fails.
    """
    prompt = """You are a forensic device identification and condition assessment expert. Analyze this image with extreme precision.

=== STEP 1: BRAND IDENTIFICATION (highest priority) ===
Look for these brand logos/text in order of reliability:

SMARTPHONES — logos appear on: back panel (center/top), earpiece area, camera module label, charging port chin
  • Apple: bitten-apple logo (silver/grey metallic outline), never has any text on back
  • Samsung: "SAMSUNG" printed text in thin sans-serif capitals on back panel
  • Xiaomi/Redmi: "REDMI" or "Xiaomi" or "mi" text on back; Redmi Note series says "REDMI NOTE" clearly
  • OnePlus: "OnePlus" wordmark or circular oxygen icon
  • Realme: "realme" lowercase italic wordmark
  • Vivo: "vivo" lowercase wordmark
  • OPPO: "OPPO" text
  • Google Pixel: "G" logo on back or "Google" text
  • Motorola: batwing "M" logo
  • Nokia: "Nokia" wordmark
  • Huawei/Honor: "HUAWEI" or "HONOR" text

LAPTOPS — logos appear on: lid center, palm rest, near keyboard, sticker on bottom
  • Apple: glowing/matte bitten-apple on lid
  • Dell: "DELL" text, "Inspiron"/"XPS"/"Latitude" labels
  • HP: blue shield logo or "hp" lowercase
  • Lenovo: "LENOVO" or "ThinkPad"/"IdeaPad" text
  • ASUS: "ASUS" text with stylized A
  • Acer: "acer" lowercase or triangle logo
  • Microsoft Surface: "Surface" wordmark on lid

CRITICAL RULES:
1. Read any visible TEXT or LOGO character by character. If you can see "REDMI" written anywhere, output brand: "Xiaomi" and model_guess: "Redmi [series if visible]".
2. DO NOT confuse brands by body shape alone. A rectangular glass-back phone is NOT automatically Samsung.
3. If camera configuration visible: single cam=budget, triple/quad cam=mid-range, periscope=premium.
4. If you genuinely cannot see ANY logo or text (device face-down with no markings visible), output brand: "unidentified" — never fabricate.

=== STEP 2: MODEL IDENTIFICATION ===
After confirming brand, identify model by:
- Camera count + arrangement (horizontal strip = Redmi/Samsung budget, matrix = premium)
- Screen notch/punch-hole: teardrop=Redmi older, centered hole=Redmi 10+, pill=iPhone 14+, no notch=flagship
- Visible model number text (e.g. "Note 12", "A54", "13 Pro")
- Approximate screen size relative to bezels

=== STEP 3: DAMAGE ASSESSMENT ===

SCREEN INSPECTION — scan every pixel of the display area:

  What cracks look like:
  • Dark or bright lines radiating outward from a single impact point (spider-web pattern)
  • Straight or curved fracture lines crossing the glass, often with white/silver edges
  • Shattered areas where glass is visibly splintered or missing
  • LCD bleed: dark ink-blot patches, purple/pink zones, black regions spreading from damage
  • Dead lines: thin horizontal or vertical black/white lines across the display

  Classification rules — apply in order:
  1. If the ENTIRE screen is black with no image visible → "dead"
  2. If you see multiple intersecting fracture lines or large missing glass sections → "shattered"
  3. If you see ANY single crack, fracture line, or spider-web pattern ANYWHERE on the glass → "cracked"
  4. If the glass is completely clear with zero lines, scratches, or marks → "intact"
  NEVER output "intact" if any fracture, line, or bleed is visible. When in doubt, choose "cracked" over "intact".

CHASSIS — examine edges, corners, back panel in every image:
  • "none"  = zero marks, pristine surface
  • "minor" = surface scuffs, micro-scratches, light dents — structural integrity intact
  • "major" = bent/warped frame, deep gouges, back glass cracked/shattered, corrosion, missing pieces

CONDITION SCORE — strict arithmetic, not a guess:
  Start at 10. Subtract:
  • screen_condition "cracked"   → −5
  • screen_condition "shattered" → −7
  • screen_condition "dead"      → −8
  • chassis_damage "minor"       → −1
  • chassis_damage "major"       → −3
  Floor at 1. Ceiling at 10.
  Example: cracked screen + minor chassis = 10 − 5 − 1 = 4

powers_on: output true unless screen is visibly black/dead AND structural damage is visible.

Respond ONLY with valid JSON:
{
  "device_type": "smartphone",
  "brand": "Xiaomi",
  "model_guess": "Redmi Note 12",
  "screen_condition": "intact",
  "chassis_damage": "minor",
  "ports_visible": ["USB-C"],
  "powers_on": true,
  "overall_condition_score": 7,
  "identification_confidence": "high",
  "identification_evidence": "REDMI text clearly visible on back panel"
}"""

    # Upscale each crop to at least 720px on the longest side before sending.
    # Larger images dramatically improve crack line and logo text visibility.
    def _upscale_b64(b64_str: str, min_dim: int = 720) -> str:
        import cv2, numpy as np
        try:
            img_bytes = base64.b64decode(b64_str)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is None:
                return b64_str
            h, w = img.shape[:2]
            if max(h, w) < min_dim:
                scale = min_dim / max(h, w)
                new_w, new_h = int(w * scale), int(h * scale)
                img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
            _, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 92])
            return base64.b64encode(buf).decode("utf-8")
        except Exception:
            return b64_str

    all_crops = [crop_b64] + (extra_crops_b64 or [])
    all_crops = all_crops[:3]
    all_crops = [_upscale_b64(c) for c in all_crops]

    content_blocks = [{"type": "text", "text": prompt}]
    for i, c in enumerate(all_crops):
        if i > 0:
            content_blocks.append({"type": "text", "text": f"[Frame {i + 1} — different angle of same device:]"})
        content_blocks.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{c}"}})

    payload = {
        "model": GROQ_VISION_MODEL,
        "messages": [{"role": "user", "content": content_blocks}],
        "response_format": {"type": "json_object"},
        "max_tokens": 700,
        "temperature": 0,
    }

    resp = None
    try:
        resp = requests.post(
            GROQ_URL,
            json=payload,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            timeout=30,
        )
        resp.raise_for_status()
        text = resp.json()["choices"][0]["message"]["content"]
        text = text.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(text)
    except Exception as e:
        body = ""
        try:
            body = resp.text
        except Exception:
            body = "<no response body>"
        print(f"[GROQ VISION FALLBACK] classify_damage_on_crop failed: {e}. Body: {body}", flush=True)
        return {
            "device_type": "unknown",
            "brand": "unknown",
            "model_guess": "unknown",
            "screen_condition": "unknown",
            "chassis_damage": "unknown",
            "ports_visible": [],
            "powers_on": "unknown",
            "overall_condition_score": 5,
            "_groq_error": str(e),
        }


def assess_video_frames(frames_b64: list[str]) -> dict:
    """
    Full visual assessment pipeline:
      1. YOLO localizes the device across all frames, returns top 3 crops by confidence
      2. Vision model receives all 3 crops simultaneously — multiple angles
         dramatically improve logo/brand text detection accuracy
      3. Returns merged condition_report
    """
    yolo_result = run_yolo_on_frames(frames_b64)
    top_crops = yolo_result.get("top_crops_b64", [])
    primary = top_crops[0] if top_crops else yolo_result["best_crop_b64"]
    extras = top_crops[1:] if len(top_crops) > 1 else []
    condition_report = classify_damage_on_crop(primary, extra_crops_b64=extras)
    condition_report["_yolo_detections"] = yolo_result["detections"]
    condition_report["_yolo_best_detection"] = yolo_result["best_detection"]
    return condition_report


# ---------------------------------------------------------------------------
# SARVAM — VOICE-GUIDED DIAGNOSTICS
# ---------------------------------------------------------------------------

# Sarvam bulbul:v2 — one supported speaker per language
SARVAM_SPEAKERS = {
    "en-IN": "anushka",
    "hi-IN": "anushka",
    "ur-IN": "anushka",
    "te-IN": "arjun",
    "ta-IN": "arvind",
    "mr-IN": "anushka",
    "bn-IN": "anushka",
}

# Question texts pre-translated per language so Sarvam speaks naturally
QUESTION_TEXTS = {
    "powers_on": {
        "en-IN": "Does the device turn on when you press the power button?",
        "hi-IN": "क्या डिवाइस पावर बटन दबाने पर चालू होती है?",
        "ur-IN": "کیا ڈیوائس پاور بٹن دبانے سے آن ہوتی ہے؟",
        "te-IN": "పవర్ బటన్ నొక్కినప్పుడు పరికరం ఆన్ అవుతుందా?",
        "ta-IN": "பவர் பட்டனை அழுத்தும்போது சாதனம் இயங்குகிறதா?",
        "mr-IN": "पॉवर बटण दाबल्यावर डिव्हाइस चालू होते का?",
        "bn-IN": "পাওয়ার বাটন চাপলে ডিভাইসটি চালু হয় কি?",
    },
    "screen_responsive": {
        "en-IN": "The screen appears damaged. Does it still respond to touch?",
        "hi-IN": "स्क्रीन क्षतिग्रस्त दिखती है। क्या यह अभी भी टच पर प्रतिक्रिया देती है?",
        "ur-IN": "اسکرین خراب لگتی ہے۔ کیا یہ اب بھی ٹچ پر ردعمل دیتی ہے؟",
        "te-IN": "స్క్రీన్ దెబ్బతిన్నట్లు కనిపిస్తోంది. అది ఇంకా టచ్‌కు స్పందిస్తుందా?",
        "ta-IN": "திரை சேதமடைந்ததாக தெரிகிறது. அது இன்னும் தொடுதலுக்கு பதிலளிக்கிறதா?",
        "mr-IN": "स्क्रीन खराब दिसते. ती अजूनही टचला प्रतिसाद देते का?",
        "bn-IN": "স্ক্রিনটি ক্ষতিগ্রস্ত মনে হচ্ছে। এটি কি এখনও টাচে সাড়া দেয়?",
    },
    "charging_works": {
        "en-IN": "Does the device charge normally when you plug it in?",
        "hi-IN": "क्या डिवाइस को प्लग करने पर यह सामान्य रूप से चार्ज होती है?",
        "ur-IN": "کیا ڈیوائس کو پلگ کرنے پر یہ نارمل چارج ہوتی ہے؟",
        "te-IN": "ప్లగ్ చేసినప్పుడు పరికరం సాధారణంగా చార్జ్ అవుతుందా?",
        "ta-IN": "சாதனத்தை சார்ஜ் செய்யும்போது சாதாரணமாக சார்ஜ் ஆகிறதா?",
        "mr-IN": "प्लग केल्यावर डिव्हाइस नेहमीप्रमाणे चार्ज होते का?",
        "bn-IN": "প্লাগ করলে ডিভাইসটি স্বাভাবিকভাবে চার্জ হয় কি?",
    },
    "battery_health": {
        "en-IN": "How is the battery life? Does it drain very fast or last a reasonable amount of time?",
        "hi-IN": "बैटरी लाइफ कैसी है? क्या यह बहुत जल्दी खत्म होती है या ठीक-ठाक समय तक चलती है?",
        "ur-IN": "بیٹری لائف کیسی ہے؟ کیا یہ بہت جلدی ختم ہوتی ہے یا معقول وقت چلتی ہے؟",
        "te-IN": "బ్యాటరీ జీవితం ఎలా ఉంది? అది చాలా త్వరగా అయిపోతుందా లేదా సరైన సమయం ఉంటుందా?",
        "ta-IN": "பேட்டரி ஆயுள் எப்படி உள்ளது? மிக வேகமாக தீர்கிறதா அல்லது சரியான நேரம் நீடிக்கிறதா?",
        "mr-IN": "बॅटरी लाइफ कशी आहे? ती खूप लवकर संपते का की योग्य वेळ टिकते?",
        "bn-IN": "ব্যাটারি লাইফ কেমন? এটি কি খুব দ্রুত শেষ হয় নাকি যুক্তিসঙ্গত সময় ধরে চলে?",
    },
    "battery_replaced": {
        "en-IN": "Has the battery ever been replaced or serviced before?",
        "hi-IN": "क्या बैटरी पहले कभी बदली या सर्विस की गई है?",
        "ur-IN": "کیا بیٹری پہلے کبھی بدلی یا سروس کی گئی ہے؟",
        "te-IN": "బ్యాటరీని ముందే మార్చారా లేదా సర్వీస్ చేశారా?",
        "ta-IN": "பேட்டரி முன்பு மாற்றப்பட்டதா அல்லது சர்வீஸ் செய்யப்பட்டதா?",
        "mr-IN": "बॅटरी आधी कधी बदलली किंवा सर्व्हिस केली आहे का?",
        "bn-IN": "ব্যাটারি কি আগে কখনো বদলানো বা সার্ভিস করা হয়েছে?",
    },
    "physical_damage_detail": {
        "en-IN": "Can you describe the physical damage? For example, is it bent, cracked on the back, or just scratched?",
        "hi-IN": "क्या आप शारीरिक नुकसान का वर्णन कर सकते हैं? जैसे कि मुड़ा हुआ, पीछे से टूटा, या सिर्फ खरोंचा हुआ?",
        "ur-IN": "کیا آپ جسمانی نقصان بیان کر سکتے ہیں؟ جیسے کہ ٹیڑھا، پیچھے سے ٹوٹا، یا صرف خروں چا ہوا؟",
        "te-IN": "భౌతిక నష్టాన్ని వివరించగలరా? వంగి ఉందా, వెనకభాగం పగిలిందా, లేదా కేవలం గీతలు పడ్డాయా?",
        "ta-IN": "உடல் சேதத்தை விவரிக்க முடியுமா? வளைந்துள்ளதா, பின்புறம் விரிசல் உள்ளதா, கீறல்கள் மட்டுமா?",
        "mr-IN": "शारीरिक नुकसानाचे वर्णन करू शकता का? वाकलेले, मागे तडे, किंवा फक्त खरचटलेले?",
        "bn-IN": "শারীরিক ক্ষতি বর্ণনা করতে পারবেন? বাঁকানো, পেছনে ফাটল, নাকি শুধু আঁচড়?",
    },
    "data_present": {
        "en-IN": "Is there important personal data on this device that you still need to back up?",
        "hi-IN": "क्या इस डिवाइस पर कोई महत्वपूर्ण व्यक्तिगत डेटा है जिसका बैकअप अभी नहीं लिया गया?",
        "ur-IN": "کیا اس ڈیوائس پر کوئی اہم ذاتی ڈیٹا ہے جس کا ابھی بیک اپ نہیں لیا گیا؟",
        "te-IN": "ఈ పరికరంలో ముఖ్యమైన వ్యక్తిగత డేటా ఉందా, దాన్ని ఇంకా బ్యాకప్ చేయాల్సి ఉందా?",
        "ta-IN": "இந்த சாதனத்தில் முக்கியமான தனிப்பட்ட தரவு உள்ளதா, இன்னும் காப்புப்பிரதி எடுக்க வேண்டுமா?",
        "mr-IN": "या डिव्हाइसवर महत्त्वाचा वैयक्तिक डेटा आहे का जो अजूनही बॅकअप केलेला नाही?",
        "bn-IN": "এই ডিভাইসে কোনো গুরুত্বপূর্ণ ব্যক্তিগত ডেটা আছে যা এখনো ব্যাকআপ নেওয়া হয়নি?",
    },
    "repair_attempted": {
        "en-IN": "Has anyone attempted to repair this device before, even unofficially?",
        "hi-IN": "क्या किसी ने पहले इस डिवाइस को ठीक करने की कोशिश की है, चाहे अनौपचारिक तरीके से ही?",
        "ur-IN": "کیا کسی نے پہلے اس ڈیوائس کو ٹھیک کرنے کی کوشش کی ہے، چاہے غیر رسمی طور پر؟",
        "te-IN": "ఈ పరికరాన్ని ముందే ఎవరైనా రిపేర్ చేయడానికి ప్రయత్నించారా, అనధికారికంగా అయినా సరే?",
        "ta-IN": "இந்த சாதனத்தை முன்பு யாரேனும் சரிசெய்ய முயற்சித்தார்களா, முறைசாரா ஆனாலும் சரி?",
        "mr-IN": "या डिव्हाइसला आधी कोणी दुरुस्त करण्याचा प्रयत्न केला आहे का, अनधिकृत पद्धतीने देखील?",
        "bn-IN": "এই ডিভাইসটি কি আগে কেউ ঠিক করার চেষ্টা করেছে, অনানুষ্ঠানিকভাবে হলেও?",
    },
    "additional_notes": {
        "en-IN": "Lastly, is there anything else about this device's condition you want to mention?",
        "hi-IN": "अंत में, क्या इस डिवाइस की स्थिति के बारे में कुछ और बताना चाहते हैं?",
        "ur-IN": "آخر میں، کیا اس ڈیوائس کی حالت کے بارے میں کچھ اور بتانا چاہتے ہیں؟",
        "te-IN": "చివరగా, ఈ పరికరం యొక్క స్థితి గురించి మరేమైనా చెప్పాలనుకుంటున్నారా?",
        "ta-IN": "இறுதியாக, இந்த சாதனத்தின் நிலை பற்றி வேறு ஏதாவது குறிப்பிட விரும்புகிறீர்களா?",
        "mr-IN": "शेवटी, या डिव्हाइसच्या स्थितीबद्दल आणखी काही सांगायचे आहे का?",
        "bn-IN": "সবশেষে, এই ডিভাইসের অবস্থা সম্পর্কে আর কিছু বলতে চান?",
    },
}

DIAGNOSTIC_QUESTIONS = [
    {
        "id": "powers_on",
        "trigger": lambda cr: cr.get("powers_on") in ("unknown", None, "null"),
        "text": "Does the device turn on when you press the power button?",
        "answer_type": "boolean",
    },
    {
        "id": "screen_responsive",
        "trigger": lambda cr: cr.get("screen_condition") in ("cracked", "shattered"),
        "text": "The screen appears damaged. Does it still respond to touch?",
        "answer_type": "boolean",
    },
    {
        "id": "charging_works",
        "trigger": lambda cr: cr.get("device_type") in ("laptop", "smartphone"),
        "text": "Does the device charge normally when you plug it in?",
        "answer_type": "boolean",
    },
    {
        "id": "battery_health",
        "trigger": lambda cr: cr.get("device_type") in ("laptop", "smartphone"),
        "text": "How is the battery life? Does it drain very fast or last a reasonable amount of time?",
        "answer_type": "free_text",
    },
    {
        "id": "battery_replaced",
        "trigger": lambda cr: cr.get("device_type") in ("laptop", "smartphone"),
        "text": "Has the battery ever been replaced or serviced before?",
        "answer_type": "boolean",
    },
    {
        "id": "physical_damage_detail",
        "trigger": lambda cr: cr.get("chassis_damage") in ("minor", "major"),
        "text": "Can you describe the physical damage? For example, is it bent, cracked on the back, or just scratched?",
        "answer_type": "free_text",
    },
    {
        "id": "data_present",
        "trigger": lambda cr: True,
        "text": "Is there important personal data on this device that you still need to back up?",
        "answer_type": "boolean",
    },
    {
        "id": "repair_attempted",
        "trigger": lambda cr: True,
        "text": "Has anyone attempted to repair this device before, even unofficially?",
        "answer_type": "boolean",
    },
    {
        "id": "additional_notes",
        "trigger": lambda cr: True,
        "text": "Lastly, is there anything else about this device's condition you want to mention?",
        "answer_type": "free_text",
    },
]


def get_questions_for_condition(condition_report: dict) -> list[dict]:
    """Returns the ordered list of diagnostic questions relevant to this device."""
    return [q for q in DIAGNOSTIC_QUESTIONS if q["trigger"](condition_report)]


def sarvam_text_to_speech(text: str, language_code: str = "en-IN") -> bytes:
    """
    Calls Sarvam TTS. Uses per-language speaker mapping; falls back to anushka.
    Returns raw WAV bytes (decoded from Sarvam's base64 response).
    """
    if not SARVAM_API_KEY:
        print("[TTS] SARVAM_API_KEY not set — skipping TTS", flush=True)
        return b""
    speaker = SARVAM_SPEAKERS.get(language_code, "anushka")
    headers = {"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"}
    payload = {
        "inputs": [text],
        "target_language_code": language_code,
        "speaker": speaker,
        "pace": 1.0,
        "speech_sample_rate": 22050,
        "enable_preprocessing": True,
        "model": "bulbul:v2",
    }
    try:
        resp = SESSION.post(SARVAM_TTS_URL, headers=headers, json=payload, timeout=20)
        if not resp.ok:
            print(f"[TTS ERROR] {resp.status_code} — {resp.text[:300]}", flush=True)
            return b""
        data = resp.json()
        audio_b64 = data.get("audios", [None])[0]
        if not audio_b64:
            print(f"[TTS ERROR] No audio in response: {data}", flush=True)
            return b""
        return base64.b64decode(audio_b64)
    except Exception as e:
        print(f"[TTS EXCEPTION] {type(e).__name__}: {e}", flush=True)
        return b""


def sarvam_speech_to_text(audio_bytes: bytes, language_code: str = "en-IN", mime_type: str = "audio/wav") -> str:
    """
    Calls Sarvam STT to transcribe the user's spoken answer.
    """
    headers = {"api-subscription-key": SARVAM_API_KEY}
    files = {"file": ("answer", audio_bytes, mime_type)}
    data = {"language_code": language_code, "model": "saarika:v1"}
    try:
        resp = SESSION.post(SARVAM_STT_URL, headers=headers, files=files, data=data, timeout=15)
        resp.raise_for_status()
        return resp.json().get("transcript", "")
    except Exception as e:
        print(f"Error in STT: {e}")
        return ""


def parse_voice_answer(transcript: str, answer_type: str):
    """
    Interprets a transcribed spoken answer.
    """
    if answer_type == "free_text":
        return transcript.strip()

    transcript_lower = transcript.strip().lower()

    affirmative_pattern = re.compile(r"\b(yes|yeah|yep|sure|ok|okay|correct|right|ya|yah|yaar|ha|haan|han|ho|aam|haa|thik|sari)\b")
    negative_pattern = re.compile(r"\b(no|nope|nah|nahi|nahin|na|nai|nopes|noes)\b")

    if affirmative_pattern.search(transcript_lower):
        return True
    if negative_pattern.search(transcript_lower):
        return False

    return None  # ambiguous


# ---------------------------------------------------------------------------
# MULTI-AGENT PIPELINE
# ---------------------------------------------------------------------------

AGENT_SYSTEM_PROMPTS = {
    "repair": """Repair Agent for Phoenix circular economy platform. Output valid JSON only.

Use these fields from input: device_brand, device_model, condition_report.screen_condition, condition_report.chassis_damage, condition_report.overall_condition_score, condition_report.user_reported_symptoms, ifixit_data.

RULES:
- primary_issue: name the exact component fault (e.g. "cracked display panel", "degraded battery"). Never "unknown".
- cost_inr: single integer. Indian market rates: screen smartphone ₹2500-8000, screen laptop ₹4000-14000, battery smartphone ₹800-2500, battery laptop ₹2000-5500, port ₹500-1500, keyboard ₹2000-6000, motherboard ₹8000-25000.
- complexity: "local_shop" | "authorized_center" | "diy"
- feasible: false only if condition_score <= 2 OR (chassis_damage="major" AND screen_condition="dead")
- rationale: 1 sentence, name the device and cost. No filler.
- ifixit_repairability_score: from ifixit_data if device_found=true, else null.

Output JSON with keys: feasible, cost_inr, complexity, primary_issue, rationale, ifixit_repairability_score, ifixit_device_url, ifixit_guide_urls""",

    "value": """Value Agent for Phoenix. Output valid JSON only.

Use: device_brand, device_model, device_type, condition_score, repair_output.cost_inr, repair_output.feasible.

Indian second-hand base prices (score 7 = "good"):
Smartphones: iPhone 15 Pro ₹72000, iPhone 14/13 ₹32000, iPhone 12/11 ₹18000, Samsung S24/S23 ₹38000, Samsung A54/A34 ₹14000, OnePlus mid ₹16000, Redmi Note ₹9000, budget Android ₹5000
Laptops: MacBook Pro M-series ₹72000, MacBook Air M ₹52000, MacBook Intel ₹28000, Dell XPS/ThinkPad X1 ₹42000, Dell Inspiron/IdeaPad ₹22000, HP budget ₹16000

Condition multiplier on base price: score 9-10 ×1.0, score 7-8 ×0.75, score 5-6 ×0.50, score 3-4 ×0.28, score 1-2 ×0.10
current_market_inr = ROUND(base × multiplier) — single integer, never a range.
post_repair_inr = ROUND(base × 0.82)
resale_viability: "high" if >15000, "medium" if 5000-15000, "low" if <5000
donation_candidate: true if current_market_inr < 5000

Output JSON with keys: current_market_inr, post_repair_inr, resale_viability, price_basis, donation_candidate""",

    "circularity": """Circularity Agent for Phoenix. Output valid JSON only.

Use: device_brand, device_model, condition_score, condition_report.screen_condition, condition_report.chassis_damage, repair_output.feasible, repair_output.cost_inr, value_output.current_market_inr, value_output.resale_viability, value_output.donation_candidate.

Score each pathway:
resell: 40 + (30 if score>=7) + (20 if resale_viability="high") + (10 if brand Apple/Samsung)
repair: 40 + (35 if feasible AND cost_inr < current_market_inr×0.4) + (15 if screen="cracked") - (20 if not feasible)
donate: 30 + (30 if score 4-6) + (20 if donation_candidate=true) + (10 if device_type="laptop")
harvest: 20 + (40 if score<=2 OR chassis="major") + (20 if not feasible)
recycle: 10 + (50 if powers_on=false AND screen="dead") + (20 if score<=1)

Pick highest score. confidence = min(score, 97).
NEVER output "unknown". recommendation must be one of: repair, donate, resell, harvest, recycle.

Output JSON with keys: recommendation, confidence, alternative, ranked_pathways (array of {pathway, score, reason})""",

    "impact": """You are the Impact Agent for Phoenix. Perform 4 mechanical steps. Do arithmetic. Output exact numbers. NEVER output null, 0, or omit a field.

You will receive a JSON object with these keys you MUST use:
  "device_brand"    → string, e.g. "Xiaomi"
  "device_model"    → string, e.g. "Redmi Note 12"
  "device_type"     → "smartphone" or "laptop"
  "condition_score" → integer 0-10
  "recommendation"  → the chosen pathway string (repair/donate/resell/refurbish/harvest/recycle)

───────────────────────────────────────────────
STEP 1 — Pick manufacturing_co2_kg from this table:

device_type = "smartphone":
  budget  (Redmi, Realme, basic Android)   → 38 kg  → device_category = "smartphone_budget"
  mid     (Redmi Note, Samsung A-series,
           OnePlus Nord, iPhone 11–14)      → 65 kg  → device_category = "smartphone_mid"
  flagship(iPhone 15 Pro, S24+, Pixel 8)   → 95 kg  → device_category = "smartphone_flagship"
  DEFAULT if unsure → 65 kg, "smartphone_mid"

device_type = "laptop":
  consumer (Inspiron, Pavilion, IdeaPad)   → 310 kg → device_category = "laptop_consumer"
  business (MacBook, ThinkPad, XPS)        → 420 kg → device_category = "laptop_business"
  DEFAULT if unsure → 310 kg, "laptop_consumer"

───────────────────────────────────────────────
STEP 2 — Compute co2_avoided_kg using recommendation:

  repair    → co2_avoided_kg = ROUND(manufacturing_co2_kg × 0.82)
  donate    → co2_avoided_kg = ROUND(manufacturing_co2_kg × 0.91)
  resell    → co2_avoided_kg = ROUND(manufacturing_co2_kg × 0.87)
  refurbish → co2_avoided_kg = ROUND(manufacturing_co2_kg × 0.85)
  harvest   → co2_avoided_kg = ROUND(manufacturing_co2_kg × 0.32)
  recycle   → co2_avoided_kg = ROUND(manufacturing_co2_kg × 0.18)

co2_avoided_kg is an INTEGER. Minimum = 7.

───────────────────────────────────────────────
STEP 3 — Compute life_extension_years using recommendation:

  repair    → 3.0 if condition_score >= 6, else 1.5
  donate    → 2.0
  resell    → 2.5
  refurbish → 3.0
  harvest   → 0.5
  recycle   → 0.0

life_extension_years is a FLOAT with one decimal place.

───────────────────────────────────────────────
STEP 4 — Write impact_headline:
One sentence. Include: device brand + model, exact co2_avoided_kg, exact life_extension_years.
Example: "Repairing this Redmi Note 12 avoids 53 kg of CO₂ and extends its life by 3.0 years."

───────────────────────────────────────────────
Respond ONLY with this exact JSON shape. No extra fields, no nulls, no zeros:

{
  "co2_avoided_kg": 53,
  "life_extension_years": 3.0,
  "device_category": "smartphone_mid",
  "manufacturing_co2_kg": 65,
  "sdgs": ["12", "13", "4"],
  "impact_headline": "Repairing this Redmi Note 12 avoids 53 kg of CO₂ and extends its life by 3.0 years."
}""",

    "action": """Action Agent for Phoenix. Output valid JSON only. Tone: expert adviser.

Use: device_brand, device_model, recommendation, repair_output.cost_inr, value_output.current_market_inr, impact_output.co2_avoided_kg, impact_output.life_extension_years.

RULES:
- user_summary: 2 sentences. Name device (brand + model). State recommendation + why (cite cost/value/CO2 figures). No filler.
- next_steps: exactly 3 items, each starting with a verb, specific to the pathway.
- action.label: specific (e.g. "Replace Battery at Local Shop", "List on Cashify")
- cta_url: repair→"https://www.justdial.com/repair-shops" | resell→"https://www.cashify.in" | donate→"https://www.digitaldivide.in" | recycle→"https://www.ewasterecycle.in" | harvest→"https://www.cashify.in"

Output JSON with keys: action (object with type, label, contact_name, contact_address, cta_label, cta_url), user_summary, next_steps""",
}


def call_agent(agent_name: str, context: dict) -> dict:
    """
    Calls a single agent. On 429 rate-limit reads the Retry-After header
    (or the wait time from the error body) and sleeps then retries once.
    """
    import time as _time
    import re as _re

    system_prompt = AGENT_SYSTEM_PROMPTS.get(agent_name, "")
    user_payload = json.dumps(context, default=str)

    payload = {
        "model": GROQ_TEXT_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_payload},
        ],
        "response_format": {"type": "json_object"},
        "max_tokens": 512,
        "temperature": 0,
        "seed": 42,
    }
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}

    for attempt in range(3):
        resp = None
        print(f"[AGENT] Calling {agent_name} (attempt {attempt + 1})...", flush=True)
        try:
            resp = SESSION.post(GROQ_URL, json=payload, headers=headers, timeout=60)
            if resp.status_code == 429:
                # Parse wait time from Retry-After header or error message body
                retry_after = resp.headers.get("retry-after") or resp.headers.get("x-ratelimit-reset-requests")
                wait = 15.0
                if retry_after:
                    try:
                        wait = float(retry_after)
                    except ValueError:
                        pass
                else:
                    # Try to parse "Please try again in Xs" from body
                    try:
                        body_text = resp.text
                        m = _re.search(r"try again in ([\d.]+)s", body_text)
                        if m:
                            wait = float(m.group(1)) + 1.0
                    except Exception:
                        pass
                wait = max(5.0, min(wait, 60.0))
                print(f"[AGENT] {agent_name} 429 rate limit — waiting {wait:.1f}s then retrying...", flush=True)
                _time.sleep(wait)
                continue
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
            print(f"[AGENT] {agent_name} succeeded.", flush=True)
            return json.loads(text)
        except Exception as e:
            if attempt < 2:
                _time.sleep(5)
                continue
            body = ""
            try:
                body = resp.text if resp else "<no response>"
            except Exception:
                pass
            err = f"Agent {agent_name} call failed: {e}. Body: {body}"
            print(err, flush=True)
            return {"_error": err, "_agent": agent_name, "status": "unavailable"}

    return {"_error": f"Agent {agent_name} exceeded retry limit", "_agent": agent_name, "status": "unavailable"}


def run_agent_pipeline(condition_report: dict, diagnostic_answers: dict, user_location: dict, session_id: str = None) -> dict:
    """
    Runs the agent pipeline. Where safe, runs independent agents in parallel.
    Records per-step timing to the session document when `session_id` is provided.
    """
    import time

    def _record_timing(step_name, start, end):
        dur = max(0.0, end - start)
        entry = {"step": step_name, "duration_s": dur, "ts": datetime.now(timezone.utc)}
        if session_id:
            try:
                SESSIONS.update_one({"_id": session_id}, {"$push": {"timings": entry}, "$set": {"progress": step_name}})
            except Exception:
                pass
        # update rolling average for this pipeline step
        try:
            # Use exponential moving average (EMA) so recent runs weigh more.
            alpha = 0.2
            stat = PIPELINE_STATS.find_one({"_id": step_name})
            if stat and stat.get("avg") is not None:
                prev_avg = float(stat.get("avg", dur))
                new_avg = alpha * dur + (1 - alpha) * prev_avg
                new_count = stat.get("count", 0) + 1
                PIPELINE_STATS.update_one({"_id": step_name}, {"$set": {"avg": new_avg, "count": new_count, "last_updated": datetime.now(timezone.utc)}}, upsert=True)
            else:
                PIPELINE_STATS.update_one({"_id": step_name}, {"$set": {"avg": dur, "count": 1, "last_updated": datetime.now(timezone.utc)}}, upsert=True)
        except Exception:
            pass
        print(f"[TIMING] {step_name}: {dur:.2f}s", flush=True)

    clean_cr = {k: v for k, v in condition_report.items() if not k.startswith("_")}
    # Hoist brand/model to top level so agents see them without digging
    ctx = {
        "device_brand": clean_cr.get("brand", "Unknown"),
        "device_model": clean_cr.get("model_guess", "Unknown"),
        "device_type": clean_cr.get("device_type", "Unknown"),
        "condition_score": clean_cr.get("overall_condition_score", 5),
        "condition_report": clean_cr,
        "diagnostic_answers": diagnostic_answers,
    }

    timings = []

    # -----------------------------------------------------------------------
    # iFixit enrichment — fetch real repair data before agents run
    # -----------------------------------------------------------------------
    t0 = time.time()
    try:
        from backend.ifixit import get_repair_data
        brand = condition_report.get("brand", "unknown")
        model = condition_report.get("model_guess", "unknown")
        ifixit_data = get_repair_data(brand, model)
        ctx["ifixit_data"] = ifixit_data
        print(f"[iFixit] Enrichment complete. Device found: {ifixit_data.get('device_found')}", flush=True)
    except Exception as e:
        print(f"[iFixit] Enrichment failed (continuing without): {e}", flush=True)
        ctx["ifixit_data"] = {"source": "iFixit", "device_found": False, "guides": []}
    _record_timing("ifixit_enrichment", t0, time.time())

    # Run agents sequentially to stay under Groq's 6k TPM limit.
    # Parallel calls spike token usage and hit 429 every time.
    t0 = time.time()
    repair_output = call_agent("repair", ctx)
    _record_timing("repair", t0, time.time())

    t0 = time.time()
    value_output = call_agent("value", ctx)
    _record_timing("value", t0, time.time())
    ctx["repair_output"] = repair_output
    ctx["value_output"] = value_output

    # Circularity depends on repair/value outputs
    t0 = time.time()
    try:
        circularity_output = call_agent("circularity", ctx)
    except Exception as e:
        print(f"Agent circularity failed: {e}", flush=True)
        raise
    t1 = time.time()
    _record_timing("circularity", t0, t1)
    ctx["circularity_output"] = circularity_output

    # Impact agent gets a focused, flat context — no nested noise
    # The prompt keys it reads are: device_brand, device_model, device_type,
    # condition_score, and recommendation (flat, not buried in sub-objects).
    recommendation_str = circularity_output.get("recommendation", "repair")
    impact_ctx = {
        "device_brand": ctx.get("device_brand", "Unknown"),
        "device_model": ctx.get("device_model", "Unknown"),
        "device_type": ctx.get("device_type", "smartphone"),
        "condition_score": ctx.get("condition_score", 5),
        "recommendation": recommendation_str,
    }
    t0 = time.time()
    try:
        impact_output = call_agent("impact", impact_ctx)
    except Exception as e:
        print(f"Agent impact failed: {e}", flush=True)
        raise
    t1 = time.time()
    _record_timing("impact", t0, t1)
    ctx["impact_output"] = impact_output

    ctx["user_location"] = user_location
    ctx["nearby_ngo_schools"] = list(NGO_SCHOOLS.find({"city": user_location.get("city", "")}, {"_id": 0}).limit(3))
    ctx["nearby_repair_shops"] = list(REPAIR_SHOPS.find({"city": user_location.get("city", "")}, {"_id": 0}).limit(3))

    t0 = time.time()
    try:
        action_output = call_agent("action", ctx)
    except Exception as e:
        print(f"Agent action failed: {e}", flush=True)
        raise
    t1 = time.time()
    _record_timing("action", t0, t1)

    return {
        "repair_output": repair_output,
        "value_output": value_output,
        "circularity_output": circularity_output,
        "impact_output": impact_output,
        "action_output": action_output,
    }


# ---------------------------------------------------------------------------
# IMPACT LEDGER
# ---------------------------------------------------------------------------

def update_impact_ledger(impact_output: dict, recommendation: str):
    try:
        IMPACT_LEDGER.update_one(
            {"_id": "global"},
            {
                "$inc": {
                    "total_devices_assessed": 1,
                    "total_co2_avoided_kg": impact_output.get("co2_avoided_kg", 0),
                    "total_life_years_extended": impact_output.get("life_extension_years", 0),
                    f"pathway_counts.{recommendation}": 1,
                },
                "$set": {"last_updated": datetime.now(timezone.utc)},
            },
            upsert=True,
        )
    except Exception as e:
        print(f"Error updating impact ledger: {e}")


# ---------------------------------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------------------------------

app = FastAPI(title="Project Phoenix Backend")


@app.on_event("startup")
def startup_event():
    """Preload models and warm external clients to reduce first-request latency."""
    print(f"[CONFIG] GROQ_API_KEY loaded: {'YES (' + GROQ_API_KEY[:8] + '...)' if GROQ_API_KEY else 'NO - MISSING'}", flush=True)
    print(f"[CONFIG] GROQ_URL: {GROQ_URL}", flush=True)
    print(f"[CONFIG] GROQ_TEXT_MODEL: {GROQ_TEXT_MODEL}", flush=True)
    try:
        print("Preloading YOLO model...", flush=True)
        get_yolo_model()
        print("YOLO model loaded.", flush=True)
    except Exception as e:
        print(f"Failed to preload YOLO: {e}", flush=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/debug/gemini")
def debug_gemini():
    """Temporary debug endpoint: tests both auth methods for the Gemini key."""
    payload = {
        "contents": [{"parts": [{"text": "Reply with the single word: OK"}]}]
    }
    results = {}

    # Method 1: ?key= query param (classic API key style)
    try:
        resp = requests.post(
            f"{GEMINI_TEXT_URL}?key={GEMINI_API_KEY}",
            json=payload,
            timeout=15,
        )
        results["query_param"] = {"status_code": resp.status_code, "body": resp.json()}
    except Exception as e:
        results["query_param"] = {"error": str(e)}

    # Method 2: Bearer token in Authorization header (new AQ. token style)
    try:
        resp = requests.post(
            GEMINI_TEXT_URL,
            json=payload,
            headers={"Authorization": f"Bearer {GEMINI_API_KEY}"},
            timeout=15,
        )
        results["bearer"] = {"status_code": resp.status_code, "body": resp.json()}
    except Exception as e:
        results["bearer"] = {"error": str(e)}

    return {
        "key_prefix": GEMINI_API_KEY[:8] + "..." if GEMINI_API_KEY else "(empty)",
        "results": results,
    }


@app.post("/api/assess/video")
async def assess_video(request: Request):
    """
    Step 1-2: Receives base64 video frames.
    Runs YOLO localization + Gemini damage classification.
    Returns condition_report and a session_id for the voice diagnostic flow.
    """
    try:
        form_data = await request.form()
        frames = form_data.getlist('frames')
        condition_report = assess_video_frames(frames)

        session_id = str(uuid.uuid4())
        questions = get_questions_for_condition(condition_report)

        # Remove lambda functions before inserting into MongoDB
        questions_serializable = [
            {k: v for k, v in q.items() if k != "trigger"}
            for q in questions
        ]

        SESSIONS.insert_one({
            "_id": session_id,
            "condition_report": condition_report,
            "questions": questions_serializable,
            "current_question_index": 0,
            "diagnostic_answers": {},
            "created_at": datetime.now(timezone.utc),
        })

        return {
            "session_id": session_id,
            "condition_report": {k: v for k, v in condition_report.items() if not k.startswith("_")},
            "total_questions": len(questions),
        }
    except Exception as e:
        print(f"[VIDEO ERROR] {type(e).__name__}: {e}", flush=True)
        import traceback
        traceback.print_exc()
        raise


@app.post("/api/assess/upload_video")
async def assess_uploaded_video(video: UploadFile = File(...)):
    """Accepts an uploaded video file and runs the same visual assessment pipeline."""
    suffix = os.path.splitext(video.filename)[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        tmp.write(await video.read())

    try:
        frames = extract_frames_from_video(tmp_path, count=8)
        if not frames:
            return JSONResponse({"error": "Could not extract frames from uploaded video."}, status_code=400)

        condition_report = assess_video_frames(frames)
        session_id = str(uuid.uuid4())
        questions = get_questions_for_condition(condition_report)

        SESSIONS.insert_one({
            "_id": session_id,
            "condition_report": condition_report,
            "questions": [
                {k: v for k, v in q.items() if k != "trigger"}
                for q in questions
            ],
            "current_question_index": 0,
            "diagnostic_answers": {},
            "created_at": datetime.now(timezone.utc),
        })

        return {
            "session_id": session_id,
            "condition_report": {k: v for k, v in condition_report.items() if not k.startswith("_")},
            "total_questions": len(questions),
        }
    except Exception as e:
        print(f"[UPLOAD VIDEO ERROR] {type(e).__name__}: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return JSONResponse({"error": "Failed to process uploaded video."}, status_code=500)
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


@app.get("/api/voice/question")
async def get_voice_question(session_id: str, language_code: str = "en-IN"):
    """
    Step 3 (Sarvam TTS): Returns the next diagnostic question as spoken audio.
    """
    session = SESSIONS.find_one({"_id": session_id})
    if not session:
        return {"error": "session not found"}

    idx = session["current_question_index"]
    questions = session["questions"]

    if idx >= len(questions):
        return {"done": True}

    question = questions[idx]
    # Pick pre-translated text for the requested language; fall back to English
    lang_texts = QUESTION_TEXTS.get(question["id"], {})
    speak_text = lang_texts.get(language_code) or lang_texts.get("en-IN") or question["text"]
    display_text = lang_texts.get("en-IN") or question["text"]

    print(f"[VOICE] Q{idx+1}/{len(questions)} lang={language_code} speaker={SARVAM_SPEAKERS.get(language_code,'anushka')} — {speak_text[:60]}", flush=True)
    audio_bytes = sarvam_text_to_speech(speak_text, language_code)
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8") if audio_bytes else ""
    print(f"[VOICE] TTS returned {len(audio_bytes)} bytes, b64 len={len(audio_b64)}", flush=True)

    return {
        "done": False,
        "question_id": question["id"],
        "answer_type": question["answer_type"],
        "question_text": display_text,
        "question_text_native": speak_text,
        "audio_b64": audio_b64,
    }


@app.post("/api/voice/answer")
async def post_voice_answer(
    session_id: str = Form(...),
    audio: UploadFile = File(None),
    language_code: str = Form("en-IN"),
    transcript: Optional[str] = Form(None),
):
    """
    Step 3 (Sarvam STT): Receives the user's spoken answer as an audio file.
    Accepts optional browser transcript fallback or text answer.
    """
    session = SESSIONS.find_one({"_id": session_id})
    if not session:
        return {"error": "session not found"}

    idx = session["current_question_index"]
    question = session["questions"][idx]

    if transcript and transcript.strip():
        user_transcript = transcript.strip()
        print(f"[VOICE] Using browser transcript: {user_transcript}", flush=True)
    elif audio is not None:
        audio_bytes = await audio.read()
        mime_type = audio.content_type or "audio/wav"
        user_transcript = sarvam_speech_to_text(audio_bytes, language_code, mime_type)
        print(f"[VOICE] STT transcript: {user_transcript}", flush=True)
    else:
        return JSONResponse({"error": "No audio or transcript provided."}, status_code=400)

    parsed = parse_voice_answer(user_transcript, question["answer_type"])

    if parsed is None:
        retry_audio = sarvam_text_to_speech(
            "Sorry, I didn't understand. " + question["text"], language_code
        )
        return {
            "understood": False,
            "retry_audio_b64": base64.b64encode(retry_audio).decode("utf-8") if retry_audio else "",
            "transcript": user_transcript,
        }

    SESSIONS.update_one(
        {"_id": session_id},
        {
            "$set": {f"diagnostic_answers.{question['id']}": parsed},
            "$inc": {"current_question_index": 1},
        },
    )

    next_idx = idx + 1
    done = next_idx >= len(session["questions"])

    return {"understood": True, "done": done, "transcript": transcript}


@app.post("/api/assess/finalize")
async def finalize_assessment(
    session_id: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    city: str = Form(...),
    state: str = Form(""),
    language_code: str = Form("en-IN"),
    # User-supplied form inputs — merge into condition_report to avoid "unknown"
    user_brand: str = Form(""),
    user_model: str = Form(""),
    user_condition: str = Form(""),
    user_symptoms: str = Form(""),
    user_device_type: str = Form(""),
    background_tasks: BackgroundTasks = None,
):
    """
    Step 4-6: Enqueue the 5-agent pipeline as a background job and return immediately.
    """
    session = SESSIONS.find_one({"_id": session_id})
    if not session:
        return {"error": "session not found"}

    # Merge user-supplied form inputs into condition_report.
    # YOLO/vision may return "unknown" for brand/model when image quality is poor.
    # The Assessment form always has the correct values — prefer them over "unknown".
    CONDITION_MAP = {"like-new": 9, "good": 7, "fair": 5, "poor": 3, "broken": 1}
    existing_cr = session.get("condition_report", {})
    cr_patch = {}
    if user_brand and existing_cr.get("brand", "unknown") in ("unknown", "", None):
        cr_patch["condition_report.brand"] = user_brand
    if user_model and existing_cr.get("model_guess", "unknown") in ("unknown", "", None):
        cr_patch["condition_report.model_guess"] = user_model
    if user_device_type and existing_cr.get("device_type", "unknown") in ("unknown", "", None):
        cr_patch["condition_report.device_type"] = user_device_type
    if user_condition:
        mapped_score = CONDITION_MAP.get(user_condition)
        # Only override if vision score looks like the fallback default (5) or is missing
        if mapped_score and existing_cr.get("overall_condition_score", 5) == 5:
            cr_patch["condition_report.overall_condition_score"] = mapped_score
    if user_symptoms:
        cr_patch["condition_report.user_reported_symptoms"] = user_symptoms
    if cr_patch:
        SESSIONS.update_one({"_id": session_id}, {"$set": cr_patch})

    # mark session as queued for finalization
    SESSIONS.update_one({"_id": session_id}, {"$set": {"status": "queued", "progress": "queued for finalize"}})

    # enqueue Celery task if broker reachable, otherwise fall back to thread
    try:
        # import tasks lazily to avoid circular imports at module import time
        from backend import tasks
        # quick broker reachability check (Redis)
        from backend import celery_app as _celery_mod
        broker_url = getattr(_celery_mod, "CELERY_BROKER", os.environ.get("CELERY_BROKER", "redis://localhost:6379/0"))
        broker_ok = False
        try:
            import redis as _redis
            r = _redis.from_url(broker_url, socket_connect_timeout=1, socket_timeout=1)
            r.ping()
            broker_ok = True
        except Exception:
            broker_ok = False

        if broker_ok:
            tasks.finalize_task.delay(session_id, lat, lng, city, state, language_code)
            return JSONResponse({"status": "processing", "session_id": session_id}, status_code=202)
        else:
            raise RuntimeError("broker_unreachable")
    except Exception as e:
        # fallback to thread if Celery not available
        import threading

        def _fallback():
            try:
                # Run the same finalize pipeline inline to avoid importing backend.tasks
                SESSIONS.update_one({"_id": session_id}, {"$set": {"status": "processing", "progress": "starting finalize"}})
                session_doc = SESSIONS.find_one({"_id": session_id})
                if not session_doc:
                    SESSIONS.update_one({"_id": session_id}, {"$set": {"status": "error", "error": "session missing during finalize"}})
                    return

                condition_report = session_doc.get("condition_report", {})
                diagnostic_answers = session_doc.get("diagnostic_answers", {})
                user_location = {"lat": lat, "lng": lng, "city": city, "state": state}

                SESSIONS.update_one({"_id": session_id}, {"$set": {"progress": "running agent pipeline"}})
                pipeline_output = run_agent_pipeline(condition_report, diagnostic_answers, user_location, session_id)

                passport_id = str(__import__("uuid").uuid4())
                recommendation = (pipeline_output.get("circularity_output") or {}).get("recommendation", "unknown")

                final_doc = {
                    "passport_id": passport_id,
                    "created_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc),
                    "user_location": user_location,
                    "language": language_code,
                    "condition_report": {k: v for k, v in condition_report.items() if not k.startswith("_")},
                    "diagnostic_answers": diagnostic_answers,
                    "agent_outputs": pipeline_output,
                    "recommendation": recommendation,
                    "confidence": (pipeline_output.get("circularity_output") or {}).get("confidence", 0),
                }

                ASSESSMENTS.insert_one(final_doc)
                try:
                    update_impact_ledger(pipeline_output.get("impact_output", {}), recommendation)
                except Exception:
                    pass

                summary_text = (pipeline_output.get("action_output") or {}).get("user_summary", "Assessment complete.")
                try:
                    summary_audio = sarvam_text_to_speech(summary_text, language_code)
                except Exception:
                    summary_audio = b""
                summary_audio_b64 = __import__("base64").b64encode(summary_audio).decode("utf-8") if summary_audio else ""

                SESSIONS.update_one({"_id": session_id}, {"$set": {
                    "status": "done",
                    "passport_id": passport_id,
                    "recommendation": recommendation,
                    "confidence": final_doc["confidence"],
                    "agent_outputs": pipeline_output,
                    "summary_text": summary_text,
                    "summary_audio_b64": summary_audio_b64,
                    "progress": "complete"
                }})

                return {"passport_id": passport_id, "status": "done"}
            except Exception as e:
                try:
                    SESSIONS.update_one({"_id": session_id}, {"$set": {"status": "error", "error": str(e)}})
                except Exception:
                    pass
                raise

        t = threading.Thread(target=_fallback, daemon=True)
        t.start()
        return JSONResponse({"status": "processing", "session_id": session_id, "note": "celery fallback thread started"}, status_code=202)


@app.get("/api/results/{passport_id}")
async def get_results(passport_id: str):
    """Retrieve assessment results by passport ID."""
    doc = ASSESSMENTS.find_one({"passport_id": passport_id}, {"_id": 0})
    return doc or {"error": "not_found"}


@app.get("/api/assess/status")
async def assess_status(session_id: str):
    """Return the current status and any available results for a session."""
    s = SESSIONS.find_one({"_id": session_id})
    if not s:
        return {"error": "session not found"}

    # include timings and an estimated percent complete based on historical averages
    timings = s.get("timings", [])
    steps = ["repair", "value", "circularity", "impact", "action"]
    completed = {t["step"]: t["duration_s"] for t in timings}

    # sum completed durations
    completed_total = sum(completed.values())

    # estimate remaining using pipeline stats
    remaining_total = 0.0
    for step in steps:
        if step in completed:
            continue
        stat = PIPELINE_STATS.find_one({"_id": step})
        if stat and stat.get("avg"):
            remaining_total += float(stat.get("avg", 0.0))
        else:
            # default fallback estimate (seconds)
            remaining_total += 3.0

    estimated_percent = None
    total_est = completed_total + remaining_total
    if total_est > 0:
        estimated_percent = int((completed_total / total_est) * 100)

    return {
        "status": s.get("status", "unknown"),
        "progress": s.get("progress", ""),
        "passport_id": s.get("passport_id"),
        "recommendation": s.get("recommendation"),
        "confidence": s.get("confidence"),
        "summary_text": s.get("summary_text"),
        "summary_audio_b64": s.get("summary_audio_b64"),
        "error": s.get("error"),
        "timings": timings,
        "estimated_percent": estimated_percent,
        "agent_outputs": s.get("agent_outputs"),
        "condition_report": s.get("condition_report"),
        "total_questions": len(s.get("questions", [])),
        "current_question_index": s.get("current_question_index", 0),
    }


@app.get("/api/impact")
async def get_impact():
    """Get global impact ledger."""
    doc = IMPACT_LEDGER.find_one({"_id": "global"}, {"_id": 0})
    return doc or {
        "total_devices_assessed": 0,
        "total_co2_avoided_kg": 0,
        "total_life_years_extended": 0,
        "pathway_counts": {},
    }


@app.get("/api/ngos")
async def list_ngos(city: str = ""):
    """Return NGOs/schools from the database, optionally filtered by city."""
    query = {}
    if city and city.lower() != "unknown":
        query["city"] = {"$regex": city, "$options": "i"}
    ngos = list(NGO_SCHOOLS.find(query, {"_id": 0}).limit(20))
    if not ngos:
        # Return a set of generic fallback NGOs if collection is empty
        ngos = [
            {
                "name": "Goonj",
                "city": "Delhi",
                "state": "Delhi",
                "contact_phone": "011-41401216",
                "contact_email": "mail@goonj.org",
                "website": "https://goonj.org",
                "accepts": ["smartphones", "laptops", "tablets"],
                "description": "Accepts used electronics and redistributes to underserved communities.",
            },
            {
                "name": "Stree Mukti Sanghatana",
                "city": "Mumbai",
                "state": "Maharashtra",
                "contact_phone": "022-24154090",
                "contact_email": "info@streemukti.org",
                "website": "https://streemukti.org",
                "accepts": ["smartphones", "laptops"],
                "description": "Empowers women through digital literacy with donated devices.",
            },
            {
                "name": "iamgurgaon",
                "city": "Gurugram",
                "state": "Haryana",
                "contact_phone": "+91-9810009961",
                "contact_email": "info@iamgurgaon.org",
                "website": "https://iamgurgaon.org",
                "accepts": ["laptops", "tablets", "smartphones"],
                "description": "Bridges the digital divide for students in government schools.",
            },
        ]
    return {"ngos": ngos, "count": len(ngos)}


@app.post("/api/donate")
async def submit_donation(
    session_id: str = Form(...),
    ngo_name: str = Form(...),
    ngo_city: str = Form(""),
    donor_name: str = Form(""),
    donor_phone: str = Form(""),
    notes: str = Form(""),
):
    """Submit a donation request linking a session/device to an NGO."""
    session = SESSIONS.find_one({"_id": session_id})
    if not session:
        return JSONResponse({"error": "session not found"}, status_code=404)

    donation_id = str(uuid.uuid4())
    doc = {
        "_id": donation_id,
        "session_id": session_id,
        "passport_id": session.get("passport_id", ""),
        "ngo_name": ngo_name,
        "ngo_city": ngo_city,
        "donor_name": donor_name,
        "donor_phone": donor_phone,
        "notes": notes,
        "device_type": session.get("condition_report", {}).get("device_type", "unknown"),
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    }
    DONATIONS.insert_one(doc)

    # Update session to mark donation submitted
    SESSIONS.update_one({"_id": session_id}, {"$set": {"donation_submitted": True, "donation_id": donation_id}})

    return {
        "donation_id": donation_id,
        "status": "pending",
        "message": f"Donation request submitted to {ngo_name}. They will contact you shortly.",
    }


@app.get("/api/donate/{donation_id}")
async def get_donation_status(donation_id: str):
    """Get status of a donation request."""
    doc = DONATIONS.find_one({"_id": donation_id}, {"_id": 0})
    return doc or {"error": "donation not found"}


@app.get("/api/community-actions")
async def get_community_actions(limit: int = 10):
    """
    Returns recent assessment actions for the community live feed.
    Pulls from the assessments collection, ordered by creation date descending.
    """
    try:
        docs = list(
            ASSESSMENTS.find(
                {"recommendation": {"$exists": True}},
                {"_id": 0, "passport_id": 1, "recommendation": 1, "condition_report": 1,
                 "agent_outputs": 1, "created_at": 1, "user_location": 1}
            ).sort("created_at", -1).limit(max(1, min(limit, 50)))
        )

        actions = []
        for doc in docs:
            cr = doc.get("condition_report", {})
            impact = (doc.get("agent_outputs") or {}).get("impact_output", {}) or {}
            city = (doc.get("user_location") or {}).get("city", "Unknown")
            created_at = doc.get("created_at")
            timestamp = "recently"
            if created_at:
                try:
                    delta = datetime.now(timezone.utc) - created_at.replace(tzinfo=timezone.utc) if created_at.tzinfo is None else datetime.now(timezone.utc) - created_at
                    mins = int(delta.total_seconds() / 60)
                    if mins < 1:
                        timestamp = "just now"
                    elif mins < 60:
                        timestamp = f"{mins} min ago"
                    else:
                        hours = mins // 60
                        timestamp = f"{hours} hour{'s' if hours > 1 else ''} ago"
                except Exception:
                    pass

            actions.append({
                "id": doc.get("passport_id", ""),
                "userName": "Phoenix User",
                "userLocation": city,
                "deviceType": cr.get("device_type", "laptop") if cr.get("device_type") in ("laptop", "smartphone") else "laptop",
                "brand": cr.get("brand", "Unknown"),
                "model": cr.get("model_guess", "Unknown"),
                "pathway": doc.get("recommendation", "recycle"),
                "timestamp": timestamp,
                "co2SavedKg": impact.get("co2_avoided_kg", 0),
            })
        return {"actions": actions}
    except Exception as e:
        print(f"[community-actions] error: {e}", flush=True)
        return {"actions": []}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
