from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/osm/<city>', methods=['GET'])
def get_osm(city):
    # Map city to coordinates (hardcoded or use Nominatim API)
    city_coords = {
        "nanded": (19.1602, 77.3050),
        "pune": (18.5204, 73.8567)
    }
    lat, lon = city_coords.get(city.lower(), (0, 0))
    if lat == 0:
        return jsonify({"error": f"Unknown city: {city}"}), 400
    
    data = get_osm_data(city, lat, lon)
    if data:
        return jsonify(data)
    return jsonify({"error": f"No OSM data for {city}"}), 500

if __name__ == '__main__':
    app.run(debug=True)