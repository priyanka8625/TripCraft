import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta
import json
import joblib
import os
from Similarity_Algorithm import find_similar_activities, compute_similarity, all_possible_tags

valid_time_slots = ["morning", "afternoon", "daytime"]

FEATURE_ORDER = [
    "similarity_score",
    "rating_normalized",
    "estimatedCost_normalized",
    "budget_per_person_per_day_normalized",
    "duration_normalized",
    "timeSlot_morning",
    "timeSlot_afternoon",
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
    
    # Force model retraining
    model_path = "activity_scoring_model.pkl"
    if os.path.exists(model_path):
        os.remove(model_path)
        print(f"Deleted {model_path} to force retraining")
    
    try:
        model = joblib.load(model_path)
    except FileNotFoundError:
        model, _ = train_model()
    
    activities = find_similar_activities(destination, preferences, budget, people, days)
    if not activities:
        raise ValueError("No activities found for the destination")
    
    X = preprocess_activities(activities, budget_per_person_per_day)
    print(f"Features in X: {X.columns.tolist()}")
    if X.columns.tolist() != FEATURE_ORDER:
        raise ValueError(f"Feature mismatch: Expected {FEATURE_ORDER}, got {X.columns.tolist()}")
    scores = model.predict(X)
    for i, activity in enumerate(activities):
        activity["score"] = scores[i]
    
    itinerary = []
    remaining_budget = budget
    used_slots = {i: [] for i in range(1, days + 1)}
    total_duration = {i: 0 for i in range(1, days + 1)}
    used_spots = set()
    
    # First pass: High-similarity, high-rated spots
    for day in range(1, days + 1):
        available_activities = sorted(
            [a for a in activities if a["activity"]["name"] not in used_spots],
            key=lambda x: (x["similarity_score"], x["rating"]),
            reverse=True
        )
        activity_index = 0
        while total_duration[day] < 6 and activity_index < len(available_activities):
            activity = available_activities[activity_index]["activity"]
            cost = activity["estimatedCost"] * people
            time_slot = activity["timeSlot"].lower()
            duration = available_activities[activity_index]["duration"]
            
            if time_slot in used_slots[day]:
                print(f"Time slot {time_slot} already used on day {day}, skipping {activity['name']}")
                activity_index += 1
                continue
            
            if cost <= remaining_budget and total_duration[day] + duration <= 8:
                hour = 9 if time_slot == 'morning' else 14 if time_slot == 'afternoon' else 11
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
                used_spots.add(activity["name"])
                print(f"Added activity: {activity['name']} on day {day}, cost: {cost}, timeSlot: {time_slot}, duration: {duration}, remaining_budget: {remaining_budget}")
            else:
                print(f"Skipped activity: {activity['name']} on day {day}, cost: {cost}, remaining_budget: {remaining_budget}, duration: {total_duration[day] + duration}")
            
            activity_index += 1
    
    # Second pass: Low-cost spots for underfilled days
    for day in range(1, days + 1):
        if total_duration[day] < 6:
            print(f"Day {day} underfilled (duration: {total_duration[day]}), trying low-cost spots")
            low_cost_activities = sorted(
                [a for a in activities if a["activity"]["name"] not in used_spots],
                key=lambda x: x["activity"]["estimatedCost"],
                reverse=False
            )
            activity_index = 0
            while total_duration[day] < 6 and activity_index < len(low_cost_activities):
                activity = low_cost_activities[activity_index]["activity"]
                cost = activity["estimatedCost"] * people
                time_slot = activity["timeSlot"].lower()
                duration = low_cost_activities[activity_index]["duration"]
                
                if time_slot in used_slots[day]:
                    print(f"Time slot {time_slot} already used on day {day}, skipping {activity['name']}")
                    activity_index += 1
                    continue
                
                if cost <= remaining_budget and total_duration[day] + duration <= 8:
                    hour = 9 if time_slot == 'morning' else 14 if time_slot == 'afternoon' else 11
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
                    used_spots.add(activity["name"])
                    print(f"Added low-cost activity: {activity['name']} on day {day}, cost: {cost}, timeSlot: {time_slot}, duration: {duration}, remaining_budget: {remaining_budget}")
                else:
                    print(f"Skipped low-cost activity: {activity['name']} on day {day}, cost: {cost}, remaining_budget: {remaining_budget}, duration: {total_duration[day] + duration}")
                
                activity_index += 1
    
    # Redistribution: Move excess activities to empty days
    activities_per_day = {i: [] for i in range(1, days + 1)}
    for activity in itinerary:
        activities_per_day[activity["day"]].append(activity)
    
    for day in range(1, days + 1):
        if len(activities_per_day[day]) > 3:
            excess = activities_per_day[day][3:]
            activities_per_day[day] = activities_per_day[day][:3]
            print(f"Day {day} has {len(excess)} excess activities, redistributing")
            for excess_activity in excess:
                used_spots.remove(excess_activity["name"])
                used_slots[day].remove(excess_activity["timeSlot"])
                total_duration[day] -= [a["duration"] for a in activities if a["activity"]["name"] == excess_activity["name"]][0]
                remaining_budget += excess_activity["estimatedCost"]
            
            for excess_activity in excess:
                for target_day in range(1, days + 1):
                    if len(activities_per_day[target_day]) < 2 and total_duration[target_day] < 6:
                        time_slot = excess_activity["timeSlot"]
                        if time_slot in used_slots[target_day]:
                            available_slots = [ts for ts in valid_time_slots if ts not in used_slots[target_day]]
                            time_slot = available_slots[0] if available_slots else time_slot
                        duration = [a["duration"] for a in activities if a["activity"]["name"] == excess_activity["name"]][0]
                        if total_duration[target_day] + duration <= 8:
                            hour = 9 if time_slot == 'morning' else 14 if time_slot == 'afternoon' else 11
                            new_activity = {
                                "date": (start_date + timedelta(days=target_day-1)).strftime(f"%a, %d %b %Y {hour:02d}:00:00 GMT"),
                                "day": target_day,
                                "estimatedCost": excess_activity["estimatedCost"],
                                "location": excess_activity["location"],
                                "name": excess_activity["name"],
                                "timeSlot": time_slot
                            }
                            activities_per_day[target_day].append(new_activity)
                            used_slots[target_day].append(time_slot)
                            total_duration[target_day] += duration
                            used_spots.add(new_activity["name"])
                            remaining_budget -= new_activity["estimatedCost"]
                            print(f"Redistributed {new_activity['name']} to day {target_day}, timeSlot: {time_slot}")
                            break
    
    # Flatten itinerary
    itinerary = []
    for day in range(1, days + 1):
        itinerary.extend(activities_per_day[day])
    
    # Check budget
    total_cost = sum(activity["estimatedCost"] for activity in itinerary)
    if total_cost > budget:
        overshoot = total_cost - budget
        if overshoot > budget * 0.1:  # Significant overshoot (>10%)
            print(f"Budget overshoot ({total_cost} > {budget}), reducing spots")
            new_itinerary = []
            remaining_budget = budget
            for day in range(1, days + 1):
                day_activities = sorted(activities_per_day[day], key=lambda x: x["estimatedCost"])
                added = 0
                for activity in day_activities[:2]:  # Limit to 2 spots if overshoot
                    if activity["estimatedCost"] <= remaining_budget:
                        new_itinerary.append(activity)
                        remaining_budget -= activity["estimatedCost"]
                        added += 1
                if added == 0:
                    print(f"No activities added for day {day} due to budget constraints")
            itinerary = new_itinerary
            total_cost = sum(activity["estimatedCost"] for activity in itinerary)
        else:
            print(f"Minor budget overshoot ({total_cost} > {budget}), proceeding")
    
    return {"activities": sorted(itinerary, key=lambda x: (x["day"], x["date"]))}

if __name__ == "__main__":
    pass
