import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
import joblib
import os
from Similarity_Algorithm import find_similar_activities, compute_similarity, all_possible_tags, fetch_low_cost_activities
import time
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

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

def generate_itinerary(user_input):
    try:
        start_time = time.time()
        required_fields = ["startDate", "endDate", "people", "budget", "destination"]
        for field in required_fields:
            if field not in user_input:
                raise ValueError(f"Missing required field: {field}")
        
        start_date = datetime.strptime(user_input["startDate"], "%Y-%m-%d")
        end_date = datetime.strptime(user_input["endDate"], "%Y-%m-%d")
        people = user_input["people"]
        print(f"Before validation - People: {people}, Type: {type(people)}")
        if not isinstance(people, int) or people < 1:
            try:
                people = int(people)
                if people < 1:
                    raise ValueError
            except (ValueError, TypeError):
                raise ValueError("Invalid 'people' value; must be a positive integer")
        budget = user_input["budget"]
        try:
            budget = float(budget)
            if budget < 0:
                raise ValueError
        except (ValueError, TypeError):
            raise ValueError("Invalid 'budget' value; must be a non-negative number")
        destination = str(user_input["destination"]).strip()
        if not destination:
            raise ValueError("Destination cannot be empty")
        preferences = user_input.get("preferences", [])
        if not isinstance(preferences, list):
            raise ValueError("Preferences must be a list")
        print(f"Validated people: {people}, Type: {type(people)}, Input processing completed in {time.time() - start_time:.2f} seconds")
    except Exception as e:
        raise ValueError(f"Invalid user input: {str(e)}")

    days = (end_date - start_date).days + 1
    if days < 1:
        raise ValueError("End date must be on or after start date")

    budget_per_person_per_day = budget / people / days
    print(f"Budget per person per day: {budget_per_person_per_day}")

    try:
        start_time = time.time()
        model = joblib.load("activity_scoring_model.pkl")
        print(f"Model loaded in {time.time() - start_time:.2f} seconds")
    except FileNotFoundError:
        print("Training model...")
        start_time = time.time()
        model, _ = train_model()
        print(f"Model trained in {time.time() - start_time:.2f} seconds")

    start_time = time.time()
    activities = find_similar_activities(destination, preferences, budget, people, days)
    print(f"Activities fetched: {len(activities)} in {time.time() - start_time:.2f} seconds")
    if not activities:
        raise ValueError("No activities found for the destination")

    start_time = time.time()
    X = preprocess_activities(activities, budget_per_person_per_day)
    scores = model.predict(X)
    for i, activity in enumerate(activities):
        activity["score"] = scores[i]
        print(f"Scored activity: {activity['activity']['name']}, Score: {scores[i]:.3f}, Similarity: {activity['similarity_score']:.3f}")
    activities.sort(key=lambda x: x["score"], reverse=True)
    print(f"Activities scored in {time.time() - start_time:.2f} seconds")

    itinerary = []
    remaining_budget = budget
    total_duration = {i: 0 for i in range(1, days + 1)}
    used_activities = set()  # Track all used activities across all days
    used_activities_per_day = {i: set() for i in range(1, days + 1)}  # Track used activities per day

    # Initial assignment
    start_time = time.time()
    activity_index = 0
    activities_per_day = max(2, min(4, len(activities) // max(1, days)))  # Cap at 4 activities per day
    print(f"Initial activities per day: {activities_per_day}")
    for day in range(1, days + 1):
        daily_activities = 0
        while (daily_activities < activities_per_day and 
               activity_index < len(activities) and 
               total_duration[day] < 12 and
               remaining_budget > 0):
            activity = activities[activity_index]["activity"]
            activity_name = activity["name"]
            cost = activity["estimatedCost"]
            print(f"Processing activity: {activity['name']}, People: {people}, Type: {type(people)}, estimatedCost: {cost}, Type: {type(cost)}, Remaining budget: {remaining_budget}, Duration so far: {total_duration[day]}")
            total_cost = cost * people
            time_slot = activity["timeSlot"].lower()
            duration = activities[activity_index].get("duration", 2)
            if (activity_name not in used_activities_per_day[day] and 
                activity_name not in used_activities and 
                total_cost <= remaining_budget and 
                total_duration[day] + duration <= 12):
                itinerary.append({
                    "category": activity.get("category", "Activity"),
                    "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                    "day": day,
                    "duration": duration,
                    "estimatedCost": total_cost,
                    "latitude": activity.get("latitude", 0),
                    "longitude": activity.get("longitude", 0),
                    "location": activity["location"],
                    "name": activity["name"],
                    "rating": activities[activity_index]["rating"],
                    "timeSlot": time_slot
                })
                used_activities_per_day[day].add(activity_name)
                used_activities.add(activity_name)
                remaining_budget -= total_cost
                total_duration[day] += duration
                daily_activities += 1
                print(f"Assigned activity: {activity['name']}, Cost: {total_cost}, Day: {day}, TimeSlot: {time_slot}")
            else:
                print(f"Skipped activity: {activity['name']}, Cost: {total_cost}, Duration: {duration}, Budget OK: {total_cost <= remaining_budget}, Duration OK: {total_duration[day] + duration <= 12}, Already Used: {activity_name in used_activities_per_day[day] or activity_name in used_activities}")
            activity_index += 1

    # Redistribution to fill all days with no free time
    start_time = time.time()
    active_days = set(activity["day"] for activity in itinerary if activity["category"] != "Free Time")
    print(f"Active days after initial assignment: {len(active_days)}")
    all_activities = activities[:]
    max_redistribution_attempts = 5  # Prevent infinite loop
    attempt = 0
    while (len(active_days) < days or any(total_duration[day] < 12 for day in range(1, days + 1))) and attempt < max_redistribution_attempts:
        print(f"Redistributing activities to fill all days with no free time (Attempt {attempt + 1}/{max_redistribution_attempts})")
        # Fetch more activities if needed
        required_activities = sum(1 for day in range(1, days + 1) if total_duration[day] < 12)
        if len(all_activities) < len(activities) + required_activities:
            additional_spots = fetch_low_cost_activities(destination, remaining_budget, people, required_activities * 2)  # Double the request to ensure variety
            if additional_spots:
                for spot in additional_spots:
                    if "duration" not in spot:
                        spot["duration"] = 2
                all_activities.extend(additional_spots)
                X = preprocess_activities(all_activities, budget_per_person_per_day)
                scores = model.predict(X)
                for i, activity in enumerate(all_activities):
                    activity["score"] = scores[i]
                all_activities.sort(key=lambda x: x["score"], reverse=True)
            else:
                print("Warning: No additional activities fetched. Redistribution may fail.")
                break

        activity_idx = 0
        for day in range(1, days + 1):
            if total_duration[day] < 12:
                daily_activities = sum(1 for a in itinerary if a["day"] == day and a["category"] != "Free Time")
                while (total_duration[day] < 12 and 
                       activity_idx < len(all_activities) and 
                       remaining_budget > 0):
                    activity = all_activities[activity_idx]["activity"]
                    activity_name = activity["name"]
                    cost = activity["estimatedCost"]
                    total_cost = cost * people
                    time_slot = activity["timeSlot"].lower()
                    duration = all_activities[activity_idx].get("duration", 2)
                    if (activity_name not in used_activities_per_day[day] and 
                        activity_name not in used_activities and 
                        total_cost <= remaining_budget and 
                        total_duration[day] + duration <= 12):
                        itinerary.append({
                            "category": activity.get("category", "Activity"),
                            "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                            "day": day,
                            "duration": duration,
                            "estimatedCost": total_cost,
                            "latitude": activity.get("latitude", 0),
                            "longitude": activity.get("longitude", 0),
                            "location": activity["location"],
                            "name": activity["name"],
                            "rating": all_activities[activity_idx]["rating"],
                            "timeSlot": time_slot
                        })
                        used_activities_per_day[day].add(activity_name)
                        used_activities.add(activity_name)
                        remaining_budget -= total_cost
                        total_duration[day] += duration
                        daily_activities += 1
                        print(f"Redistribution assigned: {activity['name']}, Cost: {total_cost}, Day: {day}, TimeSlot: {time_slot}")
                    else:
                        print(f"Redistribution skipped: {activity['name']}, Cost: {total_cost}, Duration: {duration}, Budget OK: {total_cost <= remaining_budget}, Duration OK: {total_duration[day] + duration <= 12}, Already Used: {activity_name in used_activities_per_day[day] or activity_name in used_activities}")
                    activity_idx += 1
        active_days = set(activity["day"] for activity in itinerary if activity["category"] != "Free Time")
        attempt += 1
    print(f"Redistribution completed in {time.time() - start_time:.2f} seconds, Final activities: {len([a for a in itinerary if a['category'] != 'Free Time'])}")

    start_time = time.time()
    time_slot_order = {"morning": 1, "afternoon": 2, "daytime": 3, "evening": 4}
    itinerary.sort(key=lambda x: (x["day"], time_slot_order.get(x["timeSlot"], 3)))
    print(f"Itinerary sorted in {time.time() - start_time:.2f} seconds")

    total_cost = sum(activity["estimatedCost"] for activity in itinerary)
    if total_cost > budget:
        raise ValueError(f"Itinerary exceeds budget: Total cost {total_cost} > {budget}")

    print(f"Final itinerary: {len(itinerary)} activities, Total cost: {total_cost}")
    return {"activities": itinerary}






















#Training the model and checking the accuracy:-------
def train_model():
    if os.path.exists("activity_scoring_model.pkl"):
        os.remove("activity_scoring_model.pkl")
    data = generate_training_data()
    X = data.drop("relevance_score", axis=1)[FEATURE_ORDER]
    y = data["relevance_score"]

    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("📊 Model Evaluation:")
    print(f"Mean Squared Error (MSE): {mse:.4f}")
    print(f"Mean Absolute Error (MAE): {mae:.4f}")
    print(f"R² Score: {r2:.4f}")

    joblib.dump(model, "activity_scoring_model.pkl")
    print("✅ Model saved as activity_scoring_model.pkl")
    return model, FEATURE_ORDER