import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.cluster import DBSCAN
from sklearn.ensemble import RandomForestRegressor
import time
from Similarity_Algorithm import find_similar_activities
from route import fetch_distance_matrix, cluster_locations
from hotel_suggestions import suggest_hotels


# Constants
MINIMUM_BUDGET = 100.0
MAX_HOURS_PER_DAY = 10.0
TAXI_RATE = 16.0  # INR per km per person

def train_model():
    X_train = np.random.rand(100, 2)
    y_train = np.random.rand(100)
    model = RandomForestRegressor()
    model.fit(X_train, y_train)
    return model

def preprocess_activities(activities, budget_per_day):
    X = np.array([[a["activity"]["estimatedCost"], a.get("duration", 2)] for a in activities])
    return X

def assign_time_slot(start_time, duration):
    start_str = start_time.strftime("%H:%M")
    end_time = start_time + timedelta(hours=duration)
    end_str = end_time.strftime("%H:%M")
    return start_str, end_str

def format_travel_duration(travel_time):
    if travel_time < 1:
        minutes = round(travel_time * 60)
        return minutes, "minutes"
    else:
        hours = int(travel_time)
        minutes = round((travel_time - hours) * 60)
        if minutes == 0:
            return f"{hours} hr", "hours"
        else:
            return f"{hours} hr {minutes} min", "mixed"

def convert_to_serializable(data):
    if isinstance(data, dict):
        return {k: convert_to_serializable(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_to_serializable(item) for item in data]
    elif isinstance(data, (np.integer, np.int64)):
        return int(data)
    elif isinstance(data, (np.floating, np.float64)):
        return float(data)
    return data


def format_travel_duration(travel_time):
    hours = int(travel_time)
    minutes = round((travel_time - hours) * 60)
    if hours > 0 and minutes > 0:
        return f"{hours} hr {minutes} min"
    elif hours > 0:
        return f"{hours} hr"
    else:
        return f"{minutes} min"


def generate_itinerary(user_input):
    start_time = time.time()
    start_date = datetime.strptime(user_input["trip"]["startDate"], "%Y-%m-%d")
    end_date = datetime.strptime(user_input["trip"]["endDate"], "%Y-%m-%d")
    days = (end_date - start_date).days + 1
    people = int(user_input["trip"]["people"])
    budget = float(user_input["trip"]["budget"])
    destination = user_input["trip"]["destination"]
    preferences = user_input["trip"].get("preferences", [])

    if days < 1 or people < 1 or budget < 100:
        raise ValueError("Invalid trip inputs")

    daily_budget = budget / days
    model = train_model()
    activities = find_similar_activities(destination, preferences, budget, people, days)
    if not activities:
        return {"itinerary": []}

    valid_activities, locations = [], []
    for activity in activities:
        lat = float(activity["activity"].get("latitude", 0))
        lon = float(activity["activity"].get("longitude", 0))
        if lat and lon:
            valid_activities.append(activity)
            locations.append((lon, lat))

    distance_matrix, time_matrix = fetch_distance_matrix(locations)
    for i, a in enumerate(valid_activities):
        a["matrix_index"] = i
        a["id"] = i

    clusters = cluster_locations(distance_matrix)
    for i, cluster_id in enumerate(clusters):
        valid_activities[i]["cluster_id"] = cluster_id

    scores = model.predict(preprocess_activities(valid_activities, daily_budget / people))
    for i, a in enumerate(valid_activities):
        a["score"] = float(scores[i])

    itinerary = []
    used_ids = set()

    for day in range(1, days + 1):
        current_time = datetime.strptime("09:00", "%H:%M")
        daily_cost, daily_duration = 0, 0
        day_entries = []

        day_activities = [a for a in valid_activities if a["id"] not in used_ids]
        day_activities.sort(key=lambda x: x["score"], reverse=True)

        for a in day_activities:
            cost = float(a["activity"]["estimatedCost"]) * people
            dur = float(a.get("duration", 2))
            if daily_cost + cost <= daily_budget and daily_duration + dur <= 10:
                start_str, end_str = assign_time_slot(current_time, dur)
                entry = {
                    "name": a["activity"]["name"],
                    "category": a["activity"]["category"],
                    "location": a["activity"]["location"],
                    "time_slot": f"{start_str}-{end_str}",
                    "duration": format_travel_duration(dur),
                    "estimatedCost": cost,
                    "rating": float(a["rating"]),
                    "latitude": float(a["activity"]["latitude"]),
                    "longitude": float(a["activity"]["longitude"]),
                    "day": day,
                    "date": (start_date + timedelta(days=day - 1)).strftime("%Y-%m-%d")
                }
                day_entries.append(entry)
                used_ids.add(a["id"])
                daily_cost += cost
                daily_duration += dur
                current_time += timedelta(hours=dur)

        # Add travel between activities
        for i in range(len(day_entries) - 1):
            from_, to_ = day_entries[i], day_entries[i + 1]
            idx_from = next((a["matrix_index"] for a in valid_activities if a["activity"]["name"] == from_["name"]), -1)
            idx_to = next((a["matrix_index"] for a in valid_activities if a["activity"]["name"] == to_["name"]), -1)

            if idx_from == -1 or idx_to == -1:
                continue

            dist_km = round(distance_matrix[idx_from][idx_to])
            time_hr = time_matrix[idx_from][idx_to]
            travel_cost = dist_km * people * 16
            start_str, end_str = assign_time_slot(current_time, time_hr)

            travel = {
                "name": f"Travel to {to_['name']}",
                "category": "Travel",
                "location": f"Travel from {from_['name']} to {to_['name']}",
                "distance": dist_km,
                "distanceUnit": "km",
                "duration": format_travel_duration(time_hr),
                "estimatedCost": travel_cost,
                "time_slot": f"{start_str}-{end_str}",
                "rating": 0.0,
                "latitude": to_["latitude"],
                "longitude": to_["longitude"],
                "day": day,
                "date": (start_date + timedelta(days=day - 1)).strftime("%Y-%m-%d")
            }
            day_entries.insert(i + 1, travel)
            current_time += timedelta(hours=time_hr)

        itinerary.append({
            "day": day,
            "date": (start_date + timedelta(days=day - 1)).strftime("%Y-%m-%d"),
            "activities": day_entries,
            "lunch": [],
            "stay": []
        })

    suggestions = suggest_hotels([a for day in itinerary for a in day["activities"]], {"trip": user_input["trip"]})
    for day in itinerary:
        key = f"day{day['day']}"
        day["lunch"] = list(suggestions.get(key, {}).get("lunch", {}).values())
        day["stay"] = list(suggestions.get(key, {}).get("stay", {}).values())

    print(f"Generated itinerary in {time.time() - start_time:.2f}s")
    return convert_to_serializable({"itinerary": itinerary})
