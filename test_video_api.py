import requests
import base64

# Minimal 1x1 PNG
png_bytes = bytes.fromhex('89504e470d0a1a0a0000000d494844520000000100000001080602000001c8a54f63000000097049486174000000010000000101002001cf47e91a00000001735247420aece1ce0000000049444154f8cfaf606001000003000100003ce81a0000000049454e44ae426082')
png_b64 = base64.b64encode(png_bytes).decode()

try:
    # Send frames as multiple form fields
    files = [('frames', (None, png_b64))]
    r = requests.post(
        'http://127.0.0.1:8000/api/assess/video',
        files=files,
        timeout=30
    )
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:1000]}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
