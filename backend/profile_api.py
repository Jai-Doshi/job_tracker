from flask import Blueprint, request, jsonify
from tracker_api.router import get_scoped_client

profile_bp = Blueprint('profile', __name__)

TABLE_NAME = "profiles"

@profile_bp.route("/", methods=["GET"])
def get_profile():
    scoped, user_id = get_scoped_client()
    if not scoped:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    try:
        response = scoped.table(TABLE_NAME).select("*").eq("id", user_id).execute()
        if not response.data:
            # Implicit creation fallback if SQL trigger failed or wasn't run
            empty_profile = {
                "id": user_id,
                "first_name": "",
                "last_name": "",
                "title": "",
                "location": "",
                "target_roles": "",
                "work_style": "",
                "push_notifications": True,
                "avatar_url": ""
            }
            try:
                inserted = scoped.table(TABLE_NAME).insert(empty_profile).execute()
                return jsonify({"success": True, "data": inserted.data[0]})
            except Exception as insert_e:
                print("Failed explicit setup", insert_e)
                return jsonify({"success": True, "data": empty_profile})
                
        return jsonify({"success": True, "data": response.data[0]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@profile_bp.route("/", methods=["PUT", "POST"])
def update_profile():
    scoped, user_id = get_scoped_client()
    if not scoped:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    data = request.json
    
    try:
        # Check if exists
        response = scoped.table(TABLE_NAME).select("*").eq("id", user_id).execute()
        if not response.data:
            # Insert if missing (should not happen if trigger works, but safe fallback)
            data["id"] = user_id
            res = scoped.table(TABLE_NAME).insert(data).execute()
        else:
            # Update
            res = scoped.table(TABLE_NAME).update(data).eq("id", user_id).execute()
            
        return jsonify({"success": True, "data": res.data[0]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
