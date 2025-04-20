import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
import joblib
from Similarity_Algorithm import find_similar_activities, compute_similarity, all_possible_tags, fetch_low_cost_activities
import time

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

def train_model():
    data = generate_training_data()
    X = data.drop("relevance_score", axis=1)[FEATURE_ORDER]
    y = data["relevance_score"]
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    joblib.dump(model, "activity_scoring_model.pkl")
    return model, FEATURE_ORDER

def preprocess_activities(activities, budget_per_person_per_day):
    data = []
    max_cost = 1000
    max_budget = 1000
    max_duration = 8
    for activity in activities:
        time_slot = activity["activity"]["timeSlot"].lower()
        if time_slot not in valid_time_slots:
            time_slot = "daytime"
        cost = activity["activity"]["estimatedCost"]
        if not isinstance(cost, (int, float)):
            print(f"Invalid estimatedCost for {activity['activity']['name']}: {cost}, Type: {type(cost)}. Converting to float.")
            try:
                cost = float(cost)
            except (ValueError, TypeError):
                cost = 10.0
        activity["activity"]["estimatedCost"] = cost
        record = {
            "similarity_score": activity["similarity_score"],
            "rating_normalized": activity["rating"] / 5,
            "estimatedCost_normalized": cost / max_cost,
            "budget_per_person_per_day_normalized": budget_per_person_per_day / max_budget,
            "duration_normalized": activity["duration"] / max_duration
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
    city = destination.split(',')[0].strip()

    itinerary.append({
        "category": "Travel",
        "date": start_date.strftime("%Y-%m-%d"),
        "day": 1,
        "estimatedCost": 0,
        "latitude": 0,
        "longitude": 0,
        "location": destination,
        "name": f"Arrival in {city}",
        "rating": 0,
        "timeSlot": "afternoon"
    })

    start_time = time.time()
    activity_index = 0
    active_days = days - 2
    activities_per_day = max(2, min(3, len(activities) // max(1, active_days)))
    print(f"Activities per day: {activities_per_day}")
    for day in range(2, days):
        daily_activities = 0
        while (daily_activities < activities_per_day and 
               activity_index < len(activities) and 
               total_duration[day] < 12):
            activity = activities[activity_index]["activity"]
            cost = activity["estimatedCost"]
            print(f"Processing activity: {activity['name']}, People: {people}, Type: {type(people)}, estimatedCost: {cost}, Type: {type(cost)}, Remaining budget: {remaining_budget}, Duration so far: {total_duration[day]}")
            total_cost = cost * people
            time_slot = activity["timeSlot"].lower()
            duration = activities[activity_index]["duration"]
            if total_cost <= remaining_budget and total_duration[day] + duration <= 12:
                itinerary.append({
                    "category": activity.get("category", "Activity"),
                    "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                    "day": day,
                    "estimatedCost": total_cost,
                    "latitude": activity.get("latitude", 0),
                    "longitude": activity.get("longitude", 0),
                    "location": activity["location"],
                    "name": activity["name"],
                    "rating": activities[activity_index]["rating"],
                    "timeSlot": time_slot
                })
                remaining_budget -= total_cost
                total_duration[day] += duration
                daily_activities += 1
                print(f"Assigned activity: {activity['name']}, Cost: {total_cost}, Day: {day}, TimeSlot: {time_slot}")
            else:
                print(f"Skipped activity: {activity['name']}, Cost: {total_cost}, Duration: {duration}, Budget OK: {total_cost <= remaining_budget}, Duration OK: {total_duration[day] + duration <= 12}")
            activity_index += 1
        if daily_activities == 0:
            itinerary.append({
                "category": "Free Time",
                "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                "day": day,
                "estimatedCost": 0,
                "latitude": 0,
                "longitude": 0,
                "location": destination,
                "name": "Free day to explore or relax",
                "rating": 0,
                "timeSlot": "daytime"
            })
            print(f"Added Free Time for day {day}")
    print(f"Initial assignment completed in {time.time() - start_time:.2f} seconds, Assigned activities: {len([a for a in itinerary if a['category'] != 'Travel'])}")

    start_time = time.time()
    active_days = set(activity["day"] for activity in itinerary if activity["category"] != "Travel")
    print(f"Active days after initial assignment: {len(active_days)}")
    if len(active_days) < days - 2:
        print("Redistributing activities due to insufficient active days")
        itinerary = [activity for activity in itinerary if activity["category"] == "Travel"]
        total_duration = {i: 0 for i in range(1, days + 1)}
        all_activities = activities[:]
        required_activities = max(10, (days - 2) * activities_per_day)
        if len(all_activities) < required_activities:
            additional_spots = fetch_low_cost_activities(destination, remaining_budget, people, required_activities - len(all_activities))
            all_activities.extend(additional_spots)
        
        activity_idx = 0
        for day in range(2, days):
            daily_activities = 0
            while (daily_activities < activities_per_day and 
                   activity_idx < len(all_activities) and 
                   total_duration[day] < 12):
                activity = all_activities[activity_idx]["activity"]
                cost = activity["estimatedCost"]
                print(f"Redistribution activity: {activity['name']}, People: {people}, Type: {type(people)}, estimatedCost: {cost}, Type: {type(cost)}, Remaining budget: {remaining_budget}, Duration so far: {total_duration[day]}")
                total_cost = cost * people
                time_slot = activity["timeSlot"].lower()
                duration = all_activities[activity_idx]["duration"]
                if total_cost <= remaining_budget and total_duration[day] + duration <= 12:
                    itinerary.append({
                        "category": activity.get("category", "Activity"),
                        "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                        "day": day,
                        "estimatedCost": total_cost,
                        "latitude": activity.get("latitude", 0),
                        "longitude": activity.get("longitude", 0),
                        "location": activity["location"],
                        "name": activity["name"],
                        "rating": all_activities[activity_idx]["rating"],
                        "timeSlot": time_slot
                    })
                    remaining_budget -= total_cost
                    total_duration[day] += duration
                    daily_activities += 1
                    print(f"Redistribution assigned: {activity['name']}, Cost: {total_cost}, Day: {day}, TimeSlot: {time_slot}")
                else:
                    print(f"Redistribution skipped: {activity['name']}, Cost: {total_cost}, Duration: {duration}, Budget OK: {total_cost <= remaining_budget}, Duration OK: {total_duration[day] + duration <= 12}")
                activity_idx += 1
            if daily_activities == 0:
                itinerary.append({
                    "category": "Free Time",
                    "date": (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d"),
                    "day": day,
                    "estimatedCost": 0,
                    "latitude": 0,
                    "longitude": 0,
                    "location": destination,
                    "name": "Free day to explore or relax",
                    "rating": 0,
                    "timeSlot": "daytime"
                })
                print(f"Added Free Time for day {day}")
    print(f"Redistribution completed in {time.time() - start_time:.2f} seconds, Final activities: {len([a for a in itinerary if a['category'] != 'Travel'])}")

    itinerary.append({
        "category": "Travel",
        "date": end_date.strftime("%Y-%m-%d"),
        "day": days,
        "estimatedCost": 0,
        "latitude": 0,
        "longitude": 0,
        "location": destination,
        "name": f"Departure from {city}",
        "rating": 0,
        "timeSlot": "morning"
    })

    start_time = time.time()
    time_slot_order = {"morning": 1, "afternoon": 2, "daytime": 3, "evening": 4}
    itinerary.sort(key=lambda x: (x["day"], time_slot_order.get(x["timeSlot"], 3)))
    print(f"Itinerary sorted in {time.time() - start_time:.2f} seconds")

    total_cost = sum(activity["estimatedCost"] for activity in itinerary)
    if total_cost > budget:
        raise ValueError(f"Itinerary exceeds budget: Total cost {total_cost} > {budget}")

    print(f"Final itinerary: {len(itinerary)} activities, Total cost: {total_cost}")
    return {"activities": itinerary}
