import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.cluster import DBSCAN
from sklearn.ensemble import RandomForestRegressor
import time
from Similarity_Algorithm import find_similar_activities
from route import fetch_distance_matrix, cluster_locations

# Constants
MINIMUM_BUDGET = 100.0
MAX_HOURS_PER_DAY = 10.0
TAXI_RATE = 16.0  # INR per km per person

def train_model():
    # Generate some dummy data
    X_train = np.random.rand(100, 2)  # 2 features: cost and duration
    y_train = np.random.rand(100)     # Random target values
    model = RandomForestRegressor()
    model.fit(X_train, y_train)       # Fit the model with dummy data
    return model

def preprocess_activities(activities, budget_per_day):
    # Simplified preprocessing for demonstration
    X = np.array([[a["activity"]["estimatedCost"], a.get("duration", 2)] for a in activities])
    return X

def assign_time_slot(current_time, duration):
    start_time = current_time.strftime("%H:%M")
    end_time = (current_time + timedelta(hours=duration)).strftime("%H:%M")
    return start_time, end_time

def format_duration(duration_hours):
    if duration_hours < 1:
        return duration_hours * 60, "minutes"
    return duration_hours, "hours"

def convert_to_serializable(data):
    # Convert numpy types to native Python types
    if isinstance(data, dict):
        return {k: convert_to_serializable(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_to_serializable(item) for item in data]
    elif isinstance(data, (np.integer, np.int64)):
        return int(data)
    elif isinstance(data, (np.floating, np.float64)):
        return float(data)
    return data

def generate_itinerary(user_input):
    start_time = time.time()
    try:
        start_date = datetime.strptime(user_input["startDate"], "%Y-%m-%d")
        end_date = datetime.strptime(user_input["endDate"], "%Y-%m-%d")
        days = (end_date - start_date).days + 1
        people = int(user_input["people"])
        budget = float(user_input["budget"])
        destination = user_input["destination"]
        preferences = user_input.get("preferences", [])
    except (KeyError, ValueError) as e:
        raise ValueError(f"Invalid input: {str(e)}")

    if days < 1 or people < 1 or budget < MINIMUM_BUDGET:
        raise ValueError("Invalid days, people, or budget")

    daily_budget = budget / days
    daily_time_limit = MAX_HOURS_PER_DAY

    model = train_model()
    cache = {}

    # Fetch activities
    activities = find_similar_activities(destination, preferences, budget, people, days)
    if not activities:
        return {"activities": []}

    # Filter valid activities with location data
    valid_activities = []
    locations = []
    for idx, activity in enumerate(activities):
        lat = float(activity["activity"].get("latitude", 0))
        lon = float(activity["activity"].get("longitude", 0))
        if lat != 0 and lon != 0:
            activity["id"] = idx
            valid_activities.append(activity)
            locations.append((lon, lat))

    if not valid_activities:
        return {"activities": []}

    # Fetch distance and time matrices (now synchronous)
    distance_matrix, time_matrix = fetch_distance_matrix(locations)

    # Cluster activities
    clusters = cluster_locations(distance_matrix, eps_km=20, min_samples=2)
    cluster_dict = {}
    noise_activities = []
    for idx, cluster_id in enumerate(clusters):
        if cluster_id == -1:
            noise_activities.append(valid_activities[idx])
        else:
            cluster_dict.setdefault(cluster_id, []).append(valid_activities[idx])

    # Score activities
    X = preprocess_activities(valid_activities, daily_budget / people)
    scores = model.predict(X)
    for i, activity in enumerate(valid_activities):
        activity["score"] = float(scores[i])

    # Generate itinerary
    itinerary = []
    used_activities = set()
    for day in range(1, days + 1):
        daily_itinerary = []
        daily_cost = 0.0
        daily_duration = 0.0
        current_time = datetime.strptime("09:00", "%H:%M")

        # Select activities for the day
        available_activities = [a for a in valid_activities if a["id"] not in used_activities]
        available_activities.sort(key=lambda x: x["score"], reverse=True)

        for activity in available_activities:
            cost = float(activity["activity"]["estimatedCost"]) * people
            duration = float(activity.get("duration", 2))
            if daily_cost + cost <= daily_budget and daily_duration + duration <= daily_time_limit:
                start_time, end_time = assign_time_slot(current_time, duration)
                daily_itinerary.append({
                    "category": activity["activity"]["category"],
                    "cluster_id": activity.get("cluster_id", -1),
                    "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                    "day": day,
                    "duration": duration,
                    "durationUnit": "hours",
                    "estimatedCost": cost,
                    "index": len(itinerary),
                    "latitude": float(activity["activity"]["latitude"]),
                    "location": activity["activity"]["location"],
                    "longitude": float(activity["activity"]["longitude"]),
                    "name": activity["activity"]["name"],
                    "rating": float(activity["rating"]),
                    "time_slot": f"{start_time}-{end_time}",
                    "activity_id": activity["id"]
                })
                used_activities.add(activity["id"])
                daily_cost += cost
                daily_duration += duration
                current_time += timedelta(hours=duration)
                itinerary.append(daily_itinerary[-1])

        # Add travel between activities
        for i in range(len(daily_itinerary) - 1):
            activity = daily_itinerary[i]
            next_activity = daily_itinerary[i + 1]
            prev_idx = activity["activity_id"]
            curr_idx = next_activity["activity_id"]
            distance_km = round(distance_matrix[prev_idx][curr_idx])
            estimated_time = time_matrix[prev_idx][curr_idx]
            travel_cost = distance_km * TAXI_RATE * people
            if distance_km == 0:
                distance_km = 1
            if daily_cost + travel_cost <= daily_budget and daily_duration + estimated_time <= daily_time_limit:
                start_time, end_time = assign_time_slot(current_time, estimated_time)
                itinerary.append({
                    "category": "Travel",
                    "cluster_id": activity.get("cluster_id", -1),
                    "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                    "day": day,
                    "distance": distance_km,
                    "duration": estimated_time,
                    "durationUnit": "hours",
                    "estimatedCost": travel_cost,
                    "index": len(itinerary),
                    "latitude": float(next_activity["latitude"]),
                    "location": f"Travel from {activity['name']} to {next_activity['name']}",
                    "longitude": float(next_activity["longitude"]),
                    "name": f"Travel to {next_activity['name']}",
                    "rating": 0.0,
                    "time_slot": f"{start_time}-{end_time}"
                })
                daily_cost += travel_cost
                daily_duration += estimated_time
                current_time += timedelta(hours=estimated_time)

    itinerary.sort(key=lambda x: (x["day"], x["index"]))
    return convert_to_serializable({"activities": itinerary})