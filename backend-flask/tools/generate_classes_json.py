from pathlib import Path
import json

BASE = Path(__file__).resolve().parents[1]
data_dir = BASE / 'AIWoundOrrashDettector' / 'dataset' / 'train'
out = BASE / 'AIWoundOrrashDettector' / 'classes.json'

if not data_dir.exists():
    print('Dataset directory not found:', data_dir)
    raise SystemExit(1)

classes = sorted([p.name for p in data_dir.iterdir() if p.is_dir()])
print('Discovered classes:', classes)
with open(out, 'w', encoding='utf-8') as f:
    json.dump(classes, f, ensure_ascii=False, indent=2)

print('Wrote classes.json to', out)
