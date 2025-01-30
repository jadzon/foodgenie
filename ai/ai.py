import io
import os
import random
import torch
import torch.nn as nn
from PIL import Image
from flask import Flask, request, jsonify, abort
from torchvision import transforms, models
from torchvision.models import ResNet18_Weights

app = Flask(__name__)

SECRET_KEY = "sekretnehaslo"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Wczytujemy model
model = models.resnet18(weights=ResNet18_Weights.DEFAULT)
model.fc = nn.Linear(model.fc.in_features, 101)  # 101 klas dla Food-101
checkpoint = torch.load("gpu_food_classification_model.pth", map_location=device)
model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()

# Mapowanie klas
class_to_idx = checkpoint.get("class_to_idx", None)
if class_to_idx is None:
    raise ValueError("Model checkpoint does not contain 'class_to_idx'. Ensure it was saved correctly.")
idx_to_class = {idx: cls for cls, idx in class_to_idx.items()}

# Transformacje obrazu
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def model_inference(pil_image: Image.Image):
    """
    Wykonuje inferencję na obrazie i zwraca składniki oraz sumę kalorii.
    """
    input_tensor = transform(pil_image).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        top5_prob, top5_catid = torch.topk(probabilities, 5)
    
    recognized_ingredients = []
    total_calories = 0

    for i in range(top5_prob.size(0)):
        class_name = idx_to_class[top5_catid[i].item()]
        cals = random.randint(50, 500)
        recognized_ingredients.append({
            "name": class_name.replace("_", " ").title(),
            "calories": cals
        })
        total_calories += cals

    return {
        "ingredients": recognized_ingredients,
        "calories": total_calories
    }

@app.errorhandler(400)
def bad_request(error):
    response = jsonify({"error": error.description})
    response.status_code = 400
    return response

@app.errorhandler(401)
def unauthorized(error):
    response = jsonify({"error": error.description})
    response.status_code = 401
    return response
@app.route('/analyse', methods=['POST'])
def analyse():
    """
    Endpoint /analyse:
    - Sprawdza nagłówek autoryzacyjny.
    - Przyjmuje obraz i uruchamia model.
    - Zwraca składniki i sumę kalorii w formacie JSON.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header or auth_header != SECRET_KEY:
        abort(401, description="Brak autoryzacji lub niepoprawne hasło.")

    # Dodaj logowanie kluczy w request.files
    app.logger.debug(f"Dostępne klucze w request.files: {request.files.keys()}")

    if 'image' not in request.files:
        abort(400, description="Nie przesłano pliku 'image'.")
    file = request.files['image']

    if file.filename == '':
        abort(400, description="Nazwa pliku jest pusta.")

    allowed_ext = ['.png', '.jpg', '.jpeg']
    if not any(file.filename.lower().endswith(ext) for ext in allowed_ext):
        abort(400, description="Dozwolone są pliki PNG/JPG/JPEG.")

    image_data = file.read()
    try:
        pil_image = Image.open(io.BytesIO(image_data)).convert('RGB')
    except Exception:
        abort(400, description="Błąd podczas otwierania obrazu.")

    result = model_inference(pil_image)
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)