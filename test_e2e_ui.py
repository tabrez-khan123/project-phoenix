import requests
import time
import cv2
import numpy as np

API = "http://127.0.0.1:8000"

# ensure a small video exists
out_file = "e2e_test_video.mp4"
fps = 10
duration = 2
frames = fps * duration
w,h = 320,180
fourcc = cv2.VideoWriter_fourcc(*"mp4v")
writer = cv2.VideoWriter(out_file, fourcc, fps, (w,h))
for i in range(frames):
    frame = np.zeros((h,w,3), dtype=np.uint8)
    color = (int(255*(i/frames)), 50, int(255*(1-i/frames)))
    cv2.rectangle(frame,(10,10),(w-10,h-10), color, -1)
    writer.write(frame)
writer.release()
print('Wrote', out_file)

# 1) upload video
with open(out_file,'rb') as f:
    files = {"video": (out_file, f, 'video/mp4')}
    r = requests.post(f"{API}/api/assess/upload_video", files=files, timeout=60)
print('upload status', r.status_code)
print(r.text)
if r.status_code!=200:
    raise SystemExit('upload failed')

session_id = r.json().get('session_id')
print('session', session_id)

# 2) loop through voice questions using transcript answers
while True:
    rq = requests.get(f"{API}/api/voice/question?session_id={session_id}&language_code=en-IN", timeout=30)
    print('question status', rq.status_code)
    data = rq.json()
    print('question data', data)
    if data.get('done'):
        print('no more questions')
        break
    qid = data.get('question_id')
    atype = data.get('answer_type')
    # choose safe transcript
    if atype == 'boolean':
        transcript = 'no'
    else:
        transcript = 'no'
    resp = requests.post(f"{API}/api/voice/answer", data={'session_id': session_id, 'transcript': transcript}, timeout=30)
    print('answer posted', resp.status_code, resp.text)
    time.sleep(0.5)

# 3) finalize (send unknown location)
form = {'session_id': session_id, 'lat': 0.0, 'lng': 0.0, 'city': 'unknown', 'state': 'unknown', 'language_code': 'en-IN'}
r = requests.post(f"{API}/api/assess/finalize", data=form, timeout=30)
print('finalize', r.status_code, r.text)

# 4) poll status until done or timeout
start = time.time()
while time.time() - start < 120:
    rs = requests.get(f"{API}/api/assess/status?session_id={session_id}", timeout=30)
    info = rs.json()
    print('status poll', rs.status_code, info)
    if info.get('status') == 'done' or info.get('status') == 'error':
        break
    time.sleep(2)

print('E2E finished')
