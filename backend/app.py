import os
import spaces #type: ignore
import gradio as gr
from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware
from flask import Flask, jsonify
from flask_cors import CORS
import uvicorn

# 1. Import your Blueprints
from find_jobs.router import jobs_bp
from ai_analyzer.router import ai_bp
from tracker_api.router import tracker_bp
from profile_api import profile_bp

# 2. Setup Flask Application
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

# 3. Setup ZeroGPU Gradio Function
@spaces.GPU
def check_status():
    return "CareerArc API is online and ZeroGPU worker is active!"

with gr.Blocks(title="CareerArc API") as demo:
    gr.Markdown("# CareerArc API Status")
    out = gr.Textbox(label="Status")
    btn = gr.Button("Ping Server")
    btn.click(fn=check_status, inputs=[], outputs=out)

# 4. Create master FastAPI app and mount Gradio + Flask
app = FastAPI()

# Mount Gradio at /gradio or UI path
app = gr.mount_gradio_app(app, demo, path="/gradio")

# Mount Flask API at root /
app.mount("/", WSGIMiddleware(flask_app))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)