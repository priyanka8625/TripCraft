# -*- coding: utf-8 -*-
from dotenv import load_dotenv
import os
from pymongo import MongoClient
import numpy as npfrom dotenv import load_dotenv
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
from sklearn.metrics.pairwise import cosine_similarity
import time

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is missing")

db = None
FALLBACK_MODE = False  # Disable fallback mode to rely on MongoDB

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

trip_keywords = {k: [str(kw) for kw in v] for k, v in trip_keywords.items()}

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
    "History": ["history"],
    "Beach": ["relaxation", "nature"]
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
    "History": 2,
    "Beach": 2
}

all_possible_tags = list(trip_keywords.keys())

def safe_string_contains(haystack, needle):
    haystack = str(haystack).lower()
    needle = str(needle).lower()
    print(f"safe_string_contains: haystack: '{haystack}', type: {type(haystack)}, needle: '{needle}', type: {type(needle)}")
    return needle in haystack

def compute_similarity(user_prefs, spot_tags, spot_name):
    spot_name = str(spot_name) if spot_name is not None else ""
    print(f"compute_similarity: spot_name: '{spot_name}', type: {type(spot_name)}")
    user_prefs = [str(pref).lower() for pref in user_prefs if str(pref).strip()]
    spot_tags = [str(tag).lower() for tag in spot_tags if str(tag).strip()]
    if isinstance(spot_tags, np.ndarray):
        spot_tags = spot_tags.tolist()
    user_vec = np.zeros(len(all_possible_tags))
    spot_vec = np.zeros(len(all_possible_tags))
    
    for i, tag in enumerate(all_possible_tags):
        if tag in user_prefs:
            user_vec[i] = 2.0
        if tag in spot_tags:
            spot_vec[i] = 1.0
    
    keyword_score = 0.0
    max_keywords = 0
    spot_text = spot_name.lower()
    
    for pref in user_prefs:
        keywords = trip_keywords.get(pref, [])
        max_keywords += len(keywords)
        for keyword in keywords:
            keyword_str = str(keyword).lower()
            print(f"compute_similarity: Checking keyword: '{keyword_str}', type: {type(keyword_str)} in spot_text: '{spot_text}'")
            if safe_string_contains(spot_text, keyword_str):
                keyword_score += 1
    
    keyword_weight = 0.3
    keyword_score = (keyword_score / max_keywords) * keyword_weight if max_keywords > 0 else 0.0
    tag_similarity = cosine_similarity([user_vec], [spot_vec])[0][0] if np.sum(user_vec) > 0 else 0.0
    tag_weight = 0.7
    total_similarity = tag_weight * tag_similarity + keyword_score
    return min(total_similarity, 1.0)

def fetch_low_cost_activities(destination, budget, people, required_activities):
    global db
    if db is None:
        client = MongoClient(MONGO_URI)
        db = client.get_database("TripCraft")
    
    start_time = time.time()
    destination_clean = str(destination).lower().replace("  ", " ")
    print(f"fetch_low_cost_activities: Destination: '{destination_clean}', type: {type(destination_clean)}")
    dest_data = db.destination.find_one({"destination": {"$regex": destination_clean, "$options": "i"}})
    if not dest_data or "spots" not in dest_data:
        print(f"fetch_low_cost_activities: No spots found for '{destination_clean}'")
        return []
    
    spots = dest_data["spots"]
    low_cost_spots = []
    for spot in spots:
        spot_name = str(spot.get('name', ''))
        print(f"fetch_low_cost_activities: Processing spot: '{spot_name}', type: {type(spot_name)}")
        if not isinstance(spot_name, str) or not spot_name:
            print(f"fetch_low_cost_activities: Skipping invalid name: {spot_name}, type: {type(spot_name)}")
            continue
        
        cost = spot.get('estimatedCost', 10)
        if not isinstance(cost, (int, float)):
            try:
                cost = float(cost)
            except (ValueError, TypeError):
                cost = 10.0
        total_cost = cost * people
        if total_cost > budget:
            print(f"fetch_low_cost_activities: Skipping '{spot_name}' (cost: {total_cost} > budget: {budget})")
            continue
        
        category = str(spot.get('category', '')).lower()
        rating = float(spot.get('rating', 4.0)) if isinstance(spot.get('rating', 4.0), (int, float)) else 4.0
        duration = category_durations.get(category.capitalize(), 2)
        tags = category_to_tags.get(category.capitalize(), [])
        time_slot = str(spot.get('timeSlot', 'Daytime'))
        
        spot_name_lower = spot_name.lower()
        for pref, keywords in trip_keywords.items():
            for keyword in keywords:
                keyword_str = str(keyword).lower()
                print(f"fetch_low_cost_activities: Checking keyword: '{keyword_str}', type: {type(keyword_str)} in '{spot_name_lower}'")
                if safe_string_contains(spot_name_lower, keyword_str) and pref != "shopping":
                    tags.append(pref)
                    print(f"fetch_low_cost_activities: Tag '{pref}' added for '{keyword_str}' in '{spot_name_lower}'")
                    break
        tags = list(set(tags))
        if "shopping" in tags and category in ["spiritual", "history"]:
            tags.remove("shopping")
        
        latitude = float(spot.get("latitude", 0)) if isinstance(spot.get("latitude", 0), (int, float)) else 0
        longitude = float(spot.get("longitude", 0)) if isinstance(spot.get("longitude", 0), (int, float)) else 0
        if latitude == 0 or longitude == 0:
            print(f"fetch_low_cost_activities: Skipping '{spot_name}' (invalid coordinates: lat={latitude}, lon={longitude})")
            continue
        
        activity_data = {
            "activity": {
                "name": spot_name,
                "location": str(spot.get("location", destination)),
                "estimatedCost": float(cost),
                "category": category.capitalize(),
                "latitude": latitude,
                "longitude": longitude,
                "timeSlot": time_slot,
                "tags": tags
            },
            "similarity_score": 0.0,
            "rating": rating,
            "duration": duration
        }
        low_cost_spots.append((cost, activity_data))
    
    low_cost_spots.sort(key=lambda x: x[0])
    result = [spot[1] for spot in low_cost_spots[:required_activities]]
    print(f"fetch_low_cost_activities: Returning {len(result)} activities in {time.time() - start_time:.2f}s")
    return result

def find_similar_activities(destination, preferences, budget, people, days):
    global db
    if db is None:
        client = MongoClient(MONGO_URI)
        db = client.get_database("TripCraft")
    
    print(f"find_similar_activities: Destination: {destination}, Preferences: {preferences}, People: {people}")
    start_time = time.time()
    destination_clean = str(destination).lower().replace("  ", " ")
    print(f"find_similar_activities: Destination_clean: '{destination_clean}', type: {type(destination_clean)}")
    dest_data = db.destination.find_one({"destination": {"$regex": destination_clean, "$options": "i"}})
    if not dest_data or "spots" not in dest_data:
        print(f"find_similar_activities: No spots found for '{destination_clean}'")
        return []
    
    spots = dest_data["spots"]
    all_spots = []
    for spot in spots:
        spot_name = str(spot.get('name', ''))
        print(f"find_similar_activities: Processing spot: '{spot_name}', type: {type(spot_name)}")
        if not isinstance(spot_name, str) or not spot_name:
            print(f"find_similar_activities: Skipping invalid name: {spot_name}, type: {type(spot_name)}")
            continue
        
        cost = spot.get('estimatedCost', 10)
        if not isinstance(cost, (int, float)):
            try:
                cost = float(cost)
            except (ValueError, TypeError):
                cost = 10.0
        total_cost = cost * people
        if total_cost > budget:
            print(f"find_similar_activities: Skipping '{spot_name}' (cost: {total_cost} > budget: {budget})")
            continue
        
        category = str(spot.get('category', '')).lower()
        rating = float(spot.get('rating', 4.0)) if isinstance(spot.get('rating', 4.0), (int, float)) else 4.0
        duration = category_durations.get(category.capitalize(), 2)
        tags = category_to_tags.get(category.capitalize(), [])
        time_slot = str(spot.get('timeSlot', 'Daytime'))
        
        spot_name_lower = spot_name.lower()
        for pref, keywords in trip_keywords.items():
            for keyword in keywords:
                keyword_str = str(keyword).lower()
                print(f"find_similar_activities: Checking keyword: '{keyword_str}', type: {type(keyword_str)} in '{spot_name_lower}'")
                if safe_string_contains(spot_name_lower, keyword_str) and pref != "shopping":
                    tags.append(pref)
                    print(f"find_similar_activities: Tag '{pref}' added for '{keyword_str}' in '{spot_name_lower}'")
                    break
        tags = list(set(tags))
        if "shopping" in tags and category in ["spiritual", "history"]:
            tags.remove("shopping")
        
        latitude = float(spot.get("latitude", 0)) if isinstance(spot.get("latitude", 0), (int, float)) else 0
        longitude = float(spot.get("longitude", 0)) if isinstance(spot.get("longitude", 0), (int, float)) else 0
        if latitude == 0 or longitude == 0:
            print(f"find_similar_activities: Skipping '{spot_name}' (invalid coordinates: lat={latitude}, lon={longitude})")
            continue
        
        similarity_score = compute_similarity(preferences, tags, spot_name) if preferences else 0.0
        activity_data = {
            "activity": {
                "name": spot_name,
                "location": str(spot.get("location", destination)),
                "estimatedCost": float(cost),
                "category": category.capitalize(),
                "latitude": latitude,
                "longitude": longitude,
                "timeSlot": time_slot,
                "tags": tags
            },
            "similarity_score": similarity_score,
            "rating": rating,
            "duration": duration
        }
        all_spots.append(activity_data)
    
    required_activities = min(30, max(15, 5 * days))
    print(f"find_similar_activities: Need {required_activities} activities, found {len(all_spots)}")
    if len(all_spots) < required_activities:
        print(f"find_similar_activities: Fetching additional low-cost activities")
        additional_spots = fetch_low_cost_activities(destination, budget, people, required_activities - len(all_spots))
        all_spots.extend(additional_spots)
        print(f"find_similar_activities: Added {len(additional_spots)} additional activities, total: {len(all_spots)}")
    
    if preferences:
        preferences = [str(p).lower() for p in preferences if str(p).strip()]
        invalid_prefs = [p for p in preferences if p not in trip_keywords]
        if invalid_prefs:
            raise ValueError(f"Invalid preferences: {invalid_prefs}")
        all_spots.sort(key=lambda x: (x["similarity_score"], x["rating"], -x["activity"]["estimatedCost"]))
    else:
        all_spots.sort(key=lambda x: (x["rating"], -x["activity"]["estimatedCost"]))
    
    result = all_spots[:required_activities]
    print(f"find_similar_activities: Returning {len(result)} activities in {time.time() - start_time:.2f}s")
    return result
