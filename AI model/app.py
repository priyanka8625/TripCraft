from flask import Flask, request, jsonify
from Itinerary_Generator import generate_itinerary

app = Flask(__name__)

@app.route('/generate_itinerary', methods=['POST'])
def generate():
    data = request.get_json()
    try:
        itinerary = generate_itinerary(data)
        return jsonify(itinerary)
    except Exception as e:
        import traceback
        print(f"Error in itinerary: {str(e)}")
        print(traceback.format_exc())  # Added stack trace for debugging
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting app.py...")
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=False)