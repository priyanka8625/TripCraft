from flask import Flask, request, jsonify, g
from Itinerary_Generator import generate_itinerary
from Similarity_Algorithm import client  # Import the MongoDB client

app = Flask(__name__)

@app.route("/generate_itinerary", methods=["POST"])
def generate():
    user_input = request.json
    try:
        itinerary = generate_itinerary(user_input)
        return jsonify(itinerary)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.teardown_appcontext
def close_mongo_connection(exception):
    """Close MongoDB connection when the Flask app context is torn down."""
    if hasattr(g, 'mongo_client'):
        g.mongo_client.close()
        print("MongoDB connection closed")

if __name__ == "__main__":
    app.run(debug=True)
