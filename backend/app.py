import os
import spaces #type:ignore
import gradio as gr
from flask import Flask, jsonify
from flask_cors import CORS

# Import Blueprints
from find_jobs.router import jobs_bp
from ai_analyzer.router import ai_bp
from tracker_api.router import tracker_bp
from profile_api import profile_bp

# 1. Create and configure the Flask app
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

# 2. Gradio interface with native @spaces.GPU function
@spaces.GPU
def check_status():
    return "CareerArc API is online!"

with gr.Blocks(title="CareerArc API") as demo:
    gr.Markdown("# CareerArc API Status")
    out = gr.Textbox(label="Status")
    btn = gr.Button("Ping Server")
    btn.click(fn=check_status, inputs=[], outputs=out)

# 3. Mount Flask onto Gradio and launch using Gradio's native server
if __name__ == "__main__":
    from fastapi.middleware.wsgi import WSGIMiddleware
    # Use Gradio's standard launch so ZeroGPU hooks trigger properly
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        wsgi_app=flask_app
    )