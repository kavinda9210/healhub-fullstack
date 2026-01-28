import os
import argparse
import csv
from pathlib import Path
from collections import defaultdict
import numpy as np

BASE = Path(__file__).resolve().parents[1]
ai_path = BASE / 'app' / 'services' / 'ai_service.py'

import importlib.util
spec = importlib.util.spec_from_file_location('ai_service', str(ai_path))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
ai_service = mod.ai_service


def gather_validation_files(data_dir, val_split=0.2, seed=123):
    data_dir = Path(data_dir)
    classes = sorted([d.name for d in data_dir.iterdir() if d.is_dir()])
    files = []
    for cls in classes:
        cls_dir = data_dir / cls
        imgs = sorted([p for p in cls_dir.iterdir() if p.is_file()])
        n_val = int(max(1, round(len(imgs) * val_split)))
        # pick last n_val files deterministically
        val_files = imgs[-n_val:]
        for p in val_files:
            files.append((str(p), cls))
    return classes, files


def evaluate(data_dir, out_csv='tools/eval_ensemble_report.csv', val_split=0.2, binary_threshold=0.5):
    classes, files = gather_validation_files(data_dir, val_split=val_split)
    idx_for = {c: i for i, c in enumerate(classes)}
    n = len(classes)
    cm = np.zeros((n, n), dtype=int)
    total = 0
    correct = 0

    for fp, true_lbl in files:
        total += 1
        try:
            with open(fp, 'rb') as f:
                b = f.read()
            res = ai_service.detect_all(b, binary_threshold=binary_threshold)
            pred = res.get('ensemble_label') or 'Unknown'
        except Exception:
            pred = 'Unknown'

        if pred not in idx_for:
            # skip unknowns by mapping to absent index (ignore)
            # treat as incorrect
            pass
        else:
            i = idx_for[true_lbl]
            j = idx_for[pred]
            cm[i, j] += 1
            if i == j:
                correct += 1
        # also handle case where pred not in classes => increment false column (last col)
    overall_acc = (correct / total) if total else 0.0

    # per-class accuracy
    per = {}
    for i, c in enumerate(classes):
        total_i = cm[i].sum()
        per[c] = (cm[i, i] / total_i) if total_i else 0.0

    # save CSV
    out_path = Path(out_csv)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['metric', 'value'])
        w.writerow(['validation_examples', total])
        w.writerow(['overall_accuracy', overall_acc])
        for c in classes:
            w.writerow([f'per_class_{c}', per[c]])
        w.writerow([])
        w.writerow(['confusion_matrix_rows_true_cols_pred'])
        w.writerow([''] + classes)
        for i, c in enumerate(classes):
            row = [c] + cm[i].tolist()
            w.writerow(row)

    print('Validation examples:', total)
    print('Overall accuracy: {:.2%}'.format(overall_acc))
    print('Per-class accuracy:')
    for c in classes:
        print(f'  {c}: {per[c]:.2%}')
    print('Saved CSV to', out_path)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--data-dir', default=os.path.join('AIWoundOrrashDettector', 'dataset', 'train'))
    p.add_argument('--out', default=os.path.join('tools', 'eval_ensemble_report.csv'))
    p.add_argument('--val-split', type=float, default=0.2)
    p.add_argument('--binary-threshold', type=float, default=0.5)
    args = p.parse_args()
    evaluate(args.data_dir, args.out, args.val_split, args.binary_threshold)


if __name__ == '__main__':
    main()
