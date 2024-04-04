import requests
import google.generativeai as genai
from base64 import b64encode
from db_management import *
import PIL.Image

import os
from dotenv import load_dotenv
load_dotenv()


def edamam_get_recipe(dish_name):
    url = "https://api.edamam.com/api/recipes/v2"
    query = {
        "type": "public",
        "q": dish_name,
        "app_id": os.getenv("EDAMAM_APP_ID"),
        "app_key": os.getenv("EDAMAM_API_KEY"),
        'ingr': 20,
        'beta': False,

    }
    response = requests.get(url, params=query)
    if response.status_code == 200:
        return response.json()
    else:
        print(response.status_code)
        return None


def get_description(dish_name, dish_ingredients):
    genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(f'Describe the the next dish in no more than two lines:'
                                      f'{dish_name} with {", ".join([ingredient.get("name") for ingredient in dish_ingredients])}')

    return response.text


def clean_unit(unit):
    if unit is None:
        return ''
    return unit.replace('<', '').replace('>', '').replace('(', '').replace(')', '').capitalize()


def get_embeddings(text):
    genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
    result = genai.embed_content(
        model="models/embedding-001",
        content=text,
        task_type="semantic_similarity")

    return result.get('embedding')


def edamam_to_dish(recipe):
    name = recipe.get('label')
    # image = recipe.get('image')

    image_url = recipe.get('image')
    response = requests.get(image_url)  # Download the image
    image = b64encode(response.content).decode('utf-8')  # Encode the image to base64

    ingredients = []
    ingredients_names = []
    for ingredient in recipe.get('ingredients'):
        if ingredient.get('food') in ingredients_names:
            print(f'Found duplicate ingredient: {ingredient.get("food")}')
            ingredients[ingredients_names.index(ingredient.get('food'))]['amount'] += ingredient.get('quantity')
        else:
            ingredients_names.append(ingredient.get('food'))
            ingredients.append({
                'name': ingredient.get('food'),
                'amount': round(ingredient.get('quantity'), 2),
                'unitOfMeasurement': clean_unit(ingredient.get('measure')),
                'category': ingredient.get('foodCategory').capitalize()
            })
    description = get_description(name, ingredients)

    embeddings = get_embeddings(description)
    embeddings_json = json.dumps(embeddings)

    dish_dict = {
        'name': name,
        'image': image,
        'description': description,
        'ingredients': ingredients,
        'embeddings': embeddings_json,
        'is_favorite': False,
    }

    insert_dish_and_ingredients(dish_dict)

    return dish_dict


def recognize_dish(img):

    genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
    # img = PIL.Image.open(image_path)
    model = genai.GenerativeModel('gemini-pro-vision')

    response = model.generate_content(
        ["In as less words as possible, no more than 8, name the dish in the image.", img],
        stream=True)
    response.resolve()
    print(response.text)
    return response.text

