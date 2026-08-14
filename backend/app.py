import os
import sys
from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware
import gradio as gr
from flask import Flask, jsonify
from flask_cors import CORS
import spaces  # type: ignore

# Import your blueprints
from find_jobs.router import jobs_bp
from ai_analyzer.router import ai_bp
from tracker_api.router import tracker_bp
from profile_api import profile_bp

# 1. Create the Flask app
flask_app = Flask(__name__)

allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS", 
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")
CORS(flask_app, resources={r"/*": {"origins": allowed_origins}})

flask_app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
flask_app.register_blueprint(ai_bp, url_prefix="/api/ai")
flask_app.register_blueprint(tracker_bp, url_prefix="/api/tracker")
flask_app.register_blueprint(profile_bp, url_prefix="/api/profile")

@flask_app.route("/", methods=["GET"])
def read_root():
    return jsonify({"message": "Job Tracker API (Flask) is running."})

# 2. Gradio interface containing a registered @spaces.GPU function
# Hugging Face inspects the Gradio graph on startup for this decorator.
@spaces.GPU
def gpu_health_check():
    return "CareerArc API is online and ZeroGPU initialized successfully!"

with gr.Blocks(title="CareerArc API Status") as demo:
    gr.Markdown("# CareerArc API")
    gr.Markdown("This Space hosts the backend API for CareerArc.")
    btn = gr.Button("Check GPU / API Status")
    out = gr.Textbox(label="Status")
    btn.click(fn=gpu_health_check, inputs=[], outputs=out)

# 3. Mount Flask onto Gradio ASGI app
app = gr.routes.App.create_app(demo)
app.mount("/", WSGIMiddleware(flask_app))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)