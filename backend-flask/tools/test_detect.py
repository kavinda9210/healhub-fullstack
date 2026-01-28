import importlib.util
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
ai_path = BASE / 'app' / 'services' / 'ai_service.py'
img_path = BASE / 'AIWoundOrrashDettector' / 'dataset' / 'train' / 'Psoriasis' / '1.jpg'

spec = importlib.util.spec_from_file_location('ai_service', str(ai_path))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
ai_service = mod.ai_service

print('AI service loaded. Image:', img_path)
with open(img_path, 'rb') as f:
    data = f.read()

res = ai_service.detect(data)
print('Detection result:')
print(res)
