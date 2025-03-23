import requests
from datetime import timedelta, datetime

# OpenStreetMap APIs
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL = "http://overpass-api.de/api/interpreter"

def get_location_coordinates(destination):
    """Fetch latitude and longitude for a given destination using Nominatim."""
    params = {
        "q": destination,
        "format": "json",
        "addressdetails": 1,
        "limit": 1
    }

    headers = {
        "User-Agent": "TripCraft/1.0 (contact: pam1010005@gmail.com)"  # Replace with your app name and contact info
    }
    
    response = requests.get(NOMINATIM_URL, params=params, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if data:
            return float(data[0]['lat']), float(data[0]['lon'])
        else:
            print(f"No coordinates found for destination '{destination}'")
            return None, None
    else:
        print(f"Error fetching coordinates: {response.status_code}")
        return None, None


def get_pois_with_thumbnails(latitude, longitude):
    """Fetch POIs and thumbnails near the given coordinates using Overpass API."""
    overpass_query = f"""
    [out:json];
    (
      node["amenity"](around:2000,{latitude},{longitude});
      way["amenity"](around:2000,{latitude},{longitude});
      relation["amenity"](around:2000,{latitude},{longitude});
    );
    out body;
    """
    
    response = requests.post(OVERPASS_URL, data=overpass_query)
    
    if response.status_code == 200:
        data = response.json()
        pois = []
        
        for element in data['elements']:
            poi = {
                'name': element.get('tags', {}).get('name', 'Unknown'),
                'type': element.get('tags', {}).get('amenity', 'Unknown'),
                'image': element.get('tags', {}).get('image', None)  # Fetch image URL if available
            }
            pois.append(poi)
        
        return pois
    else:
        print(f"Error fetching POIs: {response.json()}")
        return []


def generate_itinerary_with_thumbnails(start_date, days, destination):
    """Generate a day-wise travel itinerary with thumbnails."""
    itinerary = {}
    
    # Get coordinates of the destination
    latitude, longitude = get_location_coordinates(destination)
    
    if latitude is None or longitude is None:
        print(f"Failed to fetch coordinates for destination '{destination}'")
        return None
    
    # Fetch POIs near the destination
    pois = get_pois_with_thumbnails(latitude, longitude)
    
    if not pois:
        print(f"No POIs found for destination '{destination}'")
        return None
    
    # Generate itinerary
    current_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
    
    for day in range(1, days + 1):
        day_plan = {
            'date': current_date_obj.strftime("%Y-%m-%d"),
            'activities': []
        }
        
        # Select up to 3 POIs per day
        daily_pois = pois[(day - 1) * 3: day * 3]
        
        for poi in daily_pois:
            poi_data = {
                'name': poi['name'],
                'type': poi['type'],
                'image': poi['image'] if poi['image'] else "No image available"
            }
            day_plan['activities'].append(poi_data)
        
        itinerary[f"Day {day}"] = day_plan
        current_date_obj += timedelta(days=1)
    
    return itinerary


# Example Usage
if __name__ == "__main__":
    start_date = input("Enter start date (YYYY-MM-DD): ")
    days = int(input("Enter number of days for the trip: "))
    destination = input("Enter destination city (e.g., Paris): ")
    
    itinerary_result = generate_itinerary_with_thumbnails(start_date, days, destination)
    
    if itinerary_result:
        for day, details in itinerary_result.items():
            print(f"{day}: {details}")
            
            for activity in details['activities']:
                print(f" - {activity['name']} ({activity['type']})")
                print(f"   Thumbnail: {activity['image']}")
                
            print("\n")
