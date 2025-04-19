import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
import json
import joblib
from Similarity_Algorithm import find_similar_activities, compute_similarity, all_possible_tags

valid_time_slots = ["morning", "afternoon", "evening", "daytime"]

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
        score = 0.9 if sim_score > 0.7 and cost < budget_per_person_per_day and 4 <= duration <= 8 else 0.2
        
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
    
    df = pd.DataFrame(data)
    return df

def train_model():
    data = generate_training_data()
    X = data.drop("relevance_score", axis=1)
    y = data["relevance_score"]
    
    X = X[FEATURE_ORDER]
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
        
        record = {
            "similarity_score": activity["similarity_score"],
            "rating_normalized": activity["rating"] / 5,
            "estimatedCost_normalized": activity["activity"]["estimatedCost"] / max_cost,
            "budget_per_person_per_day_normalized": budget_per_person_per_day / max_budget,
            "duration_normalized": activity["duration"] / max_duration
        }
        for ts in valid_time_slots:
            record[f"timeSlot_{ts}"] = 1 if ts == time_slot else 0
        data.append(record)
    
    df = pd.DataFrame(data)
    df = df[FEATURE_ORDER]
    return df

def generate_itinerary(user_input):
    start_date = datetime.strptime(user_input["startDate"], "%Y-%m-%d")
    end_date = datetime.strptime(user_input["endDate"], "%Y-%m-%d")
    days = (end_date - start_date).days + 1
    people = user_input["people"]
    budget = user_input["budget"]
    destination = user_input["destination"]
    preferences = user_input.get("preferences", [])
    
    if days < 1:
        raise ValueError("End date must be on or after start date")
    if people < 1:
        raise ValueError("Number of people must be at least 1")
    if budget < 0:
        raise ValueError("Budget cannot be negative")
    
    budget_per_person_per_day = budget / people / days
    budget_per_person = budget / people
    
    try:
        model = joblib.load("activity_scoring_model.pkl")
    except FileNotFoundError:
        model, _ = train_model()
    
    activities = find_similar_activities(destination, preferences, budget, people, days)
    if not activities:
        raise ValueError("No activities found for the destination")
    
    X = preprocess_activities(activities, budget_per_person_per_day)
    if X.columns.tolist() != FEATURE_ORDER:
        raise ValueError(f"Feature mismatch: Expected {FEATURE_ORDER}, got {X.columns.tolist()}")
    scores = model.predict(X)
    for i, activity in enumerate(activities):
        activity["score"] = scores[i]
    
    itinerary = []
    remaining_budget = budget
    used_slots = {i: [] for i in range(1, days + 1)}
    total_duration = {i: 0 for i in range(1, days + 1)}
    
    city = destination.split(',')[0]
    itinerary.append({
        "date": start_date.strftime("%a, %d %b %Y 18:30:00 GMT"),
        "day": 1,
        "estimatedCost": 0,
        "location": destination,
        "name": f"Arrival in {city}",
        "timeSlot": "afternoon"
    })
    used_slots[1].append("afternoon")
    
    for day in range(2, days):
        available_activities = sorted(
            activities,
            key=lambda x: (x["score"], -sum(1 for i in itinerary if i["name"] == x["activity"]["name"])),
            reverse=True
        )
        activity_index = 0
        while total_duration[day] < 6 and activity_index < len(available_activities):
            activity = available_activities[activity_index]["activity"]
            cost = activity["estimatedCost"] * people
            time_slot = activity["timeSlot"].lower()
            duration = available_activities[activity_index]["duration"]
            
            if cost <= remaining_budget and total_duration[day] + duration <= 8:
                hour = 9 if time_slot == 'morning' else 14 if time_slot == 'afternoon' else 18 if time_slot == 'evening' else 11
                itinerary.append({
                    "date": (start_date + timedelta(days=day-1)).strftime(f"%a, %d %b %Y {hour:02d}:00:00 GMT"),
                    "day": day,
                    "estimatedCost": cost,
                    "location": activity["location"],
                    "name": activity["name"],
                    "timeSlot": time_slot
                })
                remaining_budget -= cost
                used_slots[day].append(time_slot)
                total_duration[day] += duration
                print(f"Added activity: {activity['name']} on day {day}, cost: {cost}, timeSlot: {time_slot}, duration: {duration}, remaining_budget: {remaining_budget}")
            else:
                print(f"Skipped activity: {activity['name']} on day {day}, cost: {cost}, remaining_budget: {remaining_budget}, duration: {total_duration[day] + duration}")
            
            activity_index += 1
    
    itinerary.append({
        "startDate": end_date.strftime("%Y-%m-%d"),
        "day": days,
        "estimatedCost": 0,
        "location": destination,
        "name": f"Departure from {city}",
        "timeSlot": "morning"
    })
    
    total_cost = sum(activity["estimatedCost"] for activity in itinerary)
    if total_cost > budget:
        raise ValueError("Itinerary exceeds budget")
    
    return {"activities": itinerary}

if __name__ == "__main__":
    pass
