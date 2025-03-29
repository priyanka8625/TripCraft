import requests
from datetime import timedelta, datetime
import os


# API Keys and Secrets
AMADEUS_API_KEY = os.environ.get("AMADEUS_API_KEY")
AMADEUS_API_SECRET = os.environ.get("AMADEUS_API_SECRET") 
UNSPLASH_KEY = os.environ.get("UNSPLASH_KEY")
RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY")


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
    """
    Fetches the access token from Amadeus API.
    """
    global amadeus_calls_today
    
    # Check Amadeus daily limit
    if amadeus_calls_today >= AMADEUS_DAILY_LIMIT:
        raise APILimitError("Amadeus API daily limit reached.")

    url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": AMADEUS_KEY,
        "client_secret": AMADEUS_SECRET,
    }
    
    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        amadeus_calls_today += 1
        return response.json().get("access_token")
    else:
        raise Exception(f"Failed to fetch Amadeus token: {response.json()}")


def get_amadeus_pois(destination):
    """
    Fetches Points of Interest (POIs) from Amadeus API.
    """
    global amadeus_calls_today
    
    # Check Amadeus daily limit
    if amadeus_calls_today >= AMADEUS_DAILY_LIMIT:
        raise APILimitError("Amadeus API daily limit reached.")
    
    url = "https://test.api.amadeus.com/v1/reference-data/locations/pois"
    headers = {'Authorization': f'Bearer {get_amadeus_token()}'}
    params = {'cityCode': destination, 'radius': 20}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        amadeus_calls_today += 1
        return response.json().get('data', [])[:10]  # Limit to top 10 POIs
    else:
        raise Exception(f"Failed to fetch POIs: {response.json()}")


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


def generate_itinerary(start_date, days, destination):
    """
    Generates a day-wise travel itinerary.
    
    Args:
        start_date (str): Start date in YYYY-MM-DD format.
        days (int): Number of days for the trip.
        destination (str): Destination city code.
        
    Returns:
        dict: Day-wise itinerary.
        
    Raises:
        APILimitError: If any API exceeds its rate limits.
        Exception: For other errors during API calls.
    """
    
    itinerary = {}
    
    try:
        pois = get_amadeus_pois(destination)
        
        current_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
        
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
                    'image': get_unsplash_image(poi['name'])
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
    
    
    
    try:
        api_key = "f32d6871b9msh211ab1ec25fa843p12ab70jsn3e1760791242"
        url = f"https://opentripmap-places-v1.p.rapidapi.com/%7Blang%7D/places/geoname?name=India&apikey={api_key}"
        
        response = requests.get(url, api_key)
        
        if response.status_code == 200:
            results = response.json()
            print(results)
        else:
            raise Exception(f"Failed to fetch from opentripmap: {response.json()}")
                
    except Exception as e:
        print(f"Failed to generate itinerary: {e}")
