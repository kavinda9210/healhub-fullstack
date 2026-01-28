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
    classes, probs = ai_service.predict_proba(data)
    if not classes:
        print('No model or classes available')
        return
    pairs = list(zip(classes, probs))
    pairs_sorted = sorted(pairs, key=lambda x: x[1], reverse=True)
    print('Top predictions:')
    for i,(c,pv) in enumerate(pairs_sorted[:10], start=1):
        print(f'{i}. {c}: {pv:.4f} ({pv*100:.1f}%)')
    # also show predicted label by ai_service.detect
    det = ai_service.detect(data)
    print('\nDetect() returned:')
    print(json.dumps(det, indent=2))

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print('Usage: python local_predict_proba.py <image_path>')
        sys.exit(1)
    run(sys.argv[1])
