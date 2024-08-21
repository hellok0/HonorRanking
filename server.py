import os
import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, request, jsonify
import robloxpy

# Initialize Flask app
app = Flask(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Load Firebase credentials
cred = credentials.Certificate('firebaseConfig.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://tghhonordata-default-rtdb.firebaseio.com/'
})

# Set the Roblox cookie
cookie = os.getenv("ROBLOSECURITY")
robloxpy.User.Internal.SetCookie(cookie, True)

# Group ID and Roblox client
group_id = 15049970

roles = robloxpy.Group.External.GetRoles(group_id)
members_list = robloxpy.Group.External.GetMembersList(group_id)
print(f"Members list: {members_list}")  # Check what is being returned
# Check if the response is a string or not a list of dictionaries
if not isinstance(members_list, list) or any(not isinstance(member, dict) for member in members_list):
    print(f"Unexpected response: {members_list}")
    members_list = []  # Set to an empty list or handle the error appropriately


# Honor ranks with corresponding role IDs
honor_ranks = {
    0: 102794177,
    1: 84972954,
    5: 85150886,
    10: 89383841,
    15: 85006910,
    20: 85006940,
    30: 84972953,
    40: 90562516,
    50: 91138752,
    70: 87676269,
    90: 85006963,
    120: 102794281,
    150: 89896768,
    6969: 98990029,
}
# Getting user role in the group
def get_user_role(user_id):
    for member in members_list:
        if isinstance(member, dict):  # Ensure the member is a dictionary
            if member.get('user_id') == user_id:
                role_id = member.get('role_id')
                role_name = next((role['name'] for role in roles if role['id'] == role_id), 'Unknown Role')
                return role_name
        else:
            print(f"Unexpected member format: {member}")  # Log unexpected data
    return 'Not a member'




# Endpoint to update honor and timeSpent, optionally update rank if needed
@app.route("/ranker", methods=["POST"])
def ranker():
    data = request.get_json()
    userid = data.get('userid')
    honor = data.get('honor')
    time_spent = data.get('timeSpent')

    # Validate input
    if not all([userid, honor, time_spent]) or not all(isinstance(i, int) for i in [userid, honor, time_spent]):
        return jsonify({"error": "Invalid input."}), 400

    # Determine the new role ID based on honor
    new_role_id = None
    for threshold, id in sorted(honor_ranks.items(), reverse=True):
        if honor >= threshold:
            new_role_id = id
            break

    if not new_role_id:
        return jsonify({"error": "Invalid honor level."}), 400

    try:
        # Store the updated player data in Firebase
        ref = db.reference(f'players/{userid}')
        ref.set({'honor': honor, 'timeSpent': time_spent})

        # Fetch the current role ID
        current_role_id = robloxpy.Group.External.GetRoleInGroup(userid, group_id)

        # Update rank only if it's different from the new_role_id
        if current_role_id != new_role_id:
            robloxpy.Group.Admin.ChangeRank(userid, group_id, new_role_id)

        return jsonify({"message": "Honor and time spent updated successfully!"})
    except Exception as err:
        print(f"Failed to update player data: {err}")
        return jsonify({"error": "Failed to update player data."}), 500

# Endpoint to get all players
@app.route("/players", methods=["GET"])
def get_players():
    try:
        # Retrieve all player data from Firebase
        ref = db.reference('players')
        data = ref.get()

        if data:
            players = [{'userid': userid, 'honor': player.get('honor', 0), 'timeSpent': player.get('timeSpent', 0)} for userid, player in data.items()]
            return jsonify({"players": players})
        else:
            return jsonify({"error": "No players found."}), 404
    except Exception as err:
        print(f"Failed to retrieve players data: {err}")
        return jsonify({"error": "Failed to retrieve players data."}), 500

@app.route("/ranker/<int:userid>", methods=["GET"])
def get_ranker(userid):
    try:
        # Retrieve player data from Firebase
        ref = db.reference(f'players/{userid}')
        data = ref.get()

        # Debug print to check the data returned
        print(f"Data retrieved for user {userid}: {data}")
        print(f"Data type: {type(data)}")

        if data:
            # Fetch the user's role name
            role_name = get_user_role(userid)

            # Send the player data with honor, timeSpent, and roleName
            return jsonify({
                "honor": data['honor'],  # This line could fail if data isn't a dictionary
                "timeSpent": data.get('timeSpent', 0),
                "roleName": role_name
            })
        else:
            return jsonify({"error": "Player not found."}), 404
    except Exception as err:
        print(f"Failed to retrieve player data: {err}")
        return jsonify({"error": "Failed to retrieve player data."}), 500


# Endpoint to update honor based on elapsed time
@app.route("/updateHonor", methods=["POST"])
def update_honor():
    data = request.get_json()
    userid = data.get('userid')
    elapsed_minutes = data.get('elapsedMinutes')

    # Validate input
    if not all([userid, elapsed_minutes]) or not all(isinstance(i, int) for i in [userid, elapsed_minutes]):
        return jsonify({"error": "Invalid input."}), 400

    try:
        # Retrieve current player data from Firebase
        ref = db.reference(f'players/{userid}')
        player_data = ref.get()

        if not player_data:
            return jsonify({"error": "Player not found."}), 404

        honor = player_data.get('honor', 0)
        time_spent = player_data.get('timeSpent', 0) + elapsed_minutes

        # Increment honor every 30 minutes
        honor_increment = time_spent // 30
        honor += honor_increment

        # Update player data in Firebase
        ref.set({'honor': honor, 'timeSpent': time_spent})

        # Determine the new role ID based on honor
        new_role_id = None
        for threshold, id in sorted(honor_ranks.items(), reverse=True):
            if honor >= threshold:
                new_role_id = id
                break

        if not new_role_id:
            return jsonify({"error": "Invalid honor level."}), 400

        # Fetch the current role ID
        current_role_id = robloxpy.Group.External.GetRoleInGroup(userid, group_id)

        # Update rank only if it's different from the new_role_id
        if current_role_id != new_role_id:
            robloxpy.Group.Admin.ChangeRank(userid, group_id, new_role_id)

        return jsonify({"message": "Honor and time spent updated successfully!"})
    except Exception as err:
        print(f"Failed to update player data: {err}")
        return jsonify({"error": "Failed to update player data."}), 500

# Test endpoint
@app.route("/test", methods=["POST"])
def test():
    print("Test request received")
    return jsonify({"message": "Test request processed"})

# Start the server
if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    app.run(host='0.0.0.0', port=port)
