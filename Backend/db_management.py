import sqlite3
import json
import numpy as np
from io import BytesIO
from PIL import Image


def db_insert_ingredient_if_not_exists(cursor, name, unit_of_measurement, category):
    cursor.execute("SELECT id FROM ingredients WHERE name = ?", (name,))
    result = cursor.fetchone()
    if result:
        return result[0]
    else:
        cursor.execute("INSERT INTO ingredients (name, unitOfMeasurement, category) VALUES (?, ?, ?)",
                       (name, unit_of_measurement, category))
        return cursor.lastrowid


def db_insert_dish_if_not_exists(cursor, name, description, image, embeddings):
    cursor.execute("SELECT id FROM dishes WHERE name = ?", (name,))
    result = cursor.fetchone()
    if result:
        return result[0]
    else:
        cursor.execute("INSERT INTO dishes (name, description, image, is_favorite, embeddings) VALUES (?, ?, ?, ?, ?)",
                       (name, description, image, False, embeddings))
        return cursor.lastrowid


def insert_dish_and_ingredients(dish):
    conn = sqlite3.connect('iis_db.sqlite')
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM dishes WHERE name = ?", (dish['name'],))
    result = cursor.fetchone()
    if result:
        print("Dish already exists.")
        return
    else:
        try:
            # Insert the dish
            dish_id = db_insert_dish_if_not_exists(cursor, dish['name'], dish['description'], dish['image'],
                                                dish['embeddings'])

            # Insert ingredients and their relationship to the dish
            for ingredient in dish['ingredients']:
                ingredient_id = db_insert_ingredient_if_not_exists(cursor, ingredient['name'],
                                                                ingredient['unitOfMeasurement'],
                                                                ingredient['category'])

                cursor.execute(
                    "INSERT INTO dishes_ingredients (dishID, ingredientID, amount, unitOfMeasurement) VALUES (?, ?, ?, ?)",
                    (dish_id, ingredient_id, ingredient['amount'], ingredient['unitOfMeasurement'],))

                conn.commit()
        except Exception as e:
            print(f"An error occurred: {e}")
            conn.rollback()
        finally:
            cursor.close()
            conn.close()


def db_toggle_favorite(dish_name):
    conn = sqlite3.connect('iis_db.sqlite')
    cursor = conn.cursor()

    cursor.execute("SELECT id, is_favorite FROM dishes WHERE name = ?", (dish_name,))
    result = cursor.fetchone()
    if result:
        dish_id = result[0]
        is_favorite = not result[1]
        cursor.execute("UPDATE dishes SET is_favorite = ? WHERE id = ?", (is_favorite, dish_id))
        conn.commit()
    else:
        print("Dish not found.")

    cursor.close()
    conn.close()


def db_to_dict_dish(dish_name):
    # Connect to the SQLite database (or any other database you are using)
    conn = sqlite3.connect('iis_db.sqlite')
    cursor = conn.cursor()

    # Query to get the dish details
    cursor.execute('''
        SELECT name, image, description, is_favorite, embeddings 
        FROM dishes 
        WHERE name = ?''', (dish_name,))
    dish = cursor.fetchone()

    # If the dish does not exist, return None or an empty object
    if dish is None:
        print('Dish not found in the database')
        return None

    # Unpack the fetched dish data
    name, image, description, is_favorite, embeddings = dish

    # Query to get the ingredients for the dish
    cursor.execute('''
        SELECT i.name, di.amount, di.unitOfMeasurement, i.category
        FROM ingredients i
        JOIN dishes_ingredients di ON i.id = di.ingredientID
        JOIN dishes d ON di.dishID = d.id
        WHERE d.name = ?''', (dish_name,))

    # Fetch all ingredients
    ingredients = cursor.fetchall()

    # Format the ingredients
    formatted_ingredients = [
        {
            'name': name,
            'amount': amount,
            'unitOfMeasurement': unit_of_measurement,
            'category': category
        }
        for name, amount, unit_of_measurement, category in ingredients
    ]

    # Format the final dish object
    dish_details = {
        'name': name,
        'image': image,
        'description': description,
        'ingredients': formatted_ingredients,
        'embeddings': json.loads(embeddings),
        'is_favorite': is_favorite,
    }

    # Close the database connection
    conn.close()

    return dish_details



def db_get_favorites():
    conn = sqlite3.connect('iis_db.sqlite')
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM dishes WHERE is_favorite = 1")
    favorites_names = cursor.fetchall()

    cursor.close()
    conn.close()

    favorites = [db_to_dict_dish(favorite[0]) for favorite in favorites_names]
    for dish in favorites:
        del dish['embeddings']

    return favorites


def db_add_to_cart(items, add, dish):
    conn = sqlite3.connect('iis_db.sqlite')
    cursor = conn.cursor()

    for item in items:
        ingredient_name = item.get('ingredient')
        amount_to_add_or_subtract = item.get('amount') if add else -item.get('amount')

        # Fetch the unit of measurement and category from the ingredients table
        cursor.execute("SELECT unitOfMeasurement, category FROM ingredients WHERE name = ?", (ingredient_name,))
        result = cursor.fetchone()
        if result:
            unit_of_measurement, category = result
        else:
            # Skip this item if it's not found in the ingredients table
            continue

        cursor.execute("SELECT dishes FROM cart WHERE name = ?", (ingredient_name,))
        result = cursor.fetchone()
        if result:
            current_dishes = result[0]
            print(current_dishes)
            if dish not in current_dishes:
                dishes = current_dishes + ', ' + dish
            else:
                dishes = current_dishes

            print(dishes)
        else:
            dishes = dish

        # Check if the ingredient is already in the cart
        cursor.execute("SELECT amount FROM cart WHERE name = ?", (ingredient_name,))
        result = cursor.fetchone()
        if result:
            # Ingredient is in the cart, calculate the new amount
            current_amount = result[0]
            new_amount = current_amount + amount_to_add_or_subtract

            if new_amount <= 0:
                # If the new amount is less than or equal to 0, remove the ingredient from the cart
                cursor.execute("DELETE FROM cart WHERE name = ?", (ingredient_name,))
            else:
                # Otherwise, update the ingredient's amount in the cart
                cursor.execute("UPDATE cart SET amount = ? WHERE name = ?", (new_amount, ingredient_name))
                cursor.execute("UPDATE cart SET dishes = ? WHERE name = ?", (dishes, ingredient_name))

        elif amount_to_add_or_subtract > 0:
            # Ingredient is not in the cart and we're adding a positive amount, so insert it
            cursor.execute("INSERT INTO cart (name, amount, unitOfMeasurement, category, dishes) VALUES (?, ?, ?, ?, ?)",
                           (ingredient_name, amount_to_add_or_subtract, unit_of_measurement, category, dishes))
        # Commit changes for each item to ensure data consistency
        conn.commit()

    cursor.close()
    conn.close()


def db_get_cart():
    conn = sqlite3.connect('iis_db.sqlite')
    cursor = conn.cursor()

    cursor.execute("SELECT name, amount, unitOfMeasurement, category, dishes FROM cart")
    cart_items = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            'ingredient': name,
            'amount': amount,
            'unitOfMeasurement': unit_of_measurement,
            'category': category,
            'dishes': dishes
        }
        for name, amount, unit_of_measurement, category, dishes in cart_items
    ]


def db_update_cart(items):
    conn = sqlite3.connect('iis_db.sqlite')
    cursor = conn.cursor()

    for item in items:
        ingredient_name = item.get('ingredient')
        new_amount = item.get('amount')

        if new_amount <= 0:
            cursor.execute("DELETE FROM cart WHERE name = ?", (ingredient_name,))
        else:
            cursor.execute("UPDATE cart SET amount = ? WHERE name = ?", (new_amount, ingredient_name))
        conn.commit()

    cursor.close()
    conn.close()


def db_empty_cart():
    conn = sqlite3.connect('iis_db.sqlite')
    cursor = conn.cursor()

    cursor.execute("DELETE FROM cart")
    conn.commit()

    cursor.close()
    conn.close()


def cosine_similarity(x, embeddings, n=4):
    similarities = []
    embeddings = [(name, json.loads(embedding)) for name, embedding in embeddings]

    # Calculate cosine similarity between x and each vector in embeddings
    for name, vector in embeddings:
        similarity = np.dot(x, vector) / (np.linalg.norm(x) * np.linalg.norm(vector))
        similarities.append((name, similarity))

    # Sort the similarities in descending order
    similarities.sort(key=lambda x: x[1], reverse=True)

    print(similarities[:4])

    # Return the names of the top two vectors with the highest cosine similarity
    return [sim[0] for sim in similarities[1:n + 1]]


def db_get_recommendations(dish_name):
    conn = sqlite3.connect('iis_db.sqlite')
    cursor = conn.cursor()

    cursor.execute("SELECT embeddings FROM dishes WHERE name = ?", (dish_name,))
    dish_embeddings = cursor.fetchone()
    if dish_embeddings:
        dish_embeddings = json.loads(dish_embeddings[0])
    else:
        print("Dish not found.")
        return []

    cursor.execute("SELECT name, embeddings FROM dishes")
    dishes = cursor.fetchall()

    cursor.close()
    conn.close()

    recommendations_names = cosine_similarity(dish_embeddings, dishes)
    recommendations = [db_to_dict_dish(recommendation) for recommendation in recommendations_names]

    return recommendations

