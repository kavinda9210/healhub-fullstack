import importlib.util
from pathlib import Path
p = Path(__file__).resolve().parents[1] / 'app' / 'services' / 'ai_service.py'
spec = importlib.util.spec_from_file_location('ai_service_local', str(p))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
svc = getattr(mod, 'ai_service', None)
print('ai_service present:', svc is not None)
if svc:
    # force load models
    try:
        svc._load_model()
    except Exception:
        pass
    print('ready:', svc._ready)
    print('keras_model:', getattr(svc, 'keras_model', None) is not None)
    print('keras_model_path:', getattr(svc, 'keras_model_path', None))
    print('classes count:', len(getattr(svc, 'classes', []) or []))
    print('binary models:', list(getattr(svc, 'binary_models', {}).keys()))
    print('other models:', list(getattr(svc, 'other_models', {}).keys()))
