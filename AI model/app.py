from flask import Flask, request, jsonify, g
from Itinerary_Generator import generate_itinerary

app = Flask(__name__)

@app.route("/generate_itinerary", methods=["POST"], strict_slashes=False)
def generate():
    try:
        itinerary = generate_itinerary(data)
        return jsonify(itinerary)
    except Exception as e:
        print(f"Error in generate: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.teardown_appcontext
def close_mongo_connection(exception):
    if hasattr(g, 'mongo_client'):
        g.mongo_client.close()
        print("MongoDB connection closed")

if __name__ == "__main__":
    start_time = time.time()
    serve(app, host='0.0.0.0', port=5000)
    print(f"Waitress server started in {time.time() - start_time:.2f} seconds")
