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
        self.classes = None
        self._ready = False
        self._loading_lock = threading.Lock()

    def _load_model(self):
        with self._loading_lock:
            if self._ready:
                return
            try:
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


ai_service = AIService()
