import torch
import torchvision.transforms as transforms
from torchvision.models import efficientnet_b3
from ultralytics import YOLO
from PIL import Image
import json
from io import BytesIO

def recognize_food(image_bytes: bytes) -> str:

    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    
    DETECTION_MODEL_PATH = "object_detection.pt"
    CLASSIFICATION_MODEL_PATH = "classification.pt"
    CLASSES_JSON = "classes.json"

    
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    
    classification_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    with open(CLASSES_JSON, 'r') as f:
        class_map = json.load(f)
    class_names = [class_map[str(i)] for i in range(len(class_map))]

    detection_model = YOLO(DETECTION_MODEL_PATH)
    detection_model.fuse()
    detection_model.to(DEVICE).eval()

    
    clf = efficientnet_b3(weights=None)
    clf.classifier[1] = torch.nn.Linear(clf.classifier[1].in_features, len(class_names))
    clf.load_state_dict(torch.load(CLASSIFICATION_MODEL_PATH, map_location=DEVICE))
    clf.to(DEVICE).eval()


    results = detection_model(image, device=DEVICE, imgsz=640, max_det=1)
    boxes = results[0].boxes.xyxy.cpu().numpy()
    if boxes.size == 0:
        return "unknown"
    x1, y1, x2, y2 = boxes[0].astype(int)
    crop = image.crop((x1, y1, x2, y2))

    inp = classification_transform(crop).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        out = clf(inp)
        _, pred = out.max(1)

    return class_names[pred.item()]