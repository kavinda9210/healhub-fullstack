import argparse
import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import metrics as keras_metrics


def build_val_dataset(data_dir, target_class, img_size, batch_size, val_split=0.2, seed=123):
    val = keras.preprocessing.image_dataset_from_directory(
        data_dir,
        labels='inferred',
        label_mode='int',
        image_size=(img_size, img_size),
        batch_size=batch_size,
        shuffle=False,
        validation_split=val_split,
        subset='validation',
        seed=seed,
    )
    class_names = val.class_names
    if target_class not in class_names:
        raise ValueError(f"Target class '{target_class}' not found. Available: {class_names}")
    target_index = class_names.index(target_class)

    def to_binary(x, y):
        yb = tf.cast(tf.equal(y, target_index), tf.float32)
        return x, yb

    AUTOTUNE = tf.data.AUTOTUNE
    val_ds = val.map(to_binary, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)
    return val_ds, class_names, target_index


def evaluate(model_path, data_dir, target_class, img_size, batch_size):
    val_ds, class_names, target_index = build_val_dataset(data_dir, target_class, img_size, batch_size)
    print('Loading model:', model_path)
    model = keras.models.load_model(model_path)

    ys = []
    preds = []
    probs = []
    for x, y in val_ds:
        p = model.predict(x)
        p = np.ravel(p)
        probs.extend(p.tolist())
        preds.extend((p >= 0.5).astype(int).tolist())
        ys.extend(y.numpy().astype(int).tolist())

    ys = np.array(ys)
    preds = np.array(preds)
    probs = np.array(probs)

    # compute metrics using numpy / tf
    cm = np.zeros((2, 2), dtype=int)
    for t, p in zip(ys, preds):
        cm[int(t), int(p)] += 1
    tn, fp = cm[0, 0], cm[0, 1]
    fn, tp = cm[1, 0], cm[1, 1]
    acc = (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0.0
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    try:
        auc_metric = keras_metrics.AUC()
        auc_metric.update_state(ys, probs)
        auc = float(auc_metric.result().numpy())
    except Exception:
        auc = float('nan')

    print('Class:', target_class)
    print('Validation samples:', len(ys))
    print('Confusion matrix (rows=true [neg,pos], cols=pred [neg,pos]):')
    print(cm)
    print(f'Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, AUC: {auc:.4f}')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--class', dest='target_class', required=True)
    p.add_argument('--model', required=True)
    p.add_argument('--data-dir', default=os.path.join('AIWoundOrrashDettector', 'dataset', 'train'))
    p.add_argument('--img-size', type=int, default=180)
    p.add_argument('--batch-size', type=int, default=8)
    args = p.parse_args()

    model_path = args.model
    evaluate(model_path, args.data_dir, args.target_class, args.img_size, args.batch_size)


if __name__ == '__main__':
    main()
