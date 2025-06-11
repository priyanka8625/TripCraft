from math import radians, sin, cos, sqrt, asin
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Retrieve MONGO_URI from environment variables
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is missing")

def haversine(lon1, lat1, lon2, lat2):
    """Calculate the distance between two points on Earth using the Haversine formula."""
    R = 6371  # Earth radius in kilometers
    dlon = radians(lon2 - lon1)
    dlat = radians(lat2 - lat1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

def is_lunch_time_slot(time_slot):
    """Check if the time slot starts between 12:00 and 14:00."""
    try:
        start_time = datetime.strptime(time_slot.split("-")[0].strip(), "%H:%M").time()
        lunch_start = datetime.strptime("12:00", "%H:%M").time()
        lunch_end = datetime.strptime("14:00", "%H:%M").time()
        return lunch_start <= start_time <= lunch_end
    except ValueError:
        return False

def suggest_hotels(activities,user_input):
    """
    Generate hotel and lunch suggestions based on the list of activities for the given destination.

    Args:
        activities: List of activity dictionaries from the itinerary.
        destination: String representing the destination (e.g., 'Delhi').

    Returns:
        Dictionary with 'suggestions' key containing hotel and lunch recommendations.
    """
    # Connect to MongoDB Atlas using the URI from .env
    client = MongoClient(MONGO_URI)
    db = client["TripCraft"]
    collection = db["destination"]
    try:
        start_date = datetime.strptime(user_input["trip"]["startDate"], "%Y-%m-%d")
        end_date = datetime.strptime(user_input["trip"]["endDate"], "%Y-%m-%d")
        days = (end_date - start_date).days + 1
        people = int(user_input["trip"]["people"])
        budget = float(user_input["trip"]["budget"])
        destination = user_input["trip"]["destination"]
        preferences = user_input["trip"].get("preferences", [])
    except (KeyError, ValueError) as e:
        raise ValueError(f"Invalid input: {str(e)}")
    # Fetch destination document
    destination_doc = collection.find_one({"destination": destination})
    if not destination_doc:
        raise ValueError("Destination not found in database")

    hotels = destination_doc.get("hotels", [])
    stay_hotels = [h for h in hotels if h.get("stayType") == "Stay"]
    lunch_restaurants = [h for h in hotels if h.get("stayType") == "Lunch"]

    # Group activities by day
    day_map = {}
    for activity in activities:
        day = activity["day"]
        day_map.setdefault(day, []).append(activity)

    suggestions = {}
    for day, activities in day_map.items():
        day_key = f"day{day}"
        suggestions[day_key] = {"lunch": {}, "stay": {}}

        if not activities:
            continue

        # Filter out travel activities and sort by time_slot
        day_activities = [act for act in activities if act.get("category") != "Travel"]
        if not day_activities:
            continue
        day_activities.sort(key=lambda a: a["time_slot"])

        # Stay suggestions (closest to last activity)
        last_activity = day_activities[-1]
        if stay_hotels:
            stay_sorted = sorted(
                stay_hotels,
                key=lambda h: haversine(
                    float(h["longitude"]), float(h["latitude"]),
                    float(last_activity["longitude"]), float(last_activity["latitude"])
                )
            )
            for i, spot in enumerate(stay_sorted[:4], 1):
                suggestions[day_key]["stay"][f"spot{i}"] = {
                    "name": spot["name"],
                    "location": spot["location"],
                    "rating": float(spot["rating"]),
                    "pricePerNight": int(spot["pricePerNight"]),
                    "longitude": float(spot["longitude"]),
                    "latitude": float(spot["latitude"])
                }

        # Lunch suggestions (closest to lunch-time activity)
        lunch_activities = [a for a in day_activities if is_lunch_time_slot(a["time_slot"])]
        if lunch_activities and lunch_restaurants:
            lunch_activity = lunch_activities[0]
            lunch_sorted = sorted(
                lunch_restaurants,
                key=lambda r: haversine(
                    float(r["longitude"]), float(r["latitude"]),
                    float(lunch_activity["longitude"]), float(lunch_activity["latitude"])
                )
            )
            for i, spot in enumerate(lunch_sorted[:3], 1):
                suggestions[day_key]["lunch"][f"spot{i}"] = {
                    "name": spot["name"],
                    "location": spot["location"],
                    "rating": float(spot["rating"]),
                    "price": int(spot["pricePerNight"]),  # Assuming this field is used for meal cost
                    "longitude": float(spot["longitude"]),
                    "latitude": float(spot["latitude"])
                }

    # Construct the final response
    return suggestions