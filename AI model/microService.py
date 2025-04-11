from dotenv import load_dotenv
import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask import Flask, request, jsonify

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is missing from the environment variables")

# Initialize Flask app
app = Flask(__name__)

# Connect to MongoDB
try:
    client = MongoClient(MONGO_URI)
    db = client.get_database("TripCraft")
    print("Connected to database:", db.name)
    print("Collections in database:", db.list_collection_names())
except Exception as e:
    raise ConnectionError(f"Failed to connect to MongoDB: {e}")

def get_itineraries_from_db(destination):
    """
    Fetches all itineraries for trips with the specified destination from the database.
    """
    print(f"Total trips: {db.trips.count_documents({})}")
    print(f"Total itineraries: {db.itineraries.count_documents({})}")

    trips = list(db.trips.find({"destination": {"$regex": destination, "$options": "i"}}))
    if not trips:
        print(f"No trips found for destination: {destination}")
        return []
    print(f"Found {len(trips)} trips for destination '{destination}': {[{str(t['_id']): t['destination']} for t in trips]}")

    trip_ids = [str(trip["_id"]).strip() for trip in trips]
    print(f"Trip IDs for destination '{destination}': {trip_ids}")

    itineraries = list(db.itineraries.find({"tripId": {"$in": trip_ids}}))
    if not itineraries:
        print(f"No itineraries found for trip IDs: {trip_ids}")
        return []
    print(f"Fetched {len(itineraries)} itineraries: {[str(i['_id']) for i in itineraries]}")

    existing_itineraries_data = []
    for idx, itinerary in enumerate(itineraries, 1):
        activities = itinerary.get("activities", [])
        print(f"Itinerary {idx} activities: {activities}")
        formatted_itinerary = {
            "id": idx,
            "trip_id": itinerary["tripId"],
            "destination": destination,
            "activities": activities
        }
        existing_itineraries_data.append(formatted_itinerary)

    return existing_itineraries_data

# Trip preference keywords (lowercase)
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

@app.route('/similarity', methods=['POST'])
def get_similar_activities():
    data = request.get_json()
    destination = data.get('destination')
    preferences = data.get('preference')  # Expecting a list of preferences

    if not destination or not preferences:
        return jsonify({"error": "Missing destination or preference"}), 400

    # Ensure preferences is a list, convert single string to list if needed
    if isinstance(preferences, str):
        preferences = [preferences]
    preferences = [p.lower() for p in preferences]  # Convert all to lowercase
    invalid_prefs = [p for p in preferences if p not in trip_keywords]
    if invalid_prefs:
        return jsonify({"error": f"Invalid preferences: {invalid_prefs}. Must be one of: {list(trip_keywords.keys())}"}), 400

    existing_itineraries_data = get_itineraries_from_db(destination)
    if not existing_itineraries_data:
        return jsonify({"error": f"No itineraries found for destination: {destination}"}), 404

    print(f"Preference list: {preferences}")

    similar_activities = []
    for itinerary in existing_itineraries_data:
        print(f"Checking itinerary ID {itinerary['id']} with trip_id {itinerary['trip_id']}")
        for activity in itinerary['activities']:
            print(f"  Activity object: {activity}")
            activity_name_lower = activity.get('name', '').lower().strip()
            print(f"  Activity name: '{activity_name_lower}'")
            for pref in preferences:
                preference_keywords = trip_keywords[pref]
                if activity_name_lower and any(keyword in activity_name_lower for keyword in preference_keywords):
                    print(f"    Match found for preference '{pref}' with keyword(s): {[kw for kw in preference_keywords if kw in activity_name_lower]}")
                    similar_activities.append({
                        "trip_id": itinerary['trip_id'],
                        "activity": activity,
                        "matched_preference": pref  # Track which preference matched
                    })
                    break  # Move to next activity after a match

    if not similar_activities:
        return jsonify({"message": f"No activities matching {', '.join(preferences)} found in {destination}"}), 200

    return jsonify({
        "destination": destination,
        "preferences": preferences,
        "similar_activities": similar_activities
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    client.close()