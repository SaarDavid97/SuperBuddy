from io import BytesIO

from PIL import Image
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from edamam_functions import *
from db_management import *

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

load_dotenv()


@app.route('/api/signup', methods=['POST'])
def signup():
    if request.method == 'POST':
        user = request.get_json()
        if user:
            print(user)
            return jsonify({'message': 'User received'})
        else:
            return jsonify({'error': 'No user received'})


@app.route('/api/recipe/text', methods=['POST'])
def get_recipe_from_text():
    print('Received call')
    if request.method == 'POST':
        text = request.get_json().get('name')
        if text:
            print(f'Text received: {text}')
            recipes = edamam_get_recipe(text)
            recipes = [edamam_to_dish(recipes.get('hits')[i].get('recipe')) for i in range(3)]
            if recipes:
                return jsonify(recipes)
            else:
                return jsonify({'error': 'No recipe found'})
        else:
            return jsonify({'error': 'No text received'})


@app.route('/api/recipe/image', methods=['POST'])
def get_recipe_from_image():
    if 'dish_image' in request.files:
        image_file = request.files['dish_image']
        if image_file:
            image = Image.open(BytesIO(image_file.read()))
            print('Image received')
            text = recognize_dish(image)
            if text:
                print(f'Dish name: {text}')
                recipes = edamam_get_recipe(text)
                recipes = [edamam_to_dish(recipes.get('hits')[i].get('recipe')) for i in range(3)]
                if recipes:
                    return jsonify(recipes)
                else:
                    return jsonify({'error': 'No recipe found'})
            else:
                return jsonify({'error': 'No image received'})
    else:
        return jsonify({'error': 'No image file received'})


@app.route('/api/recipe/toggle_favorite', methods=['POST'])
def toggle_favorite():
    dish_name = request.get_json().get('name')
    if dish_name:
        print(f'changing favorite status for {dish_name}')
        db_toggle_favorite(dish_name)
        return jsonify({'message': 'Favorite toggled'})
    else:
        return jsonify({'error': 'No dish name received'})


@app.route('/api/get_favorites', methods=['GET'])
def send_favorites():
    favorites = db_get_favorites()
    return jsonify(favorites)


@app.route('/api/recipe/add_to_cart', methods=['POST'])
def add_to_cart():
    cart_request = request.get_json()
    print(cart_request)
    if cart_request:
        dish = cart_request[0]
        items = cart_request[1].get('items')
        add = cart_request[1].get('add')
        db_add_to_cart(items, add, dish)
        return jsonify({'message': 'Cart updated'})
    else:
        return jsonify({'error': 'No dish name received'})


@app.route('/api/cart/get')
def send_cart():
    cart = db_get_cart()
    return jsonify(cart)


@app.route('/api/cart/update', methods=['POST'])
def update_cart():
    items = request.get_json()
    print('Updating cart')
    if items:
        db_update_cart(items)
        return jsonify({'message': 'Cart updated'})
    else:
        return jsonify({'error': 'No dish name received'})


@app.route('/api/cart/empty', methods=['POST'])
def empty_cart():
    print('Emptying cart')
    db_empty_cart()
    return jsonify({'message': 'Cart emptied'})


@app.route('/api/get_recommendations', methods=['POST'])
def send_recommendations():
    dish_name = request.get_json().get('name')
    if dish_name:
        recommendations = db_get_recommendations(dish_name)
        return jsonify(recommendations)
    else:
        return jsonify({'error': 'No text received'})



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
