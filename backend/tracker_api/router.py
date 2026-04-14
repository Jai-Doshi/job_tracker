from flask import Blueprint, request, jsonify
from database import url, key
from supabase import create_client, ClientOptions
from datetime import datetime

tracker_bp = Blueprint('tracker', __name__)

TABLE_NAME = "applications"

def get_scoped_client():
    """Generates a Supabase client operating purely inside the authentication context of the requesting user to pass RLS cleanly."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, None
    try:
        token = auth_header.split(" ")[1]
        # Boot a dynamic client pretending to be the User on the frontend
        opts = ClientOptions(headers={"Authorization": auth_header})
        scoped_supabase = create_client(url, key, options=opts)
        
        user_res = scoped_supabase.auth.get_user(token)
        if user_res and user_res.user:
            return scoped_supabase, user_res.user.id
    except Exception as e:
        print("Auth error:", e)
    return None, None

@tracker_bp.route("/", methods=["GET"])
def get_applications():
    scoped, user_id = get_scoped_client()
    if not scoped:
        return jsonify({"success": False, "error": "Unauthorized. Please log in."}), 401
        
    try:
        response = scoped.table(TABLE_NAME).select("*").eq("user_id", user_id).order('created_at', desc=True).execute()
        return jsonify({"success": True, "data": response.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@tracker_bp.route("/", methods=["POST"])
def create_application():
    scoped, user_id = get_scoped_client()
    if not scoped:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    data = request.json
    if not data or not data.get("company") or not data.get("role"):
        return jsonify({"success": False, "error": "Company and role required"}), 400
        
    new_app = {
        "user_id": user_id,
        "company": data.get("company"),
        "role": data.get("role"),
        "status": data.get("status", "Applied"),
        "notes": data.get("notes", ""),
        "applied_date": data.get("applied_date", datetime.now().strftime("%Y-%m-%d"))
    }
    
    try:
        response = scoped.table(TABLE_NAME).insert(new_app).execute()
        return jsonify({"success": True, "data": response.data[0]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@tracker_bp.route("/<int:app_id>", methods=["PUT", "PATCH"])
def update_application(app_id):
    scoped, user_id = get_scoped_client()
    if not scoped:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    data = request.json
    try:
        response = scoped.table(TABLE_NAME).update(data).eq("id", app_id).eq("user_id", user_id).execute()
        if not response.data:
             return jsonify({"success": False, "error": "App not found or unauthorized"}), 404
        return jsonify({"success": True, "data": response.data[0]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@tracker_bp.route("/<int:app_id>", methods=["DELETE"])
def delete_application(app_id):
    scoped, user_id = get_scoped_client()
    if not scoped:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    try:
        response = scoped.table(TABLE_NAME).delete().eq("id", app_id).eq("user_id", user_id).execute()
        return jsonify({"success": True, "message": f"Deleted {app_id}"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
