from pathlib import Path
import importlib.util
import json

BASE = Path(__file__).resolve().parents[1]
ai_path = BASE / 'app' / 'services' / 'ai_service.py'

spec = importlib.util.spec_from_file_location('ai_service', str(ai_path))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
ai_service = mod.ai_service

def run(img_path):
    p = Path(img_path)
    if not p.exists():
        print('Image not found:', p)
        return
    with open(p, 'rb') as f:
        data = f.read()
    res = ai_service.detect_all(data)
    print(json.dumps(res, indent=2))

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print('Usage: python local_detect_all.py <image_path>')
        sys.exit(1)
    run(sys.argv[1])
