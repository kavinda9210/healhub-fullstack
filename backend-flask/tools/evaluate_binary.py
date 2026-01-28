import argparse
import os
import numpy as np
import tensorflow as tf
from tensorflow import keras


def build_val_dataset(data_dir, img_size, batch_size, val_split=0.2, seed=123):
    ds = keras.preprocessing.image_dataset_from_directory(
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
    return ds


def to_binary_dataset(ds, target_index):
    def map_fn(x, y):
        yb = tf.cast(tf.equal(y, target_index), tf.float32)
        return x, yb

    AUTOTUNE = tf.data.AUTOTUNE
    return ds.map(map_fn, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)


def evaluate(model_path, target_class, data_dir, img_size=180, batch_size=8, threshold=0.5):
    print('Loading model:', model_path)
    try:
        model = keras.models.load_model(model_path)
    except Exception as e:
        print('Warning: failed to load full model, will rebuild architecture and load weights. Error:', e)
        # Rebuild architecture (must match training script)
        base = keras.applications.MobileNetV2(weights='imagenet', include_top=False,
                                             input_shape=(img_size, img_size, 3), pooling='avg')
        base.trainable = False
        inputs = keras.Input(shape=(img_size, img_size, 3))
        x = keras.applications.mobilenet_v2.preprocess_input(inputs)
        x = base(x, training=False)
        x = keras.layers.Dense(128, activation='relu')(x)
        x = keras.layers.Dropout(0.3)(x)
        outputs = keras.layers.Dense(1, activation='sigmoid')(x)
        model = keras.Model(inputs, outputs)
        # load weights from HDF5
        try:
            model.load_weights(model_path)
            print('Weights loaded from', model_path)
        except Exception as e2:
            print('Failed to load weights from', model_path, 'error:', e2)
            raise

    val_ds = build_val_dataset(data_dir, img_size, batch_size)
    class_names = val_ds.class_names
    if target_class not in class_names:
        raise ValueError(f"Target class '{target_class}' not found. Available: {class_names}")
    target_index = class_names.index(target_class)

    val_bin = to_binary_dataset(val_ds, target_index)

    # collect true labels
    y_true_parts = []
    for _, y in val_bin:
        y_true_parts.append(y.numpy().reshape(-1))
    if len(y_true_parts) == 0:
        print('No validation examples found.')
        return
    y_true = np.concatenate(y_true_parts, axis=0)

    # predictions (probabilities)
    probs = model.predict(val_bin)
    probs = np.asarray(probs).reshape(-1)
    preds = (probs >= threshold).astype(int)

    # metrics
    from tensorflow.keras.metrics import AUC
    aucm = AUC()
    aucm.update_state(y_true, probs)
    auc = float(aucm.result().numpy())

    acc = float((preds == y_true).mean())

    cm = tf.math.confusion_matrix(y_true.astype(int), preds, num_classes=2).numpy()

    print('Class:', target_class)
    print('Validation examples:', y_true.shape[0])
    print('Accuracy: {:.2%}'.format(acc))
    print('AUC: {:.4f}'.format(auc))
    print('Confusion matrix (rows=true, cols=pred):')
    print(cm)

    # save CSV
    out_csv = os.path.join('tools', f'eval_binary_{target_class.replace(" ", "_")}.csv')
    import csv
    with open(out_csv, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['metric', 'value'])
        w.writerow(['examples', y_true.shape[0]])
        w.writerow(['accuracy', acc])
        w.writerow(['auc', auc])
        w.writerow(['cm_00', int(cm[0,0])])
        w.writerow(['cm_01', int(cm[0,1])])
        w.writerow(['cm_10', int(cm[1,0])])
        w.writerow(['cm_11', int(cm[1,1])])

    print('Saved results to', out_csv)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--model', required=True)
    p.add_argument('--class', dest='target_class', required=True)
    p.add_argument('--data-dir', default=os.path.join('AIWoundOrrashDettector', 'dataset', 'train'))
    p.add_argument('--img-size', type=int, default=180)
    p.add_argument('--batch-size', type=int, default=8)
    p.add_argument('--threshold', type=float, default=0.5)
    args = p.parse_args()

    evaluate(args.model, args.target_class, args.data_dir, args.img_size, args.batch_size, args.threshold)


if __name__ == '__main__':
    main()
