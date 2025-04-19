from dotenv import load_dotenv
import os
from pymongo import MongoClient
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is missing from the environment variables")

try:
    client = MongoClient(MONGO_URI)
    db = client.get_database("TripCraft")
except Exception as e:
    raise ConnectionError(f"Failed to connect to MongoDB: {e}")

trip_keywords = {
    "history": ["historical", "monuments", "museum", "ancient", "heritage", "ruins", "castle", "wada", "fort", "palace"],
    "food": ["food", "lunch", "dinner", "meal", "breakfast", "brunch", "snack", "cuisine", "restaurant", "street food", "wine tasting"],
    "adventure": ["hiking", "trekking", "rafting", "skydiving", "scuba diving", "paragliding", "climbing", "bungee jumping", "surfing"],
    "relaxation": ["spa", "massage", "hot spring", "beach", "resort", "meditation", "retreat", "yoga", "wellness"],
    "shopping": ["mall", "market", "shopping street", "souvenirs", "boutique", "outlet", "bazaar", "flea market"],
    "culture": ["festival", "traditional", "heritage", "temple", "ceremony", "customs", "folklore", "cultural site", "ashram"],
    "nature": ["forest", "national park", "wildlife", "waterfall", "lake", "mountain", "botanical garden", "scenic view"],
    "nightlife": ["club", "bar", "pub", "live music", "concert", "night market", "casino", "rooftop lounge", "party"],
    "art": ["museum", "gallery", "exhibition", "painting", "sculpture", "street art", "theater", "performance", "opera"],
    "spiritual": ["temple", "church", "mosque", "synagogue", "pilgrimage", "meditation", "shrine", "monastery", "holy site"]
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
    "Spiritual": ["spiritual"]
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
    "Spiritual": 2
}

all_possible_tags = list(trip_keywords.keys())
valid_time_slots = ["morning", "afternoon", "evening", "daytime"]

def compute_similarity(user_prefs, spot_tags):
    user_vec = np.array([1 if tag in user_prefs else 0 for tag in all_possible_tags])
    spot_vec = np.array([1 if tag in spot_tags else 0 for tag in all_possible_tags])
    return cosine_similarity([user_vec], [spot_vec])[0][0]

def find_similar_activities(destination, preferences, budget, people, days):
    if not destination:
        raise ValueError("Destination is required")

    dest_data = db.destination.find_one({"destination": {"$regex": destination, "$options": "i"}})
    if not dest_data or "spots" not in dest_data:
        return []

    spots = dest_data["spots"]
    all_spots = []
    budget_per_person = budget / people

    time_slot_cycle = ["morning", "afternoon", "daytime", "evening"]
    time_slot_index = 0

    for spot in spots:
        spot_name_lower = spot.get('name', '').lower().strip()
        category = spot.get('category', '').lower().capitalize()
        rating = spot.get('rating', 4.0)
        cost = spot.get('estimatedCost', 10)
        time_slot = spot.get('timeSlot', 'daytime').lower()
        if time_slot not in valid_time_slots:
            time_slot = time_slot_cycle[time_slot_index % len(time_slot_cycle)]
            time_slot_index += 1
        duration = category_durations.get(category, 2)

        if cost > budget_per_person:
            print(f"Skipped spot {spot['name']} due to cost {cost} > budget_per_person {budget_per_person}")
            continue

        tags = category_to_tags.get(category, [])
        for pref, keywords in trip_keywords.items():
            if spot_name_lower and any(keyword in spot_name_lower for keyword in keywords):
                tags.append(pref)
        tags = list(set(tags))
        print(f"Spot: {spot['name']}, Tags: {tags}, Category: {category}")

        similarity_score = compute_similarity(preferences, tags) if preferences else 0

        activity_data = {
            "activity": {
                "name": spot["name"],
                "location": spot["location"],
                "estimatedCost": cost,
                "timeSlot": time_slot,
                "category": category  # Add category to activity
            },
            "similarity_score": similarity_score,
            "rating": rating,
            "duration": duration,
            "tags": tags  # Store tags for filtering
        }

        all_spots.append(activity_data)

    print(f"Total spots after filtering: {len(all_spots)}")

    if preferences:
        preferences = [p.lower() for p in preferences if isinstance(p, str)]
        invalid_prefs = [p for p in preferences if p not in trip_keywords]
        if invalid_prefs:
            raise ValueError(f"Invalid preferences: {invalid_prefs}")
        
        # Filter spots with matching tags or non-zero similarity
        similar_spots = [
            spot for spot in all_spots
            if any(tag in preferences for tag in category_to_tags.get(spot['activity']['category'], []))
            or any(tag in preferences for tag in spot['tags'])
            or spot['similarity_score'] > 0
        ]
        similar_spots.sort(key=lambda x: (x["similarity_score"], x["rating"]), reverse=True)
        print(f"Similar spots: {len(similar_spots)}")
        return similar_spots  # Return all to allow reuse
    else:
        all_spots.sort(key=lambda x: x["rating"], reverse=True)
        required_activities = 8 * (days - 1) // 2
        return all_spots[:required_activities]
