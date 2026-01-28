import argparse
import os
import math
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


def count_images(dataset_dir):
    counts = {}
    exts = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}
    for name in os.listdir(dataset_dir):
        p = os.path.join(dataset_dir, name)
        if os.path.isdir(p):
            c = 0
            for fname in os.listdir(p):
                if os.path.splitext(fname)[1].lower() in exts:
                    c += 1
            counts[name] = c
    return counts


def build_binary_datasets(data_dir, target_class, img_size, batch_size, val_split=0.2, seed=123):
    # create train/val split manually
    full = keras.preprocessing.image_dataset_from_directory(
        data_dir,
        labels='inferred',
        label_mode='int',
        image_size=(img_size, img_size),
        batch_size=batch_size,
        shuffle=True,
        validation_split=val_split,
        subset='training',
        seed=seed,
    )
    class_names = full.class_names
    if target_class not in class_names:
        raise ValueError(f"Target class '{target_class}' not found. Available: {class_names}")

    target_index = class_names.index(target_class)
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

    def to_binary(x, y):
        yb = tf.cast(tf.equal(y, target_index), tf.float32)
        return x, yb

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = full.map(to_binary, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)
    val_ds = val.map(to_binary, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)

    return train_ds, val_ds, class_names, target_index


def compute_class_weights(data_dir, target_class):
    counts = count_images(data_dir)
    total = sum(counts.values())
    positive = counts.get(target_class, 0)
    negative = total - positive
    if positive == 0:
        raise ValueError(f"No images for class {target_class}")
    # inverse frequency
    weight_for_0 = (1.0 / negative) * (total) if negative > 0 else 1.0
    weight_for_1 = (1.0 / positive) * (total)
    # normalize
    s = weight_for_0 + weight_for_1
    return {0: weight_for_0 / s, 1: weight_for_1 / s}


def build_model(img_size):
    base = keras.applications.MobileNetV2(weights='imagenet', include_top=False,
                                         input_shape=(img_size, img_size, 3), pooling='avg')
    base.trainable = False
    inputs = keras.Input(shape=(img_size, img_size, 3))
    x = keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base(x, training=False)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(1, activation='sigmoid')(x)
    model = keras.Model(inputs, outputs)
    model.compile(optimizer=keras.optimizers.Adam(1e-3),
                  loss='binary_crossentropy',
                  metrics=['accuracy', keras.metrics.AUC(name='auc')])
    return model


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--class', dest='target_class', required=True)
    p.add_argument('--epochs', type=int, default=10)
    p.add_argument('--batch-size', type=int, default=16)
    p.add_argument('--img-size', type=int, default=180)
    p.add_argument('--data-dir', default=os.path.join('AIWoundOrrashDettector', 'dataset', 'train'))
    p.add_argument('--output', default=None)
    args = p.parse_args()

    data_dir = args.data_dir
    target = args.target_class
    print('Data dir:', data_dir)
    print('Target class:', target)

    train_ds, val_ds, class_names, target_index = build_binary_datasets(
        data_dir, target, args.img_size, args.batch_size)

    weights = compute_class_weights(data_dir, target)
    print('Class weights (normalized):', weights)

    model = build_model(args.img_size)
    out_name = args.output or f"AIWoundAndRashDetector_binary_{target.replace(' ', '_')}.h5"
    out_path = os.path.join('AIWoundOrrashDettector', out_name)

    # quick callback
    callbacks = [keras.callbacks.ModelCheckpoint(out_path, save_best_only=True, monitor='val_auc', mode='max')]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        class_weight=weights,
        callbacks=callbacks,
    )

    print('Training finished, best model saved to', out_path)

    # final evaluate
    eval_res = model.evaluate(val_ds)
    print('Validation evaluation:', eval_res)


if __name__ == '__main__':
    main()
