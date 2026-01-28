import argparse
import tensorflow as tf
from pathlib import Path

def build_and_train(data_dir, img_size=(180,180), batch_size=32, epochs=10, out='AIWoundAndRashDetector.h5'):
    data_dir = Path(data_dir)
    print('Loading dataset from', data_dir)
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset='training',
        seed=123,
        image_size=img_size,
        batch_size=batch_size
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset='validation',
        seed=123,
        image_size=img_size,
        batch_size=batch_size
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print('Classes:', class_names)

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    model = tf.keras.Sequential([
        tf.keras.layers.Rescaling(1./255, input_shape=(img_size[0], img_size[1], 3)),
        tf.keras.layers.Conv2D(16, 3, padding='same', activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(32, 3, padding='same', activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Conv2D(64, 3, padding='same', activation='relu'),
        tf.keras.layers.MaxPooling2D(),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(num_classes)
    ])

    model.compile(optimizer='adam', loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True), metrics=['accuracy'])
    model.summary()

    history = model.fit(train_ds, validation_data=val_ds, epochs=epochs)

    out_path = Path('AIWoundOrrashDettector') / out
    model.save(out_path)
    print('Saved model to', out_path)
    # save classes mapping
    import json
    with open(Path('AIWoundOrrashDettector') / 'classes.json', 'w', encoding='utf-8') as f:
        json.dump(class_names, f, ensure_ascii=False, indent=2)
    print('Saved classes.json')

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--data-dir', default='AIWoundOrrashDettector/dataset/train')
    p.add_argument('--epochs', type=int, default=10)
    p.add_argument('--batch-size', type=int, default=32)
    p.add_argument('--img-size', type=int, nargs=2, default=(180,180))
    p.add_argument('--out', default='AIWoundAndRashDetector.h5')
    args = p.parse_args()
    build_and_train(args.data_dir, tuple(args.img_size), args.batch_size, args.epochs, args.out)
