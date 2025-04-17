from flask import Flask, request, jsonify
from Itinerary_Generator import generate_itinerary

app = Flask(__name__)

@app.route("/generate_itinerary", methods=["POST"])
def generate():
    user_input = request.json
    try:
        itinerary = generate_itinerary(user_input)
        return jsonify(itinerary)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)