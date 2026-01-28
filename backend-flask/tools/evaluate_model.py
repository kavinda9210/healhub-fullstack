import json
from pathlib import Path
import numpy as np
import tensorflow as tf

BASE = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE / 'AIWoundOrrashDettector' / 'AIWoundAndRashDetector.h5'
CLASSES_PATH = BASE / 'AIWoundOrrashDettector' / 'classes.json'
DATA_DIR = BASE / 'AIWoundOrrashDettector' / 'dataset' / 'train'

def load_classes():
    import json
    if CLASSES_PATH.exists():
        return json.loads(CLASSES_PATH.read_text())
    # fallback: discover from dirs
    return sorted([d.name for d in DATA_DIR.iterdir() if d.is_dir()])

def evaluate(batch_size=32, img_size=(180,180)):
    classes = load_classes()
    print('Classes:', classes)
    model = tf.keras.models.load_model(MODEL_PATH)

    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR,
        validation_split=0.2,
        subset='validation',
        seed=123,
        image_size=img_size,
        batch_size=batch_size
    )

    y_true = []
    y_pred = []
    for images, labels in val_ds:
        preds = model.predict(images)
        probs = tf.nn.softmax(preds, axis=1).numpy()
        idxs = probs.argmax(axis=1)
        y_true.extend(labels.numpy().tolist())
        y_pred.extend(idxs.tolist())

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # confusion matrix
    K = len(classes)
    cm = np.zeros((K,K), dtype=int)
    for t,p in zip(y_true, y_pred):
        cm[t,p] += 1

    # per-class accuracy
    per_acc = []
    for i in range(K):
        total = cm[i].sum()
        correct = cm[i,i]
        acc = float(correct)/total if total>0 else 0.0
        per_acc.append(acc)

    # print report
    print('\nConfusion Matrix (rows=true, cols=pred):')
    print(cm)
    print('\nPer-class accuracy:')
    for c,a in zip(classes, per_acc):
        print(f'{c}: {a*100:.1f}%')

    overall = np.trace(cm)/cm.sum() if cm.sum()>0 else 0.0
    print(f'\nOverall accuracy: {overall*100:.2f}%')

    # save csv
    out = BASE / 'tools' / 'evaluation_report.csv'
    import csv
    with open(out, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow([''] + classes)
        for i,c in enumerate(classes):
            w.writerow([c] + cm[i].tolist())
        w.writerow([])
        w.writerow(['Class','Accuracy'])
        for c,a in zip(classes, per_acc):
            w.writerow([c, a])
    print('Saved evaluation_report.csv to', out)

if __name__ == '__main__':
    evaluate()
