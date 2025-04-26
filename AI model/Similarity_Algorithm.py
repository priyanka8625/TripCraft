from dotenv import load_dotenv
import os
from pymongo import MongoClient
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import time

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is missing")

db = None

trip_keywords = {
    "history": ["historical", "monuments", "museum", "ancient", "heritage", "ruins", "castle", "wada", "fort", "palace", "caves", "maqbara"],
    "food": ["food", "lunch", "dinner", "meal", "breakfast", "brunch", "snack", "cuisine", "restaurant", "street food"],
    "adventure": ["hiking", "trekking", "rafting", "skydiving", "scuba diving", "paragliding", "climbing", "bungee jumping"],
    "relaxation": ["spa", "massage", "hot spring", "beach", "resort", "meditation", "retreat", "yoga", "wellness"],
    "shopping": ["mall", "market", "shopping street", "souvenirs", "boutique", "outlet", "bazaar", "flea market"],
    "culture": ["festival", "traditional", "heritage", "ceremony", "customs", "folklore", "cultural site"],
    "nature": ["forest", "national park", "wildlife", "waterfall", "lake", "mountain", "botanical garden", "scenic view", "dam", "banyan"],
    "nightlife": ["club", "bar", "pub", "live music", "concert", "night market", "casino", "rooftop lounge"],
    "art": ["museum", "gallery", "exhibition", "painting", "sculpture", "street art", "theater", "performance"],
    "spiritual": ["temple", "church", "mosque", "synagogue", "pilgrimage", "meditation", "shrine", "monastery"]
}

category_to_tags = {
    "Museum": ["art", "history"],
    "Historical": ["history"],
    "Landmark": ["history", "culture"],
    "Church": ["spiritual", "history"],
    "Palace": ["history", "culture"],
    "Park": ["nature", "relaxation"],
    "Opera House": ["art", "culture"],
    "Square": ["culture"],
    "Nature": ["nature"],
    "Spiritual": ["spiritual", "history"],
    "Relaxation": ["relaxation"],
    "History": ["history"]
}

category_durations = {
    "Museum": 3,
    "Historical": 2,
    "Landmark": 1,
    "Church": 1,
    "Palace": 2,
    "Park": 2,
    "Opera House": 3,
    "Square": 1,
    "Nature": 2,
    "Spiritual": 1,
    "Relaxation": 2,
    "History": 2
}

all_possible_tags = list(trip_keywords.keys())
valid_time_slots = ["morning", "afternoon", "evening", "daytime"]

def compute_similarity(user_prefs, spot_tags):
    user_vec = np.array([1 if tag in user_prefs else 0 for tag in all_possible_tags])
    spot_vec = np.array([1 if tag in spot_tags else 0 for tag in all_possible_tags])
    similarity = cosine_similarity([user_vec], [spot_vec])[0][0]
    return similarity

def fetch_low_cost_activities(destination, budget, people, required_activities):
    global db
    if db is None:
        client = MongoClient(MONGO_URI)
        db = client.get_database("TripCraft")
    
    start_time = time.time()
    dest_data = db.destination.find_one({"destination": {"$regex": destination, "$options": "i"}})
    if not dest_data or "spots" not in dest_data:
        print("No spots found for destination in fetch_low_cost_activities")
        return []
    
    spots = dest_data["spots"]
    low_cost_spots = []
    for spot in spots:
        cost = spot.get('estimatedCost', 10)
        if not isinstance(cost, (int, float)):
            print(f"Invalid estimatedCost for {spot['name']}: {cost}, Type: {type(cost)}. Converting to float.")
            try:
                cost = float(cost)
            except (ValueError, TypeError):
                cost = 10.0
        total_cost = cost * people
        spot_name_lower = spot.get('name', '').lower().strip()
        category = spot.get('category', '').lower()
        rating = spot.get('rating', 4.0)
        time_slot = spot.get('timeSlot', 'daytime').lower()
        if time_slot.lower() == "any":
            time_slot = "daytime"
        if time_slot not in valid_time_slots:
            time_slot = 'daytime'
        duration = category_durations.get(category.capitalize(), 2)
        tags = category_to_tags.get(category.capitalize(), [])
        for pref, keywords in trip_keywords.items():
            if spot_name_lower and any(keyword in spot_name_lower for keyword in keywords) and pref != "shopping":
                tags.append(pref)
        tags = list(set(tags))
        if "shopping" in tags and category in ["spiritual", "history"]:
            tags.remove("shopping")
        activity_data = {
            "activity": {
                "name": spot["name"],
                "location": spot["location"],
                "estimatedCost": cost,
                "timeSlot": time_slot,
                "category": category.capitalize(),
                "latitude": spot.get("latitude", 0),
                "longitude": spot.get("longitude", 0)
            },
            "similarity_score": 0,
            "rating": rating,
            "duration": duration
        }
        print(f"Low cost - Spot: {spot['name']}, Tags: {tags}, estimatedCost: {cost}, similarity_score: 0")
        low_cost_spots.append((total_cost, activity_data))
    
    low_cost_spots.sort(key=lambda x: x[0])
    print(f"Low cost activities fetched: {len(low_cost_spots)} in {time.time() - start_time:.2f} seconds")
    return [spot[1] for spot in low_cost_spots[:required_activities]]

def find_similar_activities(destination, preferences, budget, people, days):
    global db
    if db is None:
        client = MongoClient(MONGO_URI)
        db = client.get_database("TripCraft")
    
    print(f"find_similar_activities: People: {people}, Type: {type(people)}")
    start_time = time.time()
    dest_data = db.destination.find_one({"destination": {"$regex": destination, "$options": "i"}})
    if not dest_data or "spots" not in dest_data:
        print("No spots found for destination in find_similar_activities")
        return []
    
    spots = dest_data["spots"]
    all_spots = []
    for spot in spots:
        spot_name_lower = spot.get('name', '').lower().strip()
        category = spot.get('category', '').lower()
        rating = spot.get('rating', 4.0)
        cost = spot.get('estimatedCost', 10)
        if not isinstance(cost, (int, float)):
            print(f"Invalid estimatedCost for {spot['name']}: {cost}, Type: {type(cost)}. Converting to float.")
            try:
                cost = float(cost)
            except (ValueError, TypeError):
                cost = 10.0
        time_slot = spot.get('timeSlot', 'daytime').lower()
        if time_slot.lower() == "any":
            time_slot = "daytime"
        if time_slot not in valid_time_slots:
            time_slot = 'daytime'
        duration = category_durations.get(category.capitalize(), 2)
        tags = category_to_tags.get(category.capitalize(), [])
        for pref, keywords in trip_keywords.items():
            if spot_name_lower and any(keyword in spot_name_lower for keyword in keywords) and pref != "shopping":
                tags.append(pref)
        tags = list(set(tags))
        if "shopping" in tags and category in ["spiritual", "history"]:
            tags.remove("shopping")
        similarity_score = compute_similarity(preferences, tags) if preferences else 0
        activity_data = {
            "activity": {
                "name": spot["name"],
                "location": spot["location"],
                "estimatedCost": cost,
                "timeSlot": time_slot,
                "category": category.capitalize(),
                "latitude": spot.get("latitude", 0),
                "longitude": spot.get("longitude", 0)
            },
            "similarity_score": similarity_score,
            "rating": rating,
            "duration": duration
        }
        print(f"Similar - Spot: {spot['name']}, Tags: {tags}, estimatedCost: {cost}, similarity_score: {similarity_score:.3f}")
        all_spots.append(activity_data)
    
    required_activities = max(10, 2 * (days - 2))
    if len(all_spots) < required_activities:
        additional_spots = fetch_low_cost_activities(destination, budget, people, required_activities - len(all_spots))
        all_spots.extend(additional_spots)
    
    if preferences:
        preferences = [p.lower() for p in preferences if isinstance(p, str)]
        invalid_prefs = [p for p in preferences if p not in trip_keywords]
        if invalid_prefs:
            raise ValueError(f"Invalid preferences: {invalid_prefs}")
        all_spots.sort(key=lambda x: (x["similarity_score"], x["rating"]), reverse=True)
        print(f"Returning {len(all_spots[:required_activities])} activities, top similarity_score: {all_spots[0]['similarity_score']:.3f}")
        return all_spots[:required_activities]
    else:
        all_spots.sort(key=lambda x: x["rating"], reverse=True)
        print(f"Returning {len(all_spots[:required_activities])} activities, top rating: {all_spots[0]['rating']}")
        return all_spots[:required_activities]