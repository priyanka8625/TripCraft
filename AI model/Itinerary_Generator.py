import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.cluster import DBSCAN
from sklearn.ensemble import RandomForestRegressor
import time
from Similarity_Algorithm import find_similar_activities, fetch_low_cost_activities

AVERAGE_SPEED = 40
TAXI_RATE = 8  # Further reduced to lower travel costs
MINIMUM_BUDGET = 20
MAX_HOURS_PER_DAY = 14

def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(np.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    r = 6371
    return c * r

def fetch_distance_matrix(locations, use_haversine=True):
    n = len(locations)
    distance_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(i + 1, n):
            distance = haversine(locations[i][0], locations[i][1], locations[j][0], locations[j][1])
            distance_matrix[i][j] = distance
            distance_matrix[j][i] = distance
    return distance_matrix

def cluster_locations(distance_matrix, eps_km=20, min_samples=2):  # Increased eps_km
    clustering = DBSCAN(eps=eps_km, min_samples=min_samples, metric='precomputed').fit(distance_matrix)
    return clustering.labels_

def format_duration(estimated_time):
    if estimated_time >= 1:
        return round(estimated_time, 1), "hours"
    return round(estimated_time * 60), "minutes"

def normalize_name(name):
    if isinstance(name, np.ndarray):
        raise ValueError(f"normalize_name received NumPy array: {name}")
    name = str(name)
    print(f"normalize_name: '{name}', type: {type(name)}")
    normalized = name.replace("  ", " ").strip().lower()
    return normalized

def preprocess_activities(activities, budget_per_person_per_day):
    print("preprocess_activities: Starting")
    X = []
    max_cost = max((float(activity["activity"]["estimatedCost"]) for activity in activities), default=1000)
    max_budget = min(max(float(budget_per_person_per_day), 1000), 10000)
    max_duration = 8
    
    for activity in activities:
        name = str(activity["activity"]["name"])
        print(f"preprocess_activities: Processing '{name}', type: {type(name)}")
        cost = float(activity["activity"]["estimatedCost"])
        rating = float(activity["rating"])
        duration = float(activity["duration"])
        similarity_score = float(activity["similarity_score"])
        X.append([
            similarity_score,
            rating / 5.0,
            min(cost / max_cost, 1.0),
            min(budget_per_person_per_day / max_budget, 1.0),
            duration / max_duration
        ])
    return np.array(X, dtype=float)

def generate_training_data():
    data = []
    all_possible_tags = ["history", "nature", "culture", "spiritual", "relaxation", "adventure", "food", "shopping", "art", "nightlife"]
    max_cost = 1000
    max_budget = 10000
    max_duration = 8
    for _ in range(10000):
        tags = np.random.choice(all_possible_tags, size=np.random.randint(1, 4), replace=False).tolist()
        user_prefs = np.random.choice(all_possible_tags, size=np.random.randint(1, 3), replace=False).tolist()
        cost = np.random.uniform(10, max_cost)
        rating = np.random.uniform(1, 5)
        budget_per_person_per_day = np.random.uniform(50, max_budget)
        duration = np.random.uniform(1, max_duration)
        sim_score = sum(1 for tag in tags if tag in user_prefs) / len(set(tags + user_prefs))
        score = (0.4 * sim_score + 0.3 * (rating / 5) + 0.2 * (1 - cost / budget_per_person_per_day) +
                 0.1 * (1 - abs(duration - 4) / 4)) * 0.9 + 0.1
        data.append({
            "similarity_score": sim_score,
            "rating_normalized": rating / 5,
            "estimatedCost_normalized": cost / max_cost,
            "budget_per_person_per_day_normalized": budget_per_person_per_day / max_budget,
            "duration_normalized": duration / max_duration,
            "relevance_score": score
        })
    return pd.DataFrame(data)

def train_model():
    df = generate_training_data()
    X = df[["similarity_score", "rating_normalized", "estimatedCost_normalized",
            "budget_per_person_per_day_normalized", "duration_normalized"]]
    y = df["relevance_score"]
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    return model

def assign_time_slot(current_time, duration):
    start_time = current_time
    end_time = start_time + timedelta(hours=duration)
    return start_time.strftime("%H:%M"), end_time.strftime("%H:%M")

def convert_to_serializable(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    return obj

def generate_itinerary(user_input):
    print(f"generate_itinerary: Input: {user_input}")
    try:
        start_date = datetime.strptime(user_input["startDate"], "%Y-%m-%d")
        end_date = datetime.strptime(user_input["endDate"], "%Y-%m-%d")
        days = (end_date - start_date).days + 1
        people = int(user_input["people"])
        budget = float(user_input["budget"])
        destination = str(user_input["destination"])
        preferences = [str(p) for p in user_input.get("preferences", [])]
    except (KeyError, ValueError) as e:
        raise ValueError(f"Invalid input: {str(e)}")

    if days < 1 or people < 1 or budget < MINIMUM_BUDGET:
        raise ValueError("Invalid days, people, or budget")

    MAX_TRAVEL_DISTANCE = 150
    NOISE_TRAVEL_DISTANCE = 100
    budget_per_person_per_day = budget / (people * days)
    model = train_model()

    start_time = time.time()
    activities = find_similar_activities(destination, preferences, budget, people, days)
    activity_names = []
    for a in activities:
        name = str(a["activity"]["name"])
        activity_names.append(name)
        print(f"generate_itinerary: Activity: '{name}', type: {type(name)}, tags: {a['activity']['tags']}, cost: {a['activity']['estimatedCost']}")
    print(f"generate_itinerary: Fetched {len(activities)} activities in {time.time() - start_time:.2f}s: {activity_names}")

    if not activities:
        print("generate_itinerary: No activities found, returning empty itinerary")
        return {"activities": []}

    valid_activities = []
    locations = []
    activity_name_to_index = {}
    for idx, activity in enumerate(activities):
        name = str(activity["activity"]["name"])
        lat = float(activity["activity"].get("latitude", 0))
        lon = float(activity["activity"].get("longitude", 0))
        normalized_name = normalize_name(name)
        if lat != 0 and lon != 0 and normalized_name:
            valid_activities.append(activity)
            locations.append((lon, lat))
            activity_name_to_index[normalized_name] = len(valid_activities) - 1
            activity["score"] = 0.0
            activity["activity"]["name"] = name
            tags = activity["activity"]["tags"]
            if isinstance(tags, np.ndarray):
                tags = tags.tolist()
            activity["activity"]["tags"] = [str(tag) for tag in tags]
            print(f"generate_itinerary: Valid activity: '{name}', normalized: '{normalized_name}', type: {type(name)}")
        else:
            print(f"generate_itinerary: Skipping activity '{name}' (invalid lat: {lat}, lon: {lon} or name)")

    if not valid_activities:
        print("generate_itinerary: No valid activities with location data, returning empty itinerary")
        return {"activities": []}

    distance_matrix = fetch_distance_matrix(locations, use_haversine=True)
    clusters = cluster_locations(distance_matrix, eps_km=20, min_samples=2)
    cluster_dict = {}
    noise_activities = []
    for idx, cluster_id in enumerate(clusters):
        if cluster_id == -1:
            noise_activities.append(valid_activities[idx])
        else:
            if cluster_id not in cluster_dict:
                cluster_dict[cluster_id] = []
            cluster_dict[cluster_id].append(valid_activities[idx])
    print(f"generate_itinerary: Clusters: {len(cluster_dict)}, Noise activities: {len(noise_activities)}")

    X = preprocess_activities(valid_activities, budget_per_person_per_day)
    scores = model.predict(X)
    for i, activity in enumerate(valid_activities):
        activity["score"] = float(scores[i])

    itinerary = []
    used_activities_per_day = {day: set() for day in range(1, days + 1)}
    total_duration = {day: 0.0 for day in range(1, days + 1)}
    total_travel_distance = {day: 0.0 for day in range(1, days + 1)}
    remaining_budget = budget
    cluster_ids = sorted([cid for cid in cluster_dict.keys() if cid != -1])

    for day in range(1, days + 1):
        daily_activities = []
        cluster_id = cluster_ids[(day - 1) % len(cluster_ids)] if cluster_ids else -1
        available_activities = cluster_dict.get(cluster_id, []) + noise_activities
        available_activities = sorted(available_activities, key=lambda x: x["score"], reverse=True)
        activity_count = 0
        max_activities = 3 if cluster_id == -1 else min(5, len(available_activities))  # Increased for noise days
        is_noise_day = cluster_id == -1
        max_travel = NOISE_TRAVEL_DISTANCE if is_noise_day else MAX_TRAVEL_DISTANCE
        current_time = datetime.strptime("09:00", "%H:%M")
        print(f"generate_itinerary: Processing Day {day}, Cluster {cluster_id}, Max activities: {max_activities}, Budget left: {remaining_budget:.2f}")

        for activity in available_activities:
            if activity_count >= max_activities or total_duration[day] >= MAX_HOURS_PER_DAY or remaining_budget <= MINIMUM_BUDGET:
                print(f"generate_itinerary: Day {day} stopped: activities={activity_count}/{max_activities}, duration={total_duration[day]}/{MAX_HOURS_PER_DAY}, budget={remaining_budget}/{MINIMUM_BUDGET}")
                break
            activity_name = normalize_name(activity["activity"]["name"])
            cost = float(activity["activity"]["estimatedCost"]) * people
            duration = float(activity.get("duration", 2))
            if (activity_name not in used_activities_per_day[day] and 
                cost <= remaining_budget - MINIMUM_BUDGET and 
                total_duration[day] + duration <= MAX_HOURS_PER_DAY and
                activity_name in activity_name_to_index):
                start_time, end_time = assign_time_slot(current_time, duration)
                itinerary.append({
                    "category": activity["activity"]["category"],
                    "cluster_id": int(cluster_id),
                    "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                    "day": int(day),
                    "duration": float(duration),
                    "durationUnit": "hours",
                    "estimatedCost": float(cost),
                    "index": int(len(itinerary)),
                    "latitude": float(activity["activity"]["latitude"]),
                    "location": activity["activity"]["location"],
                    "longitude": float(activity["activity"]["longitude"]),
                    "name": activity["activity"]["name"],
                    "rating": float(activity["rating"]),
                    "time_slot": f"{start_time}-{end_time}"
                })
                used_activities_per_day[day].add(activity_name)
                remaining_budget -= cost
                total_duration[day] += duration
                activity_count += 1
                daily_activities.append(activity)
                current_time += timedelta(hours=duration)
                print(f"generate_itinerary: Assigned: {activity['activity']['name']}, Cost: {cost}, Time: {start_time}-{end_time}, Budget left: {remaining_budget:.2f} INR")
            else:
                print(f"generate_itinerary: Skipped '{activity_name}' (used: {activity_name in used_activities_per_day[day]}, cost: {cost}/{remaining_budget-MINIMUM_BUDGET}, duration: {total_duration[day]+duration}/{MAX_HOURS_PER_DAY}, in_index: {activity_name in activity_name_to_index})")

        daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
        print(f"generate_itinerary: Day {day} itinerary: {[a['name'] for a in daily_itinerary]}")
        i = 0
        while i < len(daily_itinerary) - 1:
            activity = daily_itinerary[i]
            next_activity = daily_itinerary[i + 1]
            prev_name = normalize_name(activity["name"])
            curr_name = normalize_name(next_activity["name"])
            print(f"generate_itinerary: Travel: {activity['name']} to {next_activity['name']}")
            try:
                prev_idx = activity_name_to_index.get(prev_name)
                curr_idx = activity_name_to_index.get(curr_name)
                distance_km = distance_matrix[prev_idx][curr_idx] if prev_idx is not None and curr_idx is not None else haversine(
                    activity["longitude"], activity["latitude"],
                    next_activity["longitude"], next_activity["latitude"]
                )
                distance_km = round(distance_km)
                if distance_km == 0:
                    distance_km = 1
                if total_travel_distance[day] + distance_km > max_travel:
                    print(f"generate_itinerary: Skipping travel from {activity['name']} to {next_activity['name']} (exceeds {max_travel} km, total: {total_travel_distance[day] + distance_km})")
                    itinerary = [a for a in itinerary if a != next_activity]
                    used_activities_per_day[day].remove(curr_name)
                    total_duration[day] -= next_activity["duration"]
                    daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
                    if len(daily_itinerary) < 2:
                        break
                    continue
                travel_cost = float(distance_km * TAXI_RATE) * people
                estimated_time = float(distance_km / AVERAGE_SPEED)
                duration, duration_unit = format_duration(estimated_time)
                if travel_cost > remaining_budget - MINIMUM_BUDGET:
                    print(f"generate_itinerary: Skipping travel (cost: {travel_cost:.2f} > budget: {remaining_budget-MINIMUM_BUDGET:.2f})")
                    itinerary = [a for a in itinerary if a != next_activity]
                    used_activities_per_day[day].remove(curr_name)
                    total_duration[day] -= next_activity["duration"]
                    daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
                    if len(daily_itinerary) < 2:
                        break
                    continue
                if total_duration[day] + estimated_time > MAX_HOURS_PER_DAY:
                    print(f"generate_itinerary: Skipping travel (duration: {total_duration[day] + estimated_time} > {MAX_HOURS_PER_DAY})")
                    itinerary = [a for a in itinerary if a != next_activity]
                    used_activities_per_day[day].remove(curr_name)
                    total_duration[day] -= next_activity["duration"]
                    daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
                    if len(daily_itinerary) < 2:
                        break
                    continue
                start_time, end_time = assign_time_slot(current_time, estimated_time)
                itinerary.append({
                    "category": "Travel",
                    "cluster_id": int(cluster_id),
                    "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                    "day": int(day),
                    "distance": int(distance_km),
                    "duration": float(duration),
                    "durationUnit": duration_unit,
                    "estimatedCost": float(travel_cost),
                    "index": int(len(itinerary)),
                    "latitude": float(next_activity["latitude"]),
                    "location": f"Travel from {activity['name']} to {next_activity['name']}",
                    "longitude": float(next_activity["longitude"]),
                    "name": f"Travel to {next_activity['name']}",
                    "rating": 0.0,
                    "time_slot": f"{start_time}-{end_time}"
                })
                total_travel_distance[day] += distance_km
                remaining_budget -= travel_cost
                total_duration[day] += estimated_time
                current_time += timedelta(hours=estimated_time)
                print(f"generate_itinerary: Added travel: {activity['name']} to {next_activity['name']}, Distance: {distance_km} km, Duration: {duration} {duration_unit}, Cost: {travel_cost:.2f} INR")
                i += 1
            except Exception as e:
                print(f"generate_itinerary: Error calculating distance: {e}")
                i += 1

    start_time = time.time()
    active_days = set(activity["day"] for activity in itinerary if activity["category"] != "Travel")
    max_redistribution_attempts = 15
    attempt = 0
    while len(active_days) < days and attempt < max_redistribution_attempts and remaining_budget > MINIMUM_BUDGET:
        print(f"generate_itinerary: Redistributing (Attempt {attempt + 1}/{max_redistribution_attempts}), Active days: {len(active_days)}/{days}, Budget: {remaining_budget:.2f}")
        required_activities = (days - len(active_days)) * 5
        additional_spots = fetch_low_cost_activities(destination, remaining_budget, people, required_activities * 2)
        additional_names = []
        for s in additional_spots:
            name = str(s["activity"]["name"])
            additional_names.append(name)
            print(f"generate_itinerary: Additional spot: '{name}', type: {type(name)}, cost: {s['activity']['estimatedCost']}")
        print(f"generate_itinerary: Fetched {len(additional_spots)} additional spots: {additional_names}")

        if additional_spots:
            valid_additional_spots = []
            additional_locations = []
            for idx, spot in enumerate(additional_spots):
                name = str(spot["activity"]["name"])
                lat = float(spot["activity"].get("latitude", 0))
                lon = float(spot["activity"].get("longitude", 0))
                normalized_name = normalize_name(name)
                if lat != 0 and lon != 0:
                    spot["activity"]["estimatedCost"] *= 0.5
                    spot["activity"]["name"] = name
                    tags = spot["activity"]["tags"]
                    if isinstance(tags, np.ndarray):
                        tags = tags.tolist()
                    spot["activity"]["tags"] = [str(tag) for tag in tags]
                    valid_additional_spots.append(spot)
                    additional_locations.append((lon, lat))
                    activity_name_to_index[normalized_name] = len(valid_activities) + len(valid_additional_spots) - 1
                    print(f"generate_itinerary: Valid additional spot: '{name}', normalized: '{normalized_name}', cost: {spot['activity']['estimatedCost']}")
                else:
                    print(f"generate_itinerary: Skipping additional spot '{name}' (invalid lat: {lat}, lon: {lon})")
            if valid_additional_spots:
                valid_activities.extend(valid_additional_spots)
                locations.extend(additional_locations)
                distance_matrix = fetch_distance_matrix(locations, use_haversine=True)
                clusters = cluster_locations(distance_matrix, eps_km=20, min_samples=2)
                cluster_dict = {}
                for idx, cluster_id in enumerate(clusters):
                    if cluster_id not in cluster_dict:
                        cluster_dict[cluster_id] = []
                    cluster_dict[cluster_id].append(valid_activities[idx])
                X = preprocess_activities(valid_activities, budget_per_person_per_day)
                scores = model.predict(X)
                for i, activity in enumerate(valid_activities):
                    activity["score"] = float(scores[i])
                print(f"generate_itinerary: Updated clusters: {len(cluster_dict)}, Total activities: {len(valid_activities)}")

        # Prioritize empty days
        for day in range(1, days + 1):
            if day in active_days and total_duration[day] >= MAX_HOURS_PER_DAY:
                print(f"generate_itinerary: Skipping Day {day} (already full, duration: {total_duration[day]})")
                continue
            if day in active_days:
                continue  # Skip non-empty days in early redistribution
            cluster_id = cluster_ids[(day - 1) % len(cluster_ids)] if cluster_ids else -1
            available_activities = cluster_dict.get(cluster_id, []) + noise_activities
            available_activities = sorted(available_activities, key=lambda x: (x["score"], x["rating"]), reverse=True)
            daily_activities = []
            is_noise_day = cluster_id == -1
            max_activities = 3 if is_noise_day else min(5, len(available_activities))
            max_travel = NOISE_TRAVEL_DISTANCE if is_noise_day else MAX_TRAVEL_DISTANCE
            activity_count = len([a for a in itinerary if a["day"] == day and a["category"] != "Travel"])
            current_time = datetime.strptime("09:00", "%H:%M")
            print(f"generate_itinerary: Redistributing Day {day}, Cluster {cluster_id}, Current time: {current_time.strftime('%H:%M')}, Budget: {remaining_budget:.2f}")

            for activity in available_activities:
                if activity_count >= max_activities or total_duration[day] >= MAX_HOURS_PER_DAY or remaining_budget <= MINIMUM_BUDGET:
                    print(f"generate_itinerary: Day {day} stopped in redistribution: activities={activity_count}/{max_activities}, duration={total_duration[day]}/{MAX_HOURS_PER_DAY}, budget={remaining_budget}/{MINIMUM_BUDGET}")
                    break
                activity_name = normalize_name(activity["activity"]["name"])
                cost = float(activity["activity"]["estimatedCost"]) * people
                duration = float(activity.get("duration", 2))
                if (activity_name not in used_activities_per_day[day] and 
                    cost <= remaining_budget - MINIMUM_BUDGET and 
                    total_duration[day] + duration <= MAX_HOURS_PER_DAY and
                    activity_name in activity_name_to_index):
                    start_time, end_time = assign_time_slot(current_time, duration)
                    itinerary.append({
                        "category": activity["activity"]["category"],
                        "cluster_id": int(cluster_id),
                        "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                        "day": int(day),
                        "duration": float(duration),
                        "durationUnit": "hours",
                        "estimatedCost": float(cost),
                        "index": int(len(itinerary)),
                        "latitude": float(activity["activity"]["latitude"]),
                        "location": activity["activity"]["location"],
                        "longitude": float(activity["activity"]["longitude"]),
                        "name": activity["activity"]["name"],
                        "rating": float(activity["rating"]),
                        "time_slot": f"{start_time}-{end_time}"
                    })
                    used_activities_per_day[day].add(activity_name)
                    remaining_budget -= cost
                    total_duration[day] += duration
                    activity_count += 1
                    daily_activities.append(activity)
                    current_time += timedelta(hours=duration)
                    print(f"generate_itinerary: Redistribution assigned: {activity['activity']['name']}, Cost: {cost}, Time: {start_time}-{end_time}, Budget left: {remaining_budget:.2f}")
                else:
                    print(f"generate_itinerary: Redistribution skipped '{activity_name}' (used: {activity_name in used_activities_per_day[day]}, cost: {cost}/{remaining_budget-MINIMUM_BUDGET}, duration: {total_duration[day]+duration}/{MAX_HOURS_PER_DAY}, in_index: {activity_name in activity_name_to_index})")

            daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
            i = 0
            while i < len(daily_itinerary) - 1:
                activity = daily_itinerary[i]
                next_activity = daily_itinerary[i + 1]
                prev_name = normalize_name(activity["name"])
                curr_name = normalize_name(next_activity["name"])
                try:
                    prev_idx = activity_name_to_index.get(prev_name)
                    curr_idx = activity_name_to_index.get(curr_name)
                    distance_km = distance_matrix[prev_idx][curr_idx] if prev_idx is not None and curr_idx is not None else haversine(
                        activity["longitude"], activity["latitude"],
                        next_activity["longitude"], next_activity["latitude"]
                    )
                    distance_km = round(distance_km)
                    if distance_km == 0:
                        distance_km = 1
                    if total_travel_distance[day] + distance_km > max_travel:
                        print(f"generate_itinerary: Redistribution skipping travel from {activity['name']} to {next_activity['name']} (exceeds {max_travel} km, total: {total_travel_distance[day] + distance_km})")
                        itinerary = [a for a in itinerary if a != next_activity]
                        used_activities_per_day[day].remove(curr_name)
                        total_duration[day] -= next_activity["duration"]
                        daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
                        if len(daily_itinerary) < 2:
                            break
                        continue
                    travel_cost = float(distance_km * TAXI_RATE) * people
                    estimated_time = float(distance_km / AVERAGE_SPEED)
                    duration, duration_unit = format_duration(estimated_time)
                    if travel_cost > remaining_budget - MINIMUM_BUDGET:
                        print(f"generate_itinerary: Redistribution skipping travel (cost: {travel_cost:.2f} > budget: {remaining_budget-MINIMUM_BUDGET:.2f})")
                        itinerary = [a for a in itinerary if a != next_activity]
                        used_activities_per_day[day].remove(curr_name)
                        total_duration[day] -= next_activity["duration"]
                        daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
                        if len(daily_itinerary) < 2:
                            break
                        continue
                    if total_duration[day] + estimated_time > MAX_HOURS_PER_DAY:
                        print(f"generate_itinerary: Redistribution skipping travel (duration: {total_duration[day] + estimated_time} > {MAX_HOURS_PER_DAY})")
                        itinerary = [a for a in itinerary if a != next_activity]
                        used_activities_per_day[day].remove(curr_name)
                        total_duration[day] -= next_activity["duration"]
                        daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
                        if len(daily_itinerary) < 2:
                            break
                        continue
                    start_time, end_time = assign_time_slot(current_time, estimated_time)
                    itinerary.append({
                        "category": "Travel",
                        "cluster_id": int(cluster_id),
                        "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                        "day": int(day),
                        "distance": int(distance_km),
                        "duration": float(duration),
                        "durationUnit": duration_unit,
                        "estimatedCost": float(travel_cost),
                        "index": int(len(itinerary)),
                        "latitude": float(next_activity["latitude"]),
                        "location": f"Travel from {activity['name']} to {next_activity['name']}",
                        "longitude": float(next_activity["longitude"]),
                        "name": f"Travel to {next_activity['name']}",
                        "rating": 0.0,
                        "time_slot": f"{start_time}-{end_time}"
                    })
                    total_travel_distance[day] += distance_km
                    remaining_budget -= travel_cost
                    total_duration[day] += estimated_time
                    current_time += timedelta(hours=estimated_time)
                    print(f"generate_itinerary: Redistribution added travel: {activity['name']} to {next_activity['name']}, Distance: {distance_km} km, Duration: {duration} {duration_unit}, Cost: {travel_cost:.2f} INR")
                    i += 1
                except Exception as e:
                    print(f"generate_itinerary: Redistribution error calculating distance: {e}")
                    i += 1

        # Allow reuse of activities if no new spots are available
        if not additional_spots and len(active_days) < days:
            print(f"generate_itinerary: No additional spots, allowing activity reuse")
            for day in range(1, days + 1):
                if day in active_days:
                    continue
                cluster_id = cluster_ids[(day - 1) % len(cluster_ids)] if cluster_ids else -1
                available_activities = cluster_dict.get(cluster_id, []) + noise_activities
                available_activities = sorted(available_activities, key=lambda x: (x["score"], x["rating"]), reverse=True)
                activity_count = 0
                max_activities = 3 if cluster_id == -1 else min(5, len(available_activities))
                current_time = datetime.strptime("09:00", "%H:%M")
                print(f"generate_itinerary: Reusing for Day {day}, Cluster {cluster_id}")

                for activity in available_activities:
                    if activity_count >= max_activities or total_duration[day] >= MAX_HOURS_PER_DAY or remaining_budget <= MINIMUM_BUDGET:
                        print(f"generate_itinerary: Reuse Day {day} stopped: activities={activity_count}/{max_activities}, duration={total_duration[day]}/{MAX_HOURS_PER_DAY}, budget={remaining_budget}/{MINIMUM_BUDGET}")
                        break
                    activity_name = normalize_name(activity["activity"]["name"])
                    cost = float(activity["activity"]["estimatedCost"]) * people
                    duration = float(activity.get("duration", 2))
                    if (cost <= remaining_budget - MINIMUM_BUDGET and 
                        total_duration[day] + duration <= MAX_HOURS_PER_DAY and
                        activity_name in activity_name_to_index):
                        start_time, end_time = assign_time_slot(current_time, duration)
                        itinerary.append({
                            "category": activity["activity"]["category"],
                            "cluster_id": int(cluster_id),
                            "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                            "day": int(day),
                            "duration": float(duration),
                            "durationUnit": "hours",
                            "estimatedCost": float(cost),
                            "index": int(len(itinerary)),
                            "latitude": float(activity["activity"]["latitude"]),
                            "location": activity["activity"]["location"],
                            "longitude": float(activity["activity"]["longitude"]),
                            "name": activity["activity"]["name"],
                            "rating": float(activity["rating"]),
                            "time_slot": f"{start_time}-{end_time}"
                        })
                        used_activities_per_day[day].add(activity_name)
                        remaining_budget -= cost
                        total_duration[day] += duration
                        activity_count += 1
                        current_time += timedelta(hours=duration)
                        print(f"generate_itinerary: Reuse assigned: {activity['activity']['name']}, Cost: {cost}, Time: {start_time}-{end_time}, Budget left: {remaining_budget:.2f}")

                daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
                i = 0
                while i < len(daily_itinerary) - 1:
                    activity = daily_itinerary[i]
                    next_activity = daily_itinerary[i + 1]
                    prev_name = normalize_name(activity["name"])
                    curr_name = normalize_name(next_activity["name"])
                    try:
                        prev_idx = activity_name_to_index.get(prev_name)
                        curr_idx = activity_name_to_index.get(curr_name)
                        distance_km = distance_matrix[prev_idx][curr_idx] if prev_idx is not None and curr_idx is not None else haversine(
                            activity["longitude"], activity["latitude"],
                            next_activity["longitude"], next_activity["latitude"]
                        )
                        distance_km = round(distance_km)
                        if distance_km == 0:
                            distance_km = 1
                        if total_travel_distance[day] + distance_km > max_travel:
                            print(f"generate_itinerary: Reuse skipping travel from {activity['name']} to {next_activity['name']} (exceeds {max_travel} km)")
                            itinerary = [a for a in itinerary if a != next_activity]
                            used_activities_per_day[day].remove(curr_name)
                            total_duration[day] -= next_activity["duration"]
                            daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
                            if len(daily_itinerary) < 2:
                                break
                            continue
                        travel_cost = float(distance_km * TAXI_RATE) * people
                        estimated_time = float(distance_km / AVERAGE_SPEED)
                        duration, duration_unit = format_duration(estimated_time)
                        if travel_cost > remaining_budget - MINIMUM_BUDGET:
                            print(f"generate_itinerary: Reuse skipping travel (cost: {travel_cost:.2f} > budget: {remaining_budget-MINIMUM_BUDGET:.2f})")
                            itinerary = [a for a in itinerary if a != next_activity]
                            used_activities_per_day[day].remove(curr_name)
                            total_duration[day] -= next_activity["duration"]
                            daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
                            if len(daily_itinerary) < 2:
                                break
                            continue
                        if total_duration[day] + estimated_time > MAX_HOURS_PER_DAY:
                            print(f"generate_itinerary: Reuse skipping travel (duration: {total_duration[day] + estimated_time} > {MAX_HOURS_PER_DAY})")
                            itinerary = [a for a in itinerary if a != next_activity]
                            used_activities_per_day[day].remove(curr_name)
                            total_duration[day] -= next_activity["duration"]
                            daily_itinerary = [a for a in itinerary if a["day"] == day and a["category"] != "Travel"]
                            if len(daily_itinerary) < 2:
                                break
                            continue
                        start_time, end_time = assign_time_slot(current_time, estimated_time)
                        itinerary.append({
                            "category": "Travel",
                            "cluster_id": int(cluster_id),
                            "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                            "day": int(day),
                            "distance": int(distance_km),
                            "duration": float(duration),
                            "durationUnit": duration_unit,
                            "estimatedCost": float(travel_cost),
                            "index": int(len(itinerary)),
                            "latitude": float(next_activity["latitude"]),
                            "location": f"Travel from {activity['name']} to {next_activity['name']}",
                            "longitude": float(next_activity["longitude"]),
                            "name": f"Travel to {next_activity['name']}",
                            "rating": 0.0,
                            "time_slot": f"{start_time}-{end_time}"
                        })
                        total_travel_distance[day] += distance_km
                        remaining_budget -= travel_cost
                        total_duration[day] += estimated_time
                        current_time += timedelta(hours=estimated_time)
                        print(f"generate_itinerary: Reuse added travel: {activity['name']} to {next_activity['name']}, Distance: {distance_km} km, Duration: {duration} {duration_unit}, Cost: {travel_cost:.2f} INR")
                        i += 1
                    except Exception as e:
                        print(f"generate_itinerary: Reuse error calculating distance: {e}")
                        i += 1

        active_days = set(activity["day"] for activity in itinerary if activity["category"] != "Travel")
        attempt += 1
        if not additional_spots and len(active_days) == len(set(used_activities_per_day.keys())):
            print(f"generate_itinerary: No additional spots and all activities reused, stopping redistribution")
            break

    itinerary.sort(key=lambda x: (x["day"], x["index"]))
    print(f"generate_itinerary: Total cost: {budget - remaining_budget:.2f} INR, Remaining budget: {remaining_budget:.2f} INR")
    print(f"generate_itinerary: Active days: {active_days}, Total activities: {len([a for a in itinerary if a['category'] != 'Travel'])}")
    return convert_to_serializable({"activities": itinerary})