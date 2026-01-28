import sys
import requests

if len(sys.argv) < 3:
    print("Usage: python post_image.py <image_path> <AUTH_TOKEN>")
    raise SystemExit(1)

fn = sys.argv[1]
token = sys.argv[2]
url = "http://127.0.0.1:5000/api/patient/detect/raw"

with open(fn, "rb") as f:
    r = requests.post(url, headers={"Authorization": f"Bearer {token}"}, files={"image": f})
    print(r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
