"""
Przykład aplikacji Flask z wykorzystaniem PyTorcha (ResNet50).
Wykrywa podstawowe składniki jedzenia (z top-5 predykcji ImageNet)
i przypisuje im losową wartość kalorii.
"""

import io
import random
import urllib.request

import torch
from torch.nn.functional import softmax
from torchvision import models, transforms

from PIL import Image
from flask import Flask, request, jsonify, abort

app = Flask(__name__)

# --- 1. Proste "zabezpieczenie" hasłem ---
SECRET_KEY = "sekretnehaslo"

# --- 2. Ładujemy pretrenowany model ResNet50 (ImageNet) ---
model = models.resnet50(pretrained=True)
model.eval()

# --- 3. Pobieramy listę 1000 klas ImageNet (online) ---
url_labels = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
class_idx = urllib.request.urlopen(url_labels).read().decode("utf-8").split("\n")

# --- 4. Definiujemy transformację obrazu pod ResNet (ImageNet) ---
transform_pipeline = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# --- 5. Lista prostych słów kluczowych kojarzących się z jedzeniem ---
# Możesz ją dowolnie rozszerzyć.
food_synonyms = {
    "chicken": "Chicken", "broccoli": "Broccoli", "rice": "Rice", "pizza": "Pizza", "pasta": "Pasta",
    "carrot": "Carrot", "egg": "Egg", "banana": "Banana", "apple": "Apple", "steak": "Steak",
    "bread": "Bread", "burger": "Burger", "sandwich": "Sandwich", "soup": "Soup", "cheese": "Cheese",
    "fish": "Fish", "fruit": "Fruit", "vegetable": "Vegetable", "potato": "Potato", "onion": "Onion",
    "tomato": "Tomato", "corn": "Corn", "cake": "Cake", "sausage": "Sausage", "pork": "Pork",
    "beef": "Beef", "shrimp": "Shrimp", "lobster": "Lobster", "salad": "Salad", "meat": "Meat",
    "food": "Food", "dessert": "Dessert", "turkey": "Turkey", "duck": "Duck", "goose": "Goose",
    "quail": "Quail", "salmon": "Salmon", "tuna": "Tuna", "cod": "Cod", "sardine": "Sardine",
    "mackerel": "Mackerel", "trout": "Trout", "crab": "Crab", "oyster": "Oyster", "clam": "Clam",
    "mussel": "Mussel", "scallop": "Scallop", "lamb": "Lamb", "bacon": "Bacon", "ham": "Ham",
    "pepperoni": "Pepperoni", "salami": "Salami", "cucumber": "Cucumber", "zucchini": "Zucchini", "squash": "Squash",
    "pumpkin": "Pumpkin", "eggplant": "Eggplant", "cabbage": "Cabbage", "lettuce": "Lettuce", "spinach": "Spinach",
    "kale": "Kale", "celery": "Celery", "asparagus": "Asparagus", "artichoke": "Artichoke", "beet": "Beet",
    "radish": "Radish", "garlic": "Garlic", "ginger": "Ginger", "chili": "Chili", "pepper": "Pepper",
    "bell pepper": "Bell Pepper", "jalapeno": "Jalapeno", "habanero": "Habanero", "mushroom": "Mushroom",
    "truffle": "Truffle", "olive": "Olive", "pickle": "Pickle", "orange": "Orange", "lemon": "Lemon",
    "lime": "Lime", "grapefruit": "Grapefruit", "grape": "Grape", "strawberry": "Strawberry", "blueberry": "Blueberry",
    "raspberry": "Raspberry", "blackberry": "Blackberry", "cranberry": "Cranberry", "cherry": "Cherry", "peach": "Peach",
    "plum": "Plum", "apricot": "Apricot", "nectarine": "Nectarine", "pear": "Pear", "mango": "Mango",
    "pineapple": "Pineapple", "papaya": "Papaya", "kiwi": "Kiwi", "melon": "Melon", "watermelon": "Watermelon",
    "honeydew": "Honeydew", "cantaloupe": "Cantaloupe", "coconut": "Coconut", "avocado": "Avocado", "nut": "Nut",
    "peanut": "Peanut", "almond": "Almond", "walnut": "Walnut", "cashew": "Cashew", "pecan": "Pecan",
    "pistachio": "Pistachio", "hazelnut": "Hazelnut", "macadamia": "Macadamia", "grain": "Grain", "wheat": "Wheat",
    "oat": "Oat", "barley": "Barley", "rye": "Rye", "quinoa": "Quinoa", "millet": "Millet",
    "buckwheat": "Buckwheat", "bagel": "Bagel", "croissant": "Croissant", "muffin": "Muffin", "biscuit": "Biscuit",
    "cookie": "Cookie", "cracker": "Cracker", "pretzel": "Pretzel", "pie": "Pie", "tart": "Tart",
    "donut": "Donut", "pastry": "Pastry", "chocolate": "Chocolate", "caramel": "Caramel", "vanilla": "Vanilla",
    "cinnamon": "Cinnamon", "ice cream": "Ice Cream", "yogurt": "Yogurt", "milk": "Milk", "butter": "Butter",
    "cream": "Cream", "fries": "Fries", "chips": "Chips", "popcorn": "Popcorn", "noodle": "Noodle",
    "dumpling": "Dumpling", "wonton": "Wonton", "sushi": "Sushi", "sashimi": "Sashimi", "tempura": "Tempura",
    "ramen": "Ramen", "pho": "Pho", "taco": "Taco", "burrito": "Burrito", "enchilada": "Enchilada",
    "quesadilla": "Quesadilla", "fajita": "Fajita", "nachos": "Nachos", "paella": "Paella", "risotto": "Risotto",
    "curry": "Curry", "stew": "Stew", "chili con carne": "Chili Con Carne", "lasagna": "Lasagna", "spaghetti": "Spaghetti",
    "ravioli": "Ravioli", "macaroni": "Macaroni", "fettuccine": "Fettuccine", "pesto": "Pesto", "marinara": "Marinara",
    "alfredo": "Alfredo", "bbq": "Bbq", "fried chicken": "Fried Chicken", "roast beef": "Roast Beef", "grilled cheese": "Grilled Cheese",
    "club sandwich": "Club Sandwich", "reuben sandwich": "Reuben Sandwich", "blt sandwich": "Blt Sandwich", "hot dog": "Hot Dog",
    "kebab": "Kebab", "falafel": "Falafel", "hummus": "Hummus", "gyro": "Gyro", "pizza roll": "Pizza Roll",
    "egg roll": "Egg Roll", "spring roll": "Spring Roll", "pancake": "Pancake", "waffle": "Waffle", "french toast": "French Toast",
    "omelette": "Omelette", "frittata": "Frittata", "quiche": "Quiche", "crepe": "Crepe", "pudding": "Pudding",
    "jelly": "Jelly", "jam": "Jam", "marmalade": "Marmalade", "honey": "Honey", "syrup": "Syrup",
    "ketchup": "Ketchup", "mustard": "Mustard", "mayonnaise": "Mayonnaise", "vinegar": "Vinegar", "soy sauce": "Soy Sauce",
    "hot sauce": "Hot Sauce", "salsa": "Salsa", "guacamole": "Guacamole", "bean": "Bean", "lentil": "Lentil",
    "chickpea": "Chickpea", "edamame": "Edamame"
}

def model_inference(pil_image: Image.Image):
    """
    Wykonuje inferencję na obrazie i sprawdza, czy nazwa klasy 
    (z top-5) zawiera któreś z naszych słów kluczowych.
    Każdemu wykrytemu składnikowi przypisujemy losową wartość kaloryczną.
    """
    # 1. Transformacja obrazu
    input_tensor = transform_pipeline(pil_image)
    input_batch = input_tensor.unsqueeze(0)  # (1, 3, 224, 224)

    # 2. Uruchamiamy model
    with torch.no_grad():
        output = model(input_batch)  # shape: (1, 1000)

    # 3. Softmax i top-5
    probabilities = softmax(output[0], dim=0)
    top5_prob, top5_catid = torch.topk(probabilities, 5)

    recognized_ingredients = []
    total_calories = 0

    # 4. Dla każdej z 5 najwyższych predykcji sprawdzamy słowa kluczowe
    for i in range(top5_prob.size(0)):
        class_name = class_idx[top5_catid[i]]
        # np. "chicken, hen" albo "broccoli"

        for keyword, display_name in food_synonyms.items():
            # Jeżeli w nazwie klasy występuje słowo kluczowe
            if keyword.lower() in class_name.lower():
                # Losowo generujemy kalorie w zakresie np. 50-500
                cals = random.randint(50, 500)
                recognized_ingredients.append({
                    "name": display_name,
                    "calories": cals
                })
                total_calories += cals

    return {
        "ingredients": recognized_ingredients,
        "calories": total_calories
    }


@app.route('/analyse', methods=['POST'])
def analyse():
    """
    Endpoint /analyse:
    - Weryfikuje nagłówek autoryzacyjny (Authorization).
    - Wczytuje obraz PNG/JPG/JPEG.
    - Uruchamia inferencję modelu.
    - Zwraca JSON ze składnikami i sumą kalorii (losową).
    """
    # 1. Sprawdzenie hasła
    auth_header = request.headers.get('Authorization')
    if not auth_header or auth_header != SECRET_KEY:
        abort(401, description="Brak autoryzacji lub niepoprawne hasło.")

    # 2. Odbieramy plik
    if 'image' not in request.files:
        abort(400, description="Nie przesłano pliku 'image'.")
    file = request.files['image']

    if file.filename == '':
        abort(400, description="Nazwa pliku jest pusta.")

    # Obsługiwane formaty
    allowed_ext = ['.png', '.jpg', '.jpeg']
    if not any(file.filename.lower().endswith(ext) for ext in allowed_ext):
        abort(400, description="Dozwolone są pliki PNG/JPG/JPEG.")

    # 3. Wczytujemy obraz do PIL
    image_data = file.read()
    try:
        pil_image = Image.open(io.BytesIO(image_data)).convert('RGB')
    except Exception:
        abort(400, description="Błąd podczas otwierania obrazu.")

    # 4. Uruchamiamy inferencję
    result = model_inference(pil_image)

    # 5. Zwracamy wynik w formacie JSON
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)
