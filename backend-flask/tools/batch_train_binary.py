"""Batch trainer: trains one-vs-rest binary models for every class found in dataset.

This script calls the existing `train_binary_class.py` for each class.
Use for automated experiments; prefer running inside the project's venv.
"""
import argparse
import os
import subprocess
import json


def discover_classes(data_dir):
    classes = []
    for name in sorted(os.listdir(data_dir)):
        p = os.path.join(data_dir, name)
        if os.path.isdir(p):
            classes.append(name)
    return classes


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--data-dir', default=os.path.join('AIWoundOrrashDettector', 'dataset', 'train'))
    p.add_argument('--epochs', type=int, default=10)
    p.add_argument('--batch-size', type=int, default=16)
    p.add_argument('--img-size', type=int, default=180)
    p.add_argument('--classes', nargs='*', default=None)
    p.add_argument('--venv-python', default=None,
                   help='Path to venv python to run each training subprocess (recommended)')
    args = p.parse_args()

    classes = args.classes or discover_classes(args.data_dir)
    print('Classes to train:', classes)

    python_cmd = args.venv_python or 'python'
    script_dir = os.path.dirname(os.path.abspath(__file__))
    train_script = os.path.join(script_dir, 'train_binary_class.py')

    for cls in classes:
        print('\n--- Training binary for class:', cls)
        cmd = [python_cmd, train_script, '--class', cls,
               '--epochs', str(args.epochs), '--batch-size', str(args.batch_size), '--img-size', str(args.img_size), '--data-dir', args.data_dir]
        print('Running:', ' '.join(cmd))
        subprocess.check_call(cmd)

    print('\nBatch training complete.')


if __name__ == '__main__':
    main()
