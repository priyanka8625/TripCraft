# To create clusters of various activities based on the location or destination provided by the user(Latitude and longitude coordinates of the activities)

import os
import numpy as np
from sklearn.cluster import DBSCAN
from dotenv import load_dotenv
import openrouteservice

# Load environment variables
load_dotenv()
ORS_API_KEY = os.getenv("ORS_API_KEY")
if not ORS_API_KEY:
    raise ValueError("ORS_API_KEY not found in .env file")

def fetch_distance_matrix(locations, profile='driving-car'): #The mode of transportation is kept constant for now it can be changes as per user preference.
    client = openrouteservice.Client(key=ORS_API_KEY)
    coords = [(round(lon, 6), round(lat, 6)) for lon, lat in locations]

    n = len(coords)
    print(f"Fetching distance matrix for {n} locations using ORS ({profile})...")

    try:
        result = client.distance_matrix(
            locations=coords,
            profile=profile,
            metrics=["distance", "duration"],
            resolve_locations=False,
            units="km"
        )
    except Exception as e:
        print(f"ORS Matrix API failed: {e}")
        raise

    if "distances" not in result or "durations" not in result:
        raise ValueError("ORS response missing distances or durations.")

    distance_matrix = np.array(result["distances"])  #in kilometers
    time_matrix = np.array(result["durations"])/3600  #convert seconds to hours

    return distance_matrix, time_matrix

def cluster_locations(distance_matrix, eps_km=15, min_samples=2):
    """
    Cluster locations using DBSCAN based on distance matrix.
    """
    dist_array = np.array(distance_matrix)
    dist_array[dist_array == float('inf')] = 1e6  #Replace unreachable values with large constant
    db = DBSCAN(eps=eps_km, min_samples=min_samples, metric='precomputed')
    clusters = db.fit_predict(dist_array)
    unique_clusters = np.unique(clusters)
    print(f"Formed {len(unique_clusters) - (1 if -1 in clusters else 0)} clusters")
    print(f"Noise points (unclustered): {np.sum(clusters == -1)}")
    return clusters
