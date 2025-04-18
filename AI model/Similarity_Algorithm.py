from dotenv import load_dotenv
import os
from pymongo import MongoClient
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is missing from the environment variables")

# Initialize MongoDB client (single instance)
try:
    client = MongoClient(MONGO_URI)
    db = client.get_database("TripCraft")
except Exception as e:
    raise ConnectionError(f"Failed to connect to MongoDB: {e}")

# Trip preference keywords
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

# Map categories to tags
category_to_tags = {
    "Museum": ["art", "history"],
    "Historical": ["history"],
    "Landmark": ["history", "culture"],
    "Church": ["spiritual", "history"],
    "Palace": ["history", "culture"],
    "Park": ["nature", "relaxation"],
    "Opera House": ["art", "culture"],
    "Square": ["culture"]
}

# Estimated durations (hours)
category_durations = {
    "Museum": 3,
    "Historical": 2,
    "Landmark": 1,
    "Church": 1,
    "Palace": 2,
    "Park": 2,
    "Opera House": 3,
    "Square": 1
}

# All possible tags
all_possible_tags = list(trip_keywords.keys())

# Valid time slots
valid_time_slots = ["morning", "afternoon", "evening", "daytime"]

def compute_similarity(user_prefs, spot_tags):
    """
    Compute cosine similarity between user preferences and spot tags.
    """
    user_vec = np.array([1 if tag in user_prefs else 0 for tag in all_possible_tags])
    spot_vec = np.array([1 if tag in spot_tags else 0 for tag in all_possible_tags])
    return cosine_similarity([user_vec], [spot_vec])[0][0]

def find_similar_activities(destination, preferences, budget, people, days):
    """
    Finds spots matching the given preferences or highest-rated spots if no preferences.
    Args:
        destination (str): The destination (e.g., "Paris").
        preferences (list or None): List of preferences (e.g., ["history", "art"]) or None/[].
        budget (float): Total budget.
        people (int): Number of people.
        days (int): Number of days.
    Returns:
        list: List of spots with activity details, similarity score (or rating), rating, and duration.
    """
    if not destination:
        raise ValueError("Destination is required")

    # Fetch destination data
    dest_data = db.destination.find_one({"destination": {"$regex": destination, "$options": "i"}})
    if not dest_data or "spots" not in dest_data:
        return []

    spots = dest_data["spots"]
    all_spots = []

    for spot in spots:
        spot_name_lower = spot.get('name', '').lower().strip()
        category = spot.get('category', '').lower()
        rating = spot.get('rating', 4.0)
        cost = spot.get('estimatedCost', 10) * people
        time_slot = spot.get('timeSlot', 'daytime').lower()
        latitude = spot.get('latitude', 0)
        longitude = spot.get('longitude', 0)
        # Normalize time slot
        if time_slot not in valid_time_slots:
            time_slot = 'daytime'
        duration = category_durations.get(category.capitalize(), 2)  # Default 2 hours

        if cost > budget:
            continue

        # Generate tags from category and name (for similarity scoring)
        tags = category_to_tags.get(category.capitalize(), [])
        for pref, keywords in trip_keywords.items():
            if spot_name_lower and any(keyword in spot_name_lower for keyword in keywords):
                tags.append(pref)
        tags = list(set(tags))

        # Compute similarity if preferences are provided
        similarity_score = compute_similarity(preferences, tags) if preferences else 0

        # Format spot as activity
        activity_data = {
            "activity": {
                "name": spot["name"],
                "location": spot["location"],
                "estimatedCost": spot["estimatedCost"],  # Per person
                "timeSlot": time_slot,
                "category": category.capitalize(),
                "latitude": latitude,
                "longitude": longitude,
                "rating": rating
            },
            "similarity_score": similarity_score,
            "rating": rating,
            "duration": duration
        }

        all_spots.append(activity_data)

    # Sort based on preferences
    if preferences:
        # Validate preferences
        preferences = [p.lower() for p in preferences if isinstance(p, str)]
        invalid_prefs = [p for p in preferences if p not in trip_keywords]
        if invalid_prefs:
            raise ValueError(f"Invalid preferences: {invalid_prefs}")
        
        # Filter spots with non-zero similarity
        similar_spots = [spot for spot in all_spots if spot["similarity_score"] > 0]
        similar_spots.sort(key=lambda x: (x["similarity_score"], x["rating"]), reverse=True)
        
        # Ensure enough activities (fill 6-8 hours/day)
        required_activities = 10 * (days - 1) // 2  # Increased to ensure 6-8 hours
        if len(similar_spots) >= required_activities:
            return similar_spots
        else:
            # Supplement with high-rated spots
            all_spots.sort(key=lambda x: x["rating"], reverse=True)
            return similar_spots + [s for s in all_spots if s not in similar_spots][:required_activities - len(similar_spots)]
    else:
        # No preferences: sort by rating
        all_spots.sort(key=lambda x: x["rating"], reverse=True)
        # Return top spots (enough for 6-8 hours/day)
        required_activities = 10 * (days - 1) // 2
        return all_spots[:required_activities]
