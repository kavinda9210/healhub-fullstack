import os
import sys
import json

# Ensure repo root is on path
ROOT = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, ROOT)

# Import ai_service module directly to avoid executing app.__init__ (which requires Supabase config)
from importlib.machinery import SourceFileLoader
ai_service_mod = SourceFileLoader('ai_service', os.path.join(ROOT, 'app', 'services', 'ai_service.py')).load_module()
ai_service = getattr(ai_service_mod, 'ai_service')

def find_sample_image():
    base = os.path.join(ROOT, 'AIWoundOrrashDettector', 'dataset', 'train')
    if not os.path.isdir(base):
        return None
    for cls in os.listdir(base):
        cls_path = os.path.join(base, cls)
        if not os.path.isdir(cls_path):
            continue
        for f in os.listdir(cls_path):
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                return os.path.join(cls_path, f)
    return None

def main():
    print('Forcing model load (resetting cached state)...')
    try:
        # ensure we force a reload if service was initialized earlier
        try:
            setattr(ai_service, '_ready', False)
            setattr(ai_service, 'model', None)
        except Exception:
            pass
        ai_service._load_model()
    except Exception as e:
        print('Model load raised:', e)

    print('ready=', getattr(ai_service, '_ready', None))
    print('has model=', ai_service.model is not None)
    print('classes=', ai_service.classes)

    img = find_sample_image()
    if not img:
        print('No sample image found in dataset/train')
        return

    print('Using sample image:', img)
    with open(img, 'rb') as f:
        data = f.read()

    det = ai_service.detect(data)
    print('Detection result:')
    print(json.dumps(det, indent=2))

if __name__ == '__main__':
    main()
