from flask import Flask, jsonify
from flask_cors import CORS
from find_jobs.router import jobs_bp
from ai_analyzer.router import ai_bp
from tracker_api.router import tracker_bp
from profile_api import profile_bp

app = Flask(__name__)

# Allow React frontend to access the API
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# Register Blueprints
app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
app.register_blueprint(ai_bp, url_prefix="/api/ai")
app.register_blueprint(tracker_bp, url_prefix="/api/tracker")
app.register_blueprint(profile_bp, url_prefix="/api/profile")

@app.route("/", methods=["GET"])
def read_root():
    return jsonify({"message": "Job Tracker API (Flask) is running."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
