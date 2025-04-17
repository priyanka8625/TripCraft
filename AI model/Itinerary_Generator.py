import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
import json
import joblib
from Similarity_Algorithm import find_similar_activities, compute_similarity, all_possible_tags

# Valid time slots
valid_time_slots = ["morning", "afternoon", "evening", "daytime"]

# Define feature order explicitly
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

# Simulate training data
def generate_training_data():
    data = []
    max_cost = 100
    max_budget = 166
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
    print("Training feature names (before dropping relevance_score):", df.columns.tolist())
    return df

# Train model
def train_model():
    data = generate_training_data()
    X = data.drop("relevance_score", axis=1)
    y = data["relevance_score"]
    
    # Ensure feature order
    X = X[FEATURE_ORDER]
    print("Training feature names (after ordering):", X.columns.tolist())
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, "activity_scoring_model.pkl")
    return model, FEATURE_ORDER

# Preprocess activities for scoring
def preprocess_activities(activities, budget_per_person_per_day):
    data = []
    max_cost = 100
    max_budget = 166
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
    # Ensure correct feature order
    df = df[FEATURE_ORDER]
    print("Prediction feature names:", df.columns.tolist())
    return df

# Generate itinerary
def generate_itinerary(user_input):
    # Extract input
    start_date = datetime.strptime(user_input["startDate"], "%Y-%m-%d")
    end_date = datetime.strptime(user_input["endDate"], "%Y-%m-%d")
    days = (end_date - start_date).days + 1  # Inclusive of start and end dates
    people = user_input["people"]
    budget = user_input["budget"]
    destination = user_input["destination"]
    # Handle missing or empty preferences
    preferences = user_input.get("preferences", [])
    
    # Validate input
    if days < 1:
        raise ValueError("End date must be on or after start date")
    if people < 1:
        raise ValueError("Number of people must be at least 1")
    if budget < 0:
        raise ValueError("Budget cannot be negative")
    
    # Calculate budget per person per day
    budget_per_person_per_day = budget / people / days
    
    # Load or train model
    try:
        model = joblib.load("activity_scoring_model.pkl")
    except FileNotFoundError:
        model, _ = train_model()
    
    # Fetch activities
    activities = find_similar_activities(destination, preferences, budget, people, days)
    if not activities:
        raise ValueError("No activities found for the destination")
    
    # Score activities
    X = preprocess_activities(activities, budget_per_person_per_day)
    # Validate feature names
    if X.columns.tolist() != FEATURE_ORDER:
        raise ValueError(f"Feature mismatch: Expected {FEATURE_ORDER}, got {X.columns.tolist()}")
    scores = model.predict(X)
    for i, activity in enumerate(activities):
        activity["score"] = scores[i]
    
    # Sort by score
    activities.sort(key=lambda x: x["score"], reverse=True)
    
    # Initialize itinerary
    itinerary = []
    remaining_budget = budget
    used_slots = {i: [] for i in range(1, days + 1)}
    total_duration = {i: 0 for i in range(1, days + 1)}
    
    # Add arrival
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
    
    # Add activities for days 2 to N-1
    activity_index = 0
    for day in range(2, days):
        while total_duration[day] < 6 and activity_index < len(activities):  # Target 6-8 hours
            activity = activities[activity_index]["activity"]
            cost = activity["estimatedCost"] * people
            time_slot = activity["timeSlot"].lower()
            duration = activities[activity_index]["duration"]
            
            if (cost <= remaining_budget and 
                time_slot not in used_slots[day] and 
                total_duration[day] + duration <= 8):
                itinerary.append({
                    "date": (start_date + timedelta(days=day-1)).strftime("%a, %d %b %Y 18:30:00 GMT"),
                    "day": day,
                    "estimatedCost": cost,
                    "location": activity["location"],
                    "name": activity["name"],
                    "timeSlot": time_slot
                })
                remaining_budget -= cost
                used_slots[day].append(time_slot)
                total_duration[day] += duration
            
            activity_index += 1
    
    # Add departure
    itinerary.append({
        "date": end_date.strftime("%a, %d %b %Y 18:30:00 GMT"),
        "day": days,
        "estimatedCost": 0,
        "location": destination,
        "name": f"Departure from {city}",
        "timeSlot": "morning"
    })
    
    # Validate itinerary
    total_cost = sum(activity["estimatedCost"] for activity in itinerary)
    if total_cost > budget:
        raise ValueError("Itinerary exceeds budget")
    
    return {"activities": itinerary}



if __name__ == "__main__":
    main()
