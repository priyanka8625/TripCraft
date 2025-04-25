import os
import requests
import numpy as np
from sklearn.cluster import DBSCAN
from dotenv import load_dotenv
import pickle
import time
from math import radians, sin, cos, sqrt, atan2

# Load environment variables
load_dotenv()
GEOAPIFY_API_KEY = os.getenv("Geoapify_API")
if not GEOAPIFY_API_KEY:
    raise ValueError("Geoapify_API key not found. Ensure it is set in the .env file.")

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate great-circle distance between two points in kilometers.
    """
    R = 6371  # Earth's radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def fetch_distance_matrix(locations, mode='motorcycle', use_haversine=False, cache_file="distance_matrix.pkl", max_retries=3, timeout=10):
    """
    Fetch distance and time matrices using Haversine formula or Geoapify API.
    
    Args:
        locations: List of tuples [(lon1, lat1), (lon2, lat2), ...]
        mode: Mode of transport ('bicycle', 'drive', etc.)
        use_haversine: If True, use Haversine formula; else use Geoapify
        cache_file: File to save/load matrices (Geoapify only)
        max_retries: Number of retries for failed API calls
        timeout: Timeout for API requests in seconds
    
    Returns:
        tuple: (distance_matrix, time_matrix) in kilometers and hours
    """
    n = len(locations)
    distance_matrix = np.full((n, n), float('inf'))
    time_matrix = np.full((n, n), float('inf'))
    np.fill_diagonal(distance_matrix, 0)
    np.fill_diagonal(time_matrix, 0)

    if use_haversine:
        print("Calculating distance and time matrices using Haversine formula...")
        AVERAGE_SPEED = 20 if mode == 'bicycle' else 40  # km/h
        for i in range(n):
            for j in range(i + 1, n):
                lon1, lat1 = locations[i]
                lon2, lat2 = locations[j]
                distance_km = haversine(lon1, lat1, lon2, lat2)
                time_hours = distance_km / AVERAGE_SPEED
                distance_matrix[i][j] = distance_km
                distance_matrix[j][i] = distance_km
                time_matrix[i][j] = time_hours
                time_matrix[j][i] = time_hours
        return distance_matrix, time_matrix

    # Geoapify API
    if os.path.exists(cache_file):
        print(f"Loading distance and time matrices from {cache_file}...")
        with open(cache_file, 'rb') as f:
            distance_matrix, time_matrix = pickle.load(f)
        return distance_matrix, time_matrix

    coords = [{"lat": lat, "lon": lon} for lon, lat in locations]
    for i in range(n):
        for j in range(i + 1, n):
            start = coords[i]
            end = coords[j]
            url = (
                f"https://api.geoapify.com/v1/routing?"
                f"waypoints={start['lat']},{start['lon']}|{end['lat']},{end['lon']}"
                f"&mode={mode}&apiKey={GEOAPIFY_API_KEY}"
            )
            for attempt in range(max_retries):
                try:
                    response = requests.get(url, timeout=timeout)
                    if response.status_code != 200:
                        print(f"API error for {start} to {end}: Status {response.status_code}, {response.text}")
                        break
                    data = response.json()
                    route = data['features'][0]['properties']
                    distance_m = route['distance']
                    time_s = route['time']
                    distance_km = distance_m / 1000
                    time_hours = time_s / 3600
                    distance_matrix[i][j] = distance_km
                    distance_matrix[j][i] = distance_km
                    time_matrix[i][j] = time_hours
                    time_matrix[j][i] = time_hours
                    break
                except Exception as e:
                    print(f"Attempt {attempt + 1}/{max_retries} failed for {start} to {end}: {e}")
                    if attempt + 1 == max_retries:
                        print(f"Max retries reached for {start} to {end}")
                    time.sleep(1)

    print(f"Saving distance and time matrices to {cache_file}...")
    with open(cache_file, 'wb') as f:
        pickle.dump((distance_matrix, time_matrix), f)

    return distance_matrix, time_matrix

def cluster_locations(distance_matrix, eps_km=15, min_samples=2):
    """
    Cluster locations using DBSCAN based on distance matrix.
    """
    dist_array = np.array(distance_matrix)
    dist_array[dist_array == float('inf')] = 1e6
    db = DBSCAN(eps=eps_km, min_samples=min_samples, metric='precomputed')
    clusters = db.fit_predict(dist_array)
    unique_clusters = np.unique(clusters)
    print(f"Formed {len(unique_clusters) - (1 if -1 in clusters else 0)} clusters")
    print(f"Noise points (unclustered): {np.sum(clusters == -1)}")
    return clusters