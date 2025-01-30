import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
from torchvision.models import ResNet18_Weights

def main():
    # Parametry
    batch_size = 64
    learning_rate = 0.001
    num_epochs = 10
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # Transformacje danych
    transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    # Wczytanie zbioru danych
    dataset_path = './data/food-101/images'
    dataset = datasets.ImageFolder(root=dataset_path, transform=transform)
    train_loader = DataLoader(dataset, batch_size=batch_size, shuffle=True, num_workers=4, pin_memory=True)

    # Model
    model = models.resnet18(weights=ResNet18_Weights.DEFAULT)
    model.fc = nn.Linear(model.fc.in_features, len(dataset.classes))
    model = model.to(device)

    # Funkcja kosztu i optymalizator
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    # Mixed Precision Training
    scaler = torch.amp.GradScaler(enabled=torch.cuda.is_available())


    # Funkcja treningowa
    def train(model, train_loader, criterion, optimizer, scaler, num_epochs):
        for epoch in range(num_epochs):
            model.train()
            train_loss = 0.0

            for images, labels in train_loader:
                images, labels = images.to(device), labels.to(device)

                # Mixed Precision Forward Pass
                with torch.amp.autocast(device_type='cuda', enabled=torch.cuda.is_available()):

                    outputs = model(images)
                    loss = criterion(outputs, labels)

                # Backward Pass
                optimizer.zero_grad()
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()

                train_loss += loss.item() * images.size(0)

            train_loss /= len(train_loader.dataset)
            print(f"Epoch {epoch+1}/{num_epochs}, Train Loss: {train_loss:.4f}")

        # Zapis modelu jako state_dict
        torch.save({
        'model_state_dict': model.state_dict(),
        'class_to_idx': dataset.class_to_idx  # Zapisujemy mapowanie klas
        }, 'gpu_food_classification_model.pth')
        print('Model saved to gpu_food_classification_model.pth')


    # Trening
    train(model, train_loader, criterion, optimizer, scaler, num_epochs)

if __name__ == "__main__":
    main()
