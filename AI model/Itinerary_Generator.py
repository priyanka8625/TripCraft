import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
import os
from Similarity_Algorithm import find_similar_activities, compute_similarity, all_possible_tags, fetch_low_cost_activities
import time
from Similarity_Algorithm import find_similar_activities
from route import fetch_distance_matrix, cluster_locations
from hotel_suggestions import suggest_hotels


# Valid time slots (kept for output but not constrained)
valid_time_slots = ["morning", "afternoon", "evening", "daytime"]

# Feature order for model
FEATURE_ORDER = [
    "similarity_score",
    "rating_normalized",
    "estimatedCost_normalized",
    "budget_per_person_per_day_normalized",
    "duration_normalized",
    "timeSlot_morning",
    "timeSlot_afternoon",
    "timeSlot_evening",
    "timeSlot_daytime"
]

def generate_training_data():
    data = []
    max_cost = 1000
    max_budget = 1000
    max_duration = 8
    for _ in range(10000):
        tags = np.random.choice(all_possible_tags, size=np.random.randint(1, 3), replace=False)
        user_prefs = np.random.choice(all_possible_tags, size=np.random.randint(1, 3), replace=False)
        cost = np.random.uniform(10, max_cost)
        rating = np.random.uniform(1, 5)
        time_slot = np.random.choice(valid_time_slots)
        budget_per_person_per_day = np.random.uniform(50, max_budget)
        duration = np.random.uniform(1, max_duration)
        sim_score = compute_similarity(user_prefs, tags)
        score = 0.9 if sim_score > 0.5 and cost < budget_per_person_per_day and 2 <= duration <= 8 else 0.2
        record = {
            "similarity_score": sim_score,
            "rating_normalized": rating / 5,
            "estimatedCost_normalized": cost / max_cost,
            "budget_per_person_per_day_normalized": budget_per_person_per_day / max_budget,
            "duration_normalized": duration / max_duration,
            "relevance_score": score
        }
        for ts in valid_time_slots:
            record[f"timeSlot_{ts}"] = 1 if ts == time_slot else 0
        data.append(record)
    return pd.DataFrame(data)


def preprocess_activities(activities, budget_per_person_per_day):
    data = []
    max_cost = 1000
    max_budget = 1000
    max_duration = 8
    for activity in activities:
        time_slot = activity["activity"]["timeSlot"].lower() if "activity" in activity and "timeSlot" in activity["activity"] else "daytime"
        if time_slot not in valid_time_slots:
            time_slot = "daytime"
        cost = activity["activity"]["estimatedCost"] if "activity" in activity and "estimatedCost" in activity["activity"] else 10.0
        if not isinstance(cost, (int, float)):
            print(f"Invalid estimatedCost for {activity.get('activity', {}).get('name', 'Unknown')}: {cost}, Type: {type(cost)}. Converting to float.")
            try:
                cost = float(cost)
            except (ValueError, TypeError):
                cost = 10.0
        activity["activity"]["estimatedCost"] = cost
        if "duration" not in activity:
            activity["duration"] = 2  
        duration = activity["duration"]
        record = {
            "similarity_score": activity.get("similarity_score", 0.0),
            "rating_normalized": activity.get("rating", 0.0) / 5,
            "estimatedCost_normalized": cost / max_cost,
            "budget_per_person_per_day_normalized": budget_per_person_per_day / max_budget,
            "duration_normalized": duration / max_duration
        }
        for ts in valid_time_slots:
            record[f"timeSlot_{ts}"] = 1 if ts == time_slot else 0
        data.append(record)
    df = pd.DataFrame(data)[FEATURE_ORDER]
    return df


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
    print(f"Activities fetched: {len(activities)} in {time.time() - start_time:.2f} seconds")
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

