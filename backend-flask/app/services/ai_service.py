import io
import os
import json
import threading
import subprocess
import sys
from typing import Dict, Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
AI_DIR = os.path.join(BASE_DIR, 'AIWoundOrrashDettector')


class AIService:
    def __init__(self):
        # Lazy-load model when available; fallback to stub
        self.model = None
        self.keras_model = None
        self.binary_models = {}
        self.classes = None
        self._ready = False
        self._loading_lock = threading.Lock()

    def _load_model(self):
        with self._loading_lock:
            if self._ready:
                return
            try:
                # Try to load a Keras (.h5) model if present
                from PIL import Image
                try:
                    h5_candidates = [f for f in os.listdir(AI_DIR) if f.endswith('.h5')]
                    # prefer AIWoundAndRashDetector.h5 if present
                    preferred = 'AIWoundAndRashDetector.h5'
                    if preferred in h5_candidates:
                        h5_path = os.path.join(AI_DIR, preferred)
                    else:
                        h5_path = os.path.join(AI_DIR, h5_candidates[0]) if h5_candidates else None
                except Exception:
                    h5_path = None

                if h5_path and os.path.exists(h5_path):
                    try:
                        import json
                        import numpy as np
                        from tensorflow.keras.models import load_model

                        keras_model = load_model(h5_path)
                        self.keras_model = keras_model
                        self.keras_model_path = h5_path

                        # try to load classes from classes.json if saved during training
                        classes_file = os.path.join(AI_DIR, 'classes.json')
                        classes = []
                        if os.path.exists(classes_file):
                            try:
                                with open(classes_file, 'r', encoding='utf-8') as cf:
                                    classes = json.load(cf)
                            except Exception:
                                classes = []

                        # discover classes from dataset folder as fallback
                        data_dir = os.path.join(AI_DIR, 'dataset', 'train')
                        if not classes and os.path.isdir(data_dir):
                            classes = sorted([d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))])

                        self.classes = classes
                        self.model = None
                        print(f'Keras model loaded from: {h5_path}')
                        print(f'Classes set to: {self.classes}')
                        # try to load any binary one-vs-rest models too
                        try:
                            from tensorflow.keras.models import load_model as _load_model_fn
                            bin_models = {}
                            for fn in os.listdir(AI_DIR):
                                if fn.startswith('AIWoundAndRashDetector_binary_') and fn.endswith('.h5'):
                                    clsname = fn[len('AIWoundAndRashDetector_binary_'):-3].replace('_', ' ')
                                    bin_path = os.path.join(AI_DIR, fn)
                                    try:
                                        bm = _load_model_fn(bin_path)
                                        bin_models[clsname] = (bm, 180)
                                    except Exception:
                                        # fallback: rebuild architecture and load weights
                                        try:
                                            from tensorflow import keras as _keras
                                            base = _keras.applications.MobileNetV2(weights='imagenet', include_top=False, pooling='avg', input_shape=(180,180,3))
                                            base.trainable = False
                                            inp = _keras.Input(shape=(180,180,3))
                                            x = _keras.applications.mobilenet_v2.preprocess_input(inp)
                                            x = base(x, training=False)
                                            x = _keras.layers.Dense(128, activation='relu')(x)
                                            x = _keras.layers.Dropout(0.3)(x)
                                            out = _keras.layers.Dense(1, activation='sigmoid')(x)
                                            bm = _keras.Model(inp, out)
                                            bm.load_weights(bin_path)
                                            bin_models[clsname] = (bm, 180)
                                        except Exception:
                                            # skip if cannot load
                                            pass
                            self.binary_models = bin_models
                            if self.binary_models:
                                print('Loaded binary models for classes:', list(self.binary_models.keys()))
                        except Exception:
                            pass
                        self._ready = True
                        return
                    except Exception as e:
                        # if keras load fails, continue to try torch
                        print('Keras model load failed:', e)
                        self.keras_model = None

                import torch
                from torchvision import transforms, models
                from PIL import Image

                # Attempt to discover classes from dataset folder
                data_dir = os.path.join(AI_DIR, 'dataset', 'train')
                classes = []
                if os.path.isdir(data_dir):
                    classes = sorted([d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))])

                ckpt = os.path.join(AI_DIR, 'models', 'resnet18_best.pth')
                device = 'cpu'
                if classes and os.path.exists(ckpt):
                    model = models.resnet18(pretrained=False)
                    in_features = model.fc.in_features
                    model.fc = torch.nn.Linear(in_features, len(classes))
                    ckpt_data = torch.load(ckpt, map_location=device)
                    model.load_state_dict(ckpt_data.get('model_state', ckpt_data))
                    model.to(device)
                    model.eval()
                    self.model = model
                    self.classes = ckpt_data.get('classes') or classes
                else:
                    # no model found -> leave as None
                    self.model = None
                    self.classes = classes or []

            except Exception as e:
                # Torch not available or load failed; fall back to stub mode
                import traceback
                print('AI model load failed:', e)
                traceback.print_exc()
                self.model = None
                self.keras_model = None
                self.classes = []

            self._ready = True

    def detect(self, image_bytes: bytes) -> Dict[str, Any]:
        """Return a detection result: {label, confidence, treatments, specialization}

        If a PyTorch model is available it will be used, otherwise a simple stub mapping is returned.
        """
        if not self._ready:
            self._load_model()

        # Minimal stub mapping to treatments and specializations
        mapping = {
            'Acne': {
                'treatments': ['Topical benzoyl peroxide', 'Topical retinoids', 'Keep area clean'],
                'specialization': 'Dermatology'
            },
            'Eczema': {
                'treatments': ['Topical corticosteroids', 'Moisturizers', 'Avoid irritants'],
                'specialization': 'Dermatology'
            },
            'Diabetic Foot Ulcer': {
                'treatments': ['Wound debridement', 'Antibiotics if infected', 'Offloading and dressings'],
                'specialization': 'Wound Care'
            },
            'Fungal Infection': {
                'treatments': ['Topical antifungals', 'Keep area dry'],
                'specialization': 'Dermatology'
            }
        }

        # Try model inference if available
        model_used = False
        # Prefer Keras model if available
        if getattr(self, 'keras_model', None) is not None and self.classes is not None:
            try:
                import numpy as np
                from PIL import Image
                keras = self.keras_model

                img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
                # determine target size from model input if possible
                input_shape = getattr(keras, 'input_shape', None)
                if input_shape and len(input_shape) >= 3:
                    # shape may be (None, H, W, C) or (None, C, H, W)
                    if input_shape[1] is None or input_shape[2] is None:
                        target_size = (224, 224)
                    else:
                        target_size = (int(input_shape[1]), int(input_shape[2]))
                else:
                    target_size = (224, 224)

                img = img.resize(target_size)
                arr = np.asarray(img).astype('float32') / 255.0
                # ensure batch dim
                if arr.ndim == 3:
                    arr = np.expand_dims(arr, 0)
                preds = keras.predict(arr)
                # convert logits to probabilities using softmax (matches training notebook)
                try:
                    import numpy as _np
                    p = preds[0]
                    # numerical-stable softmax
                    e = _np.exp(p - _np.max(p))
                    probs = e / _np.sum(e)
                    idx = int(_np.argmax(probs))
                    confidence = float(probs[idx])
                except Exception:
                    # fallback: try simpler handling
                    try:
                        idx = int(preds[0].argmax())
                        confidence = float(preds[0][idx])
                    except Exception:
                        idx = 0
                        confidence = 0.0

                label = self.classes[idx] if self.classes and idx < len(self.classes) else f'Class_{idx}'
                model_used = True
            except Exception:
                label = 'Unknown'
                confidence = 0.0

        elif self.model and self.classes:
            try:
                from PIL import Image
                import torch
                from torchvision import transforms

                img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
                t = transforms.Compose([
                    transforms.Resize((224, 224)),
                    transforms.ToTensor(),
                    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
                ])
                x = t(img).unsqueeze(0)
                with torch.no_grad():
                    out = self.model(x)
                    probs = torch.nn.functional.softmax(out[0], dim=0)
                    val, idx = torch.max(probs, 0)
                    label = self.classes[idx.item()]
                    confidence = float(val.item())
                    model_used = True
            except Exception:
                label = 'Unknown'
                confidence = 0.0
        else:
            # Fallback: simple heuristic based on filename bytes length
            label = 'Acne' if len(image_bytes) % 2 == 0 else 'Eczema'
            confidence = 0.6

        info = mapping.get(label, {
            'treatments': ['Visit a clinician for diagnosis'],
            'specialization': 'General'
        })

        return {
            'label': label,
            'confidence': confidence,
            'treatments': info['treatments'],
            'specialization': info['specialization'],
            'model_used': model_used
        }

    def train_and_evaluate(self, epochs: int = 10, batch_size: int = 32, img_size: int = 224, min_accuracy: float = 0.9, blocking: bool = False):
        """Run the training script and evaluation. If blocking=True it will run synchronously and raise if min_accuracy not met.

        Otherwise it starts training in a background thread.
        """
        def _run():
            try:
                # run train.py
                cmd = [sys.executable, 'train.py', '--data-dir', 'dataset/train', '--epochs', str(epochs), '--batch-size', str(batch_size), '--img-size', str(img_size), '--out', 'models']
                proc = subprocess.run(cmd, cwd=AI_DIR, capture_output=True, text=True)
                print('TRAIN STDOUT:', proc.stdout)
                print('TRAIN STDERR:', proc.stderr)

                # run evaluate.py
                ckpt = os.path.join(AI_DIR, 'models', 'resnet18_best.pth')
                if os.path.exists(ckpt):
                    cmd2 = [sys.executable, 'evaluate.py', '--checkpoint', str(ckpt), '--data-dir', 'dataset/train', '--img-size', str(img_size)]
                    proc2 = subprocess.run(cmd2, cwd=AI_DIR, capture_output=True, text=True)
                    print('EVAL STDOUT:', proc2.stdout)
                    print('EVAL STDERR:', proc2.stderr)
                    # parse overall accuracy line
                    overall = 0.0
                    for line in proc2.stdout.splitlines():
                        if 'Overall accuracy' in line:
                            try:
                                overall = float(line.split(':')[-1].strip().strip('%')) / 100.0
                            except Exception:
                                overall = 0.0
                    print('Model overall accuracy:', overall)
                    # reload model if good
                    if overall >= min_accuracy:
                        # reload model into memory
                        self._ready = False
                        self._load_model()
                    else:
                        print(f'Model accuracy {overall:.2f} below threshold {min_accuracy:.2f}')
                        if blocking:
                            raise Exception(f'Model accuracy {overall:.2f} below required {min_accuracy:.2f}')
                else:
                    print('No checkpoint produced by training')
            except Exception as e:
                print('Training/eval error:', e)

        if blocking:
            _run()
        else:
            t = threading.Thread(target=_run, daemon=True)
            t.start()

    def predict_proba(self, image_bytes: bytes):
        """Return (classes, probs) where probs is a list of probabilities matching classes order.

        Returns ([], []) if no model available.
        """
        if not self._ready:
            self._load_model()

        # Keras path
        if getattr(self, 'keras_model', None) is not None and self.classes is not None:
            try:
                import numpy as np
                from PIL import Image
                keras = self.keras_model

                img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
                # determine target size from model input if possible
                input_shape = getattr(keras, 'input_shape', None)
                if input_shape and len(input_shape) >= 3:
                    if input_shape[1] is None or input_shape[2] is None:
                        target_size = (180, 180)
                    else:
                        target_size = (int(input_shape[1]), int(input_shape[2]))
                else:
                    target_size = (180, 180)

                img = img.resize(target_size)
                arr = np.asarray(img).astype('float32') / 255.0
                if arr.ndim == 3:
                    arr = np.expand_dims(arr, 0)
                preds = keras.predict(arr)
                p = preds[0]
                e = np.exp(p - np.max(p))
                probs = (e / np.sum(e)).tolist()
                return (self.classes or [], probs)
            except Exception:
                return (self.classes or [], [])

        # PyTorch path
        if self.model and self.classes:
            try:
                from PIL import Image
                import torch
                from torchvision import transforms

                img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
                t = transforms.Compose([
                    transforms.Resize((224, 224)),
                    transforms.ToTensor(),
                    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
                ])
                x = t(img).unsqueeze(0)
                with torch.no_grad():
                    out = self.model(x)
                    probs = torch.nn.functional.softmax(out[0], dim=0).cpu().numpy().tolist()
                    return (self.classes or [], probs)
            except Exception:
                return (self.classes or [], [])

        return ([], [])

    def detect_all(self, image_bytes: bytes, binary_threshold: float = 0.5):
        """Return combined predictions from the multiclass model and all loaded binary models.

        Result format:
        {
            'multiclass': {'classes': [...], 'probs': [...]},
            'binaries': {'Class Name': prob, ...},
            'ensemble_label': 'Class',
            'ensemble_confidence': 0.9
        }
        """
        if not self._ready:
            self._load_model()

        mc_classes, mc_probs = self.predict_proba(image_bytes)

        binaries = {}
        for clsname, (bm, img_size) in getattr(self, 'binary_models', {}).items():
            try:
                import numpy as _np
                from PIL import Image as _Image
                img = _Image.open(io.BytesIO(image_bytes)).convert('RGB')
                img = img.resize((img_size, img_size))
                arr = _np.asarray(img).astype('float32')
                # mobilenet preprocess
                from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
                arr = preprocess_input(arr)
                if arr.ndim == 3:
                    arr = _np.expand_dims(arr, 0)
                p = bm.predict(arr)
                # sigmoid output
                prob = float(p.reshape(-1)[0])
                binaries[clsname] = prob
            except Exception:
                binaries[clsname] = 0.0

        # determine ensemble: prefer binary with highest prob if above threshold
        best_bin = None
        if binaries:
            best_cls = max(binaries.items(), key=lambda x: x[1])
            if best_cls[1] >= binary_threshold:
                best_bin = best_cls

        # fallback to multiclass top-1
        ensemble_label = None
        ensemble_confidence = 0.0
        if best_bin:
            ensemble_label = best_bin[0]
            ensemble_confidence = best_bin[1]
        elif mc_classes and mc_probs:
            idx = int(__import__('numpy').argmax(mc_probs))
            ensemble_label = mc_classes[idx]
            ensemble_confidence = float(mc_probs[idx]) if mc_probs else 0.0

        return {
            'multiclass': {'classes': mc_classes, 'probs': mc_probs},
            'binaries': binaries,
            'ensemble_label': ensemble_label,
            'ensemble_confidence': ensemble_confidence
        }


ai_service = AIService()
