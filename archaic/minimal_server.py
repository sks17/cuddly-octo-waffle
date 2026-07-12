"""
Minimal Flask server for debugging far-flare issues
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)

# Simple CORS configuration
CORS(app, origins=["http://localhost:8080", "http://127.0.0.1:8080"])

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "ok", "message": "Server is working"})

@app.route('/api/info', methods=['GET'])
def api_info():
    return jsonify({
        "name": "far-flare minimal test",
        "version": "1.0.0",
        "status": "running"
    })

@app.route('/api/render-spec', methods=['POST'])
def render_spec():
    try:
        data = request.get_json() or {}
        
        # Return a minimal spec for testing
        return jsonify({
            "canvas": {
                "width": data.get("canvas_width", 400),
                "height": data.get("canvas_height", 300),
                "cell_size": data.get("cell_size", 20)
            },
            "blocks": [
                {"x": 0, "y": 0, "width": 20, "height": 20, "determinant": 1, "matrix": [[1]]},
                {"x": 20, "y": 0, "width": 20, "height": 20, "determinant": 0, "matrix": [[0]]},
                {"x": 0, "y": 20, "width": 20, "height": 20, "determinant": -1, "matrix": [[-1]]}
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🧪 Starting minimal test server...")
    app.run(host='127.0.0.1', port=5000, debug=False)