import argparse
from pathlib import Path

import torch
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms


def parse_args():
    p = argparse.ArgumentParser(description="Evaluate saved model on validation split")
    p.add_argument("--data-dir", default="dataset/train", help="dataset root (class subfolders)")
    p.add_argument("--checkpoint", default="models/resnet18_best.pth")
    p.add_argument("--batch-size", type=int, default=32)
    p.add_argument("--img-size", type=int, default=224)
    p.add_argument("--val-split", type=float, default=0.15)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--device", default=None)
    return p.parse_args()


def make_val_transform(img_size):
    return transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])


def build_val_loader(data_dir, img_size, batch_size, val_split, seed):
    val_t = make_val_transform(img_size)
    full_dataset = datasets.ImageFolder(root=data_dir, transform=val_t)
    total = len(full_dataset)
    val_count = max(1, int(total * val_split))
    train_count = total - val_count
    generator = torch.Generator().manual_seed(seed)
    _, val_ds = random_split(full_dataset, [train_count, val_count], generator=generator)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=4)
    classes = full_dataset.classes
    return val_loader, classes


def build_model(num_classes, device, checkpoint_path):
    model = models.resnet18(pretrained=False)
    in_features = model.fc.in_features
    model.fc = torch.nn.Linear(in_features, num_classes)
    ckpt = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(ckpt["model_state"])
    model = model.to(device)
    model.eval()
    return model


def evaluate(model, loader, device, classes):
    import torch

    num_classes = len(classes)
    conf = torch.zeros((num_classes, num_classes), dtype=torch.int64)
    total = 0
    correct = 0
    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            for t, p in zip(labels.view(-1), preds.view(-1)):
                conf[t.long(), p.long()] += 1
            correct += (preds == labels).sum().item()
            total += labels.size(0)

    overall = correct / total if total > 0 else 0.0
    per_class = {}
    for i, cls in enumerate(classes):
        tp = conf[i, i].item()
        total_true = conf[i].sum().item()
        acc = tp / total_true if total_true > 0 else 0.0
        per_class[cls] = acc

    return overall, per_class, conf


def main():
    args = parse_args()
    base_dir = Path(__file__).resolve().parent
    data_dir = Path(args.data_dir)
    if not data_dir.is_absolute():
        data_dir = base_dir / data_dir

    device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
    val_loader, classes = build_val_loader(str(data_dir), args.img_size, args.batch_size, args.val_split, args.seed)
    ckpt_path = Path(args.checkpoint)
    if not ckpt_path.is_absolute():
        ckpt_path = base_dir / ckpt_path
    model = build_model(len(classes), device, str(ckpt_path))

    overall, per_class, conf = evaluate(model, val_loader, device, classes)
    print(f"Overall accuracy: {overall*100:.2f}%")
    print("Per-class accuracy:")
    for cls, acc in per_class.items():
        print(f"  {cls}: {acc*100:.2f}%")
    print("Confusion matrix (rows=true, cols=pred):")
    print(conf)


if __name__ == "__main__":
    main()
