import os
import torch

p = os.path.join('AIWoundOrrashDettector', 'models', 'resnet18_best.pth')
print('path:', os.path.abspath(p))
print('exists:', os.path.exists(p))
if os.path.exists(p):
    ckpt = torch.load(p, map_location='cpu')
    print('keys:', list(ckpt.keys()))
    print('classes:', ckpt.get('classes'))
    # print model state type
    print('model_state type:', type(ckpt.get('model_state')))
