import os
import sys

# 1. Mock spaces locally to prevent ImportError during local runs on non-GPU hardware
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


from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware
import gradio as gr

# 2. Create the Flask app
from flask import Flask, jsonify
from flask_cors import CORS
from find_jobs.router import jobs_bp
from ai_analyzer.router import ai_bp
from tracker_api.router import tracker_bp
from profile_api import profile_bp

flask_app = Flask(__name__)

# Allow React frontend to access the API
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
CORS(flask_app, resources={r"/*": {"origins": allowed_origins}})

# Register Flask Blueprints
flask_app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
flask_app.register_blueprint(ai_bp, url_prefix="/api/ai")
flask_app.register_blueprint(tracker_bp, url_prefix="/api/tracker")
flask_app.register_blueprint(profile_bp, url_prefix="/api/profile")

@flask_app.route("/", methods=["GET"])
def read_root():
    return jsonify({"message": "Job Tracker API (Flask) is running."})

# 3. Create a basic Gradio interface that Hugging Face expects
def status_check():
    return "CareerArc API is active and running!"

demo = gr.Interface(
    fn=status_check,
    inputs=[],
    outputs="text",
    title="CareerArc API Status",
    description="This Space hosts the Flask API for CareerArc."
)

# 4. Initialize the Gradio FastAPI app and mount the Flask app at the root "/"
app = gr.routes.App.create_app(demo)
app.mount("/", WSGIMiddleware(flask_app))

if __name__ == "__main__":
    import uvicorn
    # Default to 7860 on Hugging Face, but 5000 for local development
    default_port = 7860 if os.environ.get("SPACE_ID") else 5000
    port = int(os.environ.get("PORT", default_port))
    # Run the server (reload=False prevents duplicate process port conflicts in container)
    uvicorn.run(app, host="0.0.0.0", port=port)

