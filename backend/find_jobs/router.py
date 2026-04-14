from flask import Blueprint, request, jsonify
from .aggregator import aggregate_jobs

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route("/search", methods=["GET"])
async def search_jobs():
    """
    Search for jobs across multiple external platforms (LinkedIn, Indeed, etc.)
    """
    query = request.args.get('query', '')
    location = request.args.get('location', None)
    remote_only = request.args.get('remote_only', 'false').lower() == 'true'
    
    if not query:
        return jsonify({"success": False, "error": "Query parameter is required"}), 400

    results = await aggregate_jobs(query, location, remote_only)
    
    return jsonify({
        "success": True,
        "count": len(results),
        "query": query,
        "location": location,
        "results": results
    })
