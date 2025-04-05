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
    db = client.get_database("TripCraft")  # Explicitly specify the database
    print("Connected to database:", db.name)
    print("Collections in database:", db.list_collection_names())
except Exception as e:
    raise ConnectionError(f"Failed to connect to MongoDB: {e}")

def get_itineraries_from_db(destination):
    """
    Fetches all itineraries for trips with the specified destination from the database.
    Assumes trip_id in itineraries collection is a string, while _id in trips is an ObjectId.
    """
    # Case-insensitive search for trips with the specified destination
    trips = list(db.trips.find({"destination": {"$regex": f"^{destination}$", "$options": "i"}}))
    if not trips:
        print(f"No trips found for destination: {destination}")
        return []

    # Convert trip _id to string
    trip_ids = [str(trip["_id"]).strip() for trip in trips]
    print(f"Trip IDs for destination '{destination}': {trip_ids}")

    # Fetch itineraries matching the trip IDs
    itineraries = list(db.itineraries.find({"trip_id": {"$in": trip_ids}}))
    if not itineraries:
        print(f"No itineraries found for trip IDs: {trip_ids}")
        return []

    # Format itineraries to match the structure expected by the Flask app
    existing_itineraries_data = []
    for idx, itinerary in enumerate(itineraries, 1):
        formatted_itinerary = {
            "id": idx,  # Assign a simple integer ID
            "trip_id": itinerary["trip_id"],
            "destination": destination,  # Use the provided destination
            "activities": itinerary.get("activities", [])
        }
        existing_itineraries_data.append(formatted_itinerary)

    print(f"Fetched {len(existing_itineraries_data)} itineraries for destination: {destination}")
    return existing_itineraries_data

# Trip preference keywords
trip_keywords = {
    "History": ["historical", "monuments", "museum", "ancient", "heritage", "ruins", "castle", "war site", "archaeological"],
    "Food": ["food", "lunch", "dinner", "meal", "breakfast", "brunch", "snack", "cuisine", "restaurant", "street food", "wine tasting"],
    "Adventure": ["hiking", "trekking", "rafting", "skydiving", "scuba diving", "paragliding", "climbing", "bungee jumping", "surfing"],
    "Relaxation": ["spa", "massage", "hot spring", "beach", "resort", "meditation", "retreat", "yoga", "wellness"],
    "Shopping": ["mall", "market", "shopping street", "souvenirs", "boutique", "outlet", "bazaar", "flea market"],
    "Culture": ["festival", "traditional", "heritage", "temple", "ceremony", "customs", "folklore", "cultural site"],
    "Nature": ["forest", "national park", "wildlife", "waterfall", "lake", "mountain", "botanical garden", "scenic view"],
    "Nightlife": ["club", "bar", "pub", "live music", "concert", "night market", "casino", "rooftop lounge", "party"],
    "Art": ["museum", "gallery", "exhibition", "painting", "sculpture", "street art", "theater", "performance", "opera"],
    "Spiritual": ["temple", "church", "mosque", "synagogue", "pilgrimage", "meditation", "shrine", "monastery", "holy site"]
}

@app.route('/similarity', methods=['POST'])
def get_similar_activities():
    data = request.get_json()
    destination = data.get('destination')  
    preference_type = data.get('preference_type')  

    if not destination or not preference_type:
        return jsonify({"error": "Missing destination or preference_type"}), 400

    # Validate preference_type
    if preference_type not in trip_keywords:
        return jsonify({"error": f"Invalid preference_type. Must be one of: {list(trip_keywords.keys())}"}), 400

    # Fetch itineraries for the specified destination from the database
    existing_itineraries_data = get_itineraries_from_db(destination)

    if not existing_itineraries_data:
        return jsonify({"error": f"No itineraries found for destination: {destination}"}), 404

    # Get relevant keywords for the preference type
    preference_keywords = trip_keywords[preference_type]

    # Filter itineraries by destination (already done in get_itineraries_from_db, but kept for clarity)
    matching_itineraries = [itinerary for itinerary in existing_itineraries_data 
                          if itinerary['destination'].lower() == destination.lower()]

    # Find similar activities based on preference keywords
    similar_activities = []
    for itinerary in matching_itineraries:
        for activity in itinerary['activities']:
            activity_name_lower = activity['name'].lower()
            # Check if any preference keyword matches the activity name
            if any(keyword in activity_name_lower for keyword in preference_keywords):
                similar_activities.append({
                    "trip_id": itinerary['trip_id'],
                    "activity": activity
                })

    if not similar_activities:
        return jsonify({"message": f"No activities matching {preference_type} found in {destination}"}), 200

    return jsonify({
        "destination": destination,
        "preference_type": preference_type,
        "similar_activities": similar_activities
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)

    # Close the MongoDB connection when the app stops (optional)
    client.close()