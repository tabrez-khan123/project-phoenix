import cv2
import numpy as np
import requests
import time

# Create a small 2-second 640x360 video with changing colors
fps = 10
duration = 2
frames = fps * duration
w, h = 640, 360
fourcc = cv2.VideoWriter_fourcc(*"mp4v")
out_file = "test_video.mp4"
writer = cv2.VideoWriter(out_file, fourcc, fps, (w, h))
for i in range(frames):
    frame = np.zeros((h, w, 3), dtype=np.uint8)
    color = (int(255 * (i / frames)), 50, int(255 * (1 - i / frames)))
    cv2.rectangle(frame, (50, 50), (w-50, h-50), color, -1)
    writer.write(frame)
writer.release()

print(f"Wrote {out_file}")

# Give server a moment
time.sleep(0.5)

with open(out_file, "rb") as f:
    files = {"video": (out_file, f, "video/mp4")}
    try:
        r = requests.post("http://127.0.0.1:8000/api/assess/upload_video", files=files, timeout=60)
        print("Status:", r.status_code)
        print("Response:", r.text[:2000])
    except Exception as e:
        print("Error posting:", e)
