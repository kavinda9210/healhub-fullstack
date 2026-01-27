import argparse
import os
import random
from pathlib import Path

import torch
from torch import nn, optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms
from tqdm import tqdm


def parse_args():
    p = argparse.ArgumentParser(description="Train wound/rash classifier")
    p.add_argument("--data-dir", default="dataset/train", help="dataset root (class subfolders)")
    p.add_argument("--epochs", type=int, default=10)
    p.add_argument("--batch-size", type=int, default=32)
    p.add_argument("--lr", type=float, default=1e-4)
    p.add_argument("--img-size", type=int, default=224)
    p.add_argument("--val-split", type=float, default=0.15)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--device", default=None, help="cuda or cpu (auto if empty)")
    p.add_argument("--out", default="models", help="output dir for saved model")
    return p.parse_args()


def make_transforms(img_size):
    train_t = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(0.1, 0.1, 0.1, 0.02),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    val_t = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    return train_t, val_t


def build_dataloaders(data_dir, img_size, batch_size, val_split, seed):
    train_t, val_t = make_transforms(img_size)
    full_dataset = datasets.ImageFolder(root=data_dir, transform=train_t)

    # split into train/val
    total = len(full_dataset)
    val_count = max(1, int(total * val_split))
    train_count = total - val_count
    generator = torch.Generator().manual_seed(seed)
    train_ds, val_ds = random_split(full_dataset, [train_count, val_count], generator=generator)

    # override val transform
    val_ds.dataset = datasets.ImageFolder(root=data_dir, transform=val_t)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=4)

    classes = full_dataset.classes
    return train_loader, val_loader, classes


def build_model(num_classes, device):
    model = models.resnet18(pretrained=True)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    model = model.to(device)
    return model


def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    for images, labels in tqdm(loader, desc="train", leave=False):
        images = images.to(device)
        labels = labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += images.size(0)

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc


def validate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in tqdm(loader, desc="val", leave=False):
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += images.size(0)

    val_loss = running_loss / total
    val_acc = correct / total
    return val_loss, val_acc


def main():
    args = parse_args()
    base_dir = Path(__file__).resolve().parent
    data_dir = Path(args.data_dir)
    if not data_dir.is_absolute():
        data_dir = base_dir / data_dir

    device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")

    train_loader, val_loader, classes = build_dataloaders(str(data_dir), args.img_size, args.batch_size, args.val_split, args.seed)
    model = build_model(len(classes), device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr)

    best_acc = 0.0
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, args.epochs + 1):
        print(f"Epoch {epoch}/{args.epochs}")
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        print(f"  train loss: {train_loss:.4f} acc: {train_acc:.4f}")
        print(f"  val   loss: {val_loss:.4f} acc: {val_acc:.4f}")

        if val_acc > best_acc:
            best_acc = val_acc
            save_path = out_dir / f"resnet18_best.pth"
            torch.save({
                "model_state": model.state_dict(),
                "classes": classes,
                "args": vars(args)
            }, save_path)
            print(f"  Saved best model ({best_acc:.4f}) to {save_path}")

    print("Training finished. Best val acc:", best_acc)


if __name__ == "__main__":
    main()
