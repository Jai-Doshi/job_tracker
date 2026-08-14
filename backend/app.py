import os
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

# Dummy function to satisfy HF ZeroGPU startup checks if ZeroGPU hardware is selected
try:
    import spaces  # type: ignore
    @spaces.GPU
    def dummy_gpu_func():
        pass
except (ImportError, Exception):
    pass

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port, debug=True)

