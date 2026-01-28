from pathlib import Path
BASE = Path(__file__).resolve().parents[1]
DATA_DIR = BASE / 'AIWoundOrrashDettector' / 'dataset' / 'train'

def inspect():
    print('Dataset dir:', DATA_DIR)
    classes = [p for p in DATA_DIR.iterdir() if p.is_dir()]
    for c in sorted(classes):
        files = list(c.glob('*'))
        print(f'{c.name}: {len(files)} files, sample:', files[:3])

if __name__ == '__main__':
    inspect()
