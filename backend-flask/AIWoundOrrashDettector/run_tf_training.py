import os
import hashlib
import argparse
import tensorflow as tf
from tensorflow.keras import layers, models

def compute_md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def build_model(input_shape, num_classes):
    model = models.Sequential([
        layers.Rescaling(1./255, input_shape=input_shape),
        layers.Conv2D(16, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(32, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(),
        layers.Conv2D(64, 3, padding='same', activation='relu'),
        layers.MaxPooling2D(),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dense(num_classes)
    ])
    return model

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', default='dataset/train')
    parser.add_argument('--img-size', type=int, default=180)
    parser.add_argument('--batch-size', type=int, default=32)
    parser.add_argument('--epochs', type=int, default=10)
    parser.add_argument('--out', default='detector_model.h5')
    args = parser.parse_args()

    base = os.path.dirname(__file__)
    data_dir = os.path.join(base, args.data_dir) if not os.path.isabs(args.data_dir) else args.data_dir
    if not os.path.isdir(data_dir):
        raise SystemExit(f"Data directory not found: {data_dir}")

    img_size = (args.img_size, args.img_size)

    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset='training',
        seed=123,
        image_size=img_size,
        batch_size=args.batch_size
    )

    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset='validation',
        seed=123,
        image_size=img_size,
        batch_size=args.batch_size
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print('Classes:', class_names)

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    model = build_model((args.img_size, args.img_size, 3), num_classes)
    model.compile(optimizer='adam',
                  loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
                  metrics=['accuracy'])

    model.summary()

    history = model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)

    val_acc = history.history.get('val_accuracy')[-1] if history.history.get('val_accuracy') else None
    print('Final validation accuracy:', val_acc)

    out_path = os.path.join(base, args.out)
    model.save(out_path)
    print('Saved model to', out_path)

    md5 = compute_md5(out_path)
    print('MD5:', md5)

if __name__ == '__main__':
    main()
