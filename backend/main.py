from flask import Flask, jsonify
from flask_cors import CORS
from find_jobs.router import jobs_bp
from ai_analyzer.router import ai_bp

app = Flask(__name__)

# Allow React frontend to access the API
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# Register Blueprints
app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
app.register_blueprint(ai_bp, url_prefix="/api/ai")

@app.route("/", methods=["GET"])
def read_root():
    return jsonify({"message": "Job Tracker API (Flask) is running."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
