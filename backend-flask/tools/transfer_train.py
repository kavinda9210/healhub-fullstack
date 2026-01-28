import tensorflow as tf
from pathlib import Path
import json

BASE = Path(__file__).resolve().parents[1]
DATA_DIR = BASE / 'AIWoundOrrashDettector' / 'dataset' / 'train'
OUT = BASE / 'AIWoundOrrashDettector' / 'AIWoundAndRashDetector_mobilenet.h5'

def build_and_train(img_size=(224,224), batch_size=16, epochs=3, out=None):
    # augmentation pipeline
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip('horizontal'),
        tf.keras.layers.RandomRotation(0.08),
        tf.keras.layers.RandomZoom(0.08),
        tf.keras.layers.RandomContrast(0.08),
    ])

    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR,
        validation_split=0.2,
        subset='training',
        seed=123,
        image_size=img_size,
        batch_size=batch_size
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR,
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

    base = tf.keras.applications.MobileNetV2(input_shape=(img_size[0], img_size[1], 3), include_top=False, weights='imagenet')
    base.trainable = False

    inputs = tf.keras.Input(shape=(img_size[0], img_size[1], 3))
    x = data_augmentation(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(num_classes)(x)
    model = tf.keras.Model(inputs, outputs)

    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True), metrics=['accuracy'])
    model.summary()

    # initial training with base frozen
    initial_epochs = max(1, epochs // 2)
    fine_tune_epochs = max(1, epochs - initial_epochs)

    print(f'Initial training for {initial_epochs} epochs (base frozen)')
    model.fit(train_ds, validation_data=val_ds, epochs=initial_epochs)

    # unfreeze top layers of base for fine-tuning
    base.trainable = True
    # freeze all but last N layers
    fine_tune_at = int(len(base.layers) * 0.6)
    for layer in base.layers[:fine_tune_at]:
        layer.trainable = False
    for layer in base.layers[fine_tune_at:]:
        layer.trainable = True

    model.compile(optimizer=tf.keras.optimizers.Adam(1e-4), loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True), metrics=['accuracy'])
    print(f'Fine-tuning for {fine_tune_epochs} epochs (top base layers unfrozen)')
    model.fit(train_ds, validation_data=val_ds, epochs=fine_tune_epochs)

    out_path = OUT if out is None else (BASE / 'AIWoundOrrashDettector' / out)
    model.save(out_path)
    print('Saved transfer model to', out_path)
    # save classes
    with open(BASE / 'AIWoundOrrashDettector' / 'classes.json', 'w', encoding='utf-8') as f:
        json.dump(class_names, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    build_and_train()
