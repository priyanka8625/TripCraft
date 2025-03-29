import requests
from datetime import timedelta, datetime
import os
from dotenv import load_dotenv
import time

# Load environment variables from .env file
load_dotenv()

# Access the variables using os.getenv()
AMADEUS_API_KEY = os.getenv("AMADEUS_API_KEY")
AMADEUS_API_SECRET = os.getenv("AMADEUS_API_SECRET")
UNSPLASH_KEY = os.getenv("UNSPLASH_KEY")
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")

# Example usage
print(f"Amadeus API Key: {AMADEUS_API_KEY}")
print(f"Unsplash Key: {UNSPLASH_KEY}")

# API Limits
AMADEUS_DAILY_LIMIT = 100  # Amadeus: 3000/month ≈ 100/day
UNSPLASH_HOURLY_LIMIT = 50  # Unsplash: 50 requests/hour

# API Call Counters
amadeus_calls_today = 0
unsplash_calls_this_hour = 0

# Track the current date and hour for rate limit resets
current_date = datetime.now().date()
current_hour = datetime.now().hour


class APILimitError(Exception):
    """Custom exception for API limit reached."""
    pass


def reset_api_counters():
    """Resets counters for daily and hourly API limits."""
    global amadeus_calls_today, unsplash_calls_this_hour, current_date, current_hour
    now = datetime.now()
    
    # Reset daily counters if the date has changed
    if now.date() != current_date:
        amadeus_calls_today = 0
        current_date = now.date()
    
    # Reset hourly counters if the hour has changed
    if now.hour != current_hour:
        unsplash_calls_this_hour = 0
        current_hour = now.hour


def get_amadeus_token():
    """Fetches the access token from Amadeus API."""
    global amadeus_calls_today
    
    # Check Amadeus daily limit
    if amadeus_calls_today >= AMADEUS_DAILY_LIMIT:
        raise APILimitError("Amadeus API daily limit reached.")

    url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": AMADEUS_API_KEY,
        "client_secret": AMADEUS_API_SECRET
    }
    
    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        raise Exception(f"Failed to fetch Amadeus token: {response.json()}")


def get_location_coordinates(destination):
    """Fetches latitude and longitude for a given destination."""
    token = get_amadeus_token()
    
    url = "https://test.api.amadeus.com/v1/reference-data/locations"
    params = {'keyword': destination, 'subType': 'CITY'}  # Specify subType as CITY
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        if data['data']:
            location_data = data['data'][0]
            latitude = location_data['geoCode']['latitude']
            longitude = location_data['geoCode']['longitude']
            return latitude, longitude
        
        print(f"No location found for destination '{destination}'")
        return None, None
    
    raise Exception(f"Failed to fetch location coordinates: {response.json()}")


def get_unsplash_image(query):
    """
    Fetches an image URL from Unsplash API.
    """
    global unsplash_calls_this_hour
    
    # Check Unsplash hourly limit
    reset_api_counters()
    
    if unsplash_calls_this_hour >= UNSPLASH_HOURLY_LIMIT:
        raise APILimitError("Unsplash API hourly limit reached.")
    
    url = f"https://api.unsplash.com/search/photos?query={query}&client_id={UNSPLASH_KEY}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        unsplash_calls_this_hour += 1
        results = response.json().get('results', [])
        return results[0].get('urls', {}).get('small') if results else None
    else:
        raise Exception(f"Failed to fetch image from Unsplash: {response.json()}")


def get_amadeus_pois(latitude, longitude):
    """Fetches Points of Interest (POIs) from Amadeus API using latitude and longitude."""
    global amadeus_calls_today
    
    # Check Amadeus daily limit
    if amadeus_calls_today >= AMADEUS_DAILY_LIMIT:
        raise APILimitError("Amadeus API daily limit reached.")
    
    reset_api_counters()
    
    token = get_amadeus_token()
    
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            if retry_count > 0:
                time.sleep(2)
            
            url = "https://test.api.amadeus.com/v1/reference-data/locations/pois"
            headers = {'Authorization': f'Bearer {token}'}
            params = {'latitude': latitude, 'longitude': longitude, 'radius': 20}
            
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                if not data.get('data'):
                    print(f"No POI data found for coordinates ({latitude}, {longitude})")
                    return None
                
                amadeus_calls_today += 1
                return data.get('data', [])[:10]  # Limit to top 10 POIs
            
            print(f"Failed to fetch POIs: {response.json()}")
            retry_count += 1
            
        except Exception as e:
            print(f"Error fetching POIs (attempt {retry_count + 1}): {str(e)}")
            return None


def generate_itinerary(start_date, days, destination):
    """Generates a day-wise travel itinerary."""
    
    itinerary = {}
    
    try:
        latitude, longitude = get_location_coordinates(destination)
        latitude, longitude = 41.397158, 2.160873
        
        if latitude is None or longitude is None:
            print(f"Failed to fetch location coordinates for destination '{destination}'")
            return None
        
        pois = get_amadeus_pois(latitude, longitude)
        
        current_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
        
        if pois is None:
            print(f"Failed to fetch POIs for destination '{destination}' with coordinates ({latitude}, {longitude})")
            return None
        
        for day in range(1, days + 1):
            day_plan = {
                'date': current_date_obj.strftime("%Y-%m-%d"),
                'activities': []
            }
            
            # Select up to 3 POIs per day and fetch images for them
            for poi in pois[(day - 1) * 3: day * 3]:
                poi_data = {
                    'name': poi['name'],
                    'description': poi.get('description', ''),
                    'rating': poi.get('rating', 'N/A'),
                    'image': get_unsplash_image(poi['name'])  # Placeholder for image fetching logic
                }
                day_plan['activities'].append(poi_data)
            
            itinerary[f'Day {day}'] = day_plan
            current_date_obj += timedelta(days=1)
        
        return itinerary
    
    except APILimitError as e:
        print(str(e))
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")


# Example Usage
if __name__ == "__main__":
    # print(get_unsplash_image("solapur"))

    start_date = input("Enter start date (YYYY-MM-DD): ")
    days = int(input("Enter number of days for the trip: "))
    destination = input("Enter destination city (e.g., Paris): ")
    
    try:
        itinerary_result = generate_itinerary(start_date, days, destination)
        
        if itinerary_result:
            for day, details in itinerary_result.items():
                print(f"{day}: {details}")
                
                for activity in details['activities']:
                    print(f" - {activity['name']}: {activity.get('image')}")
                    
                print("\n")
                
    except Exception as e:
        print(f"Failed to generate itinerary: {e}")
