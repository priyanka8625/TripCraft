from flask import Flask, request, jsonify
from Itinerary_Generator import generate_itinerary

app = Flask(__name__)  # use __name__

@app.route('/generate_itinerary', methods=['POST'])
def generate():
    data = request.get_json()
    try:
        itinerary = generate_itinerary(data)
        return jsonify(itinerary)
    except Exception as e:
        import traceback
        print(f"Error in itinerary: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':  # use __name__ and '__main__'
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=False)