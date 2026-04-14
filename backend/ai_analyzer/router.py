from flask import Blueprint, request, jsonify
from .analyzer import AIAnalyzer

ai_bp = Blueprint('ai', __name__)
analyzer = AIAnalyzer()

@ai_bp.route("/analyze", methods=["POST"])
def analyze():
    """
    Endpoint to analyze a resume against a job description.
    Expects JSON: { "resume_text": "...", "job_description": "..." }
    """
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid JSON"}), 400
        
    resume_text = data.get("resume_text")
    jd_text = data.get("job_description")
    
    if not resume_text or not jd_text:
        return jsonify({"success": False, "error": "Both resume_text and job_description are required."}), 400
        
    # Run the analysis
    result = analyzer.analyze_resume(resume_text, jd_text)
    
    return jsonify({
        "success": True,
        "results": result
    })
