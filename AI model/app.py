from flask import Flask, request, jsonify
from Itinerary_Generator import generate_itinerary
from hotel_suggestions import suggest_hotels

app = Flask(__name__)  # use __name__

@app.route('/generate_itinerary', methods=['POST'])
def generate():
    data = request.get_json()
    try:
        # 1. Generate the itinerary
        itinerary = generate_itinerary(data)

        # 2. Get destination and suggest hotels/hostels
        destination = data["destination"]
        # assume suggest_hotels takes (activities, destination)
        suggestions = suggest_hotels(itinerary["activities"], destination)

        # 3. Return both in a single JSON response
        return jsonify({
            "itinerary": itinerary,
            "suggestions": suggestions
        })

    except Exception as e:
        import traceback
        print(f"Error in itinerary: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':  # use __name__ and '__main__'
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=False)
