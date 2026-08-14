import os
import sys

# Mock spaces locally to prevent ImportError during local runs on non-GPU hardware
if not os.environ.get("SPACE_ID"):
    from types import ModuleType
    mock_spaces = ModuleType("spaces")
    def dummy_decorator(func):
        return func
    mock_spaces.GPU = dummy_decorator  # type: ignore
    sys.modules["spaces"] = mock_spaces

import spaces  # type: ignore

@spaces.GPU
def dummy_gpu_func():
    pass

from flask import Flask, jsonify
from flask_cors import CORS
from find_jobs.router import jobs_bp
from ai_analyzer.router import ai_bp
from tracker_api.router import tracker_bp
from profile_api import profile_bp

app = Flask(__name__)

# Allow React frontend to access the API
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
CORS(app, resources={r"/*": {"origins": allowed_origins}})

# Register Blueprints
app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
app.register_blueprint(ai_bp, url_prefix="/api/ai")
app.register_blueprint(tracker_bp, url_prefix="/api/tracker")
app.register_blueprint(profile_bp, url_prefix="/api/profile")

@app.route("/", methods=["GET"])
def read_root():
    return jsonify({"message": "Job Tracker API (Flask) is running."})

if __name__ == "__main__":
    # Default to 7860 on Hugging Face, but 5000 for local development
    default_port = 7860 if os.environ.get("SPACE_ID") else 5000
    port = int(os.environ.get("PORT", default_port))
    app.run(host="0.0.0.0", port=port, debug=True)

