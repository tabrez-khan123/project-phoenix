import requests
import base64

# Minimal 1x1 PNG frame
png_bytes = bytes.fromhex('89504e470d0a1a0a0000000d494844520000000100000001080602000001c8a54f63000000097049486174000000010000000101002001cf47e91a00000001735247420aece1ce0000000049444154f8cfaf606001000003000100003ce81a0000000049454e44ae426082')
png_b64 = base64.b64encode(png_bytes).decode()

print('Starting video assess request...')
r = requests.post('http://127.0.0.1:8000/api/assess/video', files=[('frames', (None, png_b64))], timeout=30)
print('Status', r.status_code)
print(r.text)
if r.status_code != 200:
    raise SystemExit(1)

data = r.json()
session_id = data['session_id']
print('Session ID', session_id)

print('Requesting voice question...')
q = requests.get('http://127.0.0.1:8000/api/voice/question', params={'session_id': session_id, 'language_code': 'en-IN'}, timeout=30)
print('Status', q.status_code)
print(q.text[:1000])

try:
    obj = q.json()
    audio_b64 = obj.get('audio_b64', '')
    print('Audio length', len(audio_b64))
    if audio_b64:
        decoded = base64.b64decode(audio_b64)
        print('Decoded bytes', len(decoded))
except Exception as e:
    print('JSON parse error', e)
