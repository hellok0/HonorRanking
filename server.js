const express = require("express");
const rbx = require("noblox.js");
const { ref, set, get, database } = require('./firebaseConfig'); // Import Firebase functions
const app = express();
require('dotenv').config();

app.use(express.json());

// Read the group ID and cookie from environment variables
const groupId = 15049970;
const cookie = process.env.ROBLOSECURITY; // Read cookie from environment variables

const honorRanks = {
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
  150: 89896768
};

// Endpoint to update rank and honor
app.post("/ranker", async (req, res) => {
  const { userid, honor } = req.body;

  // Validate input
  if (!userid || !honor || typeof userid !== 'number' || typeof honor !== 'number') {
    return res.status(400).json({ error: "Invalid input." });
  }

  // Determine the role ID based on honor
  let roleId;
  for (let [threshold, id] of Object.entries(honorRanks).reverse()) {
    if (honor >= threshold) {
      roleId = id;
      break;
    }
  }

  if (!roleId) {
    return res.status(400).json({ error: "Invalid honor level." });
  }

  // Store the player data in Firebase
  try {
    await set(ref(database, `players/${userid}`), { honor });

    // Update the player's rank on Roblox
    await rbx.setCookie(cookie);
    await rbx.setRank(groupId, parseInt(userid), roleId);
    res.json({ message: "Rank updated successfully!" });
  } catch (err) {
    console.error("Failed to set rank: ", err);
    res.status(500).json({ error: "Failed to set rank." });
  }
});

// Endpoint to get all players' userid and honor
app.get("/players", async (req, res) => {
  try {
    // Retrieve all player data from Firebase
    const playersRef = ref(database, 'players');
    const snapshot = await get(playersRef);
    const data = snapshot.val();

    if (data) {
      // Transform data into an array of user ID and honor
      const players = Object.entries(data).map(([userid, playerData]) => ({
        userid,
        honor: playerData.honor
      }));

      res.json({ players });
    } else {
      res.status(404).json({ error: "No players found." });
    }
  } catch (err) {
    console.error("Failed to retrieve players data: ", err);
    res.status(500).json({ error: "Failed to retrieve players data." });
  }
});


// Endpoint to get player honor
app.get("/ranker/:userid", async (req, res) => {
  const userid = parseInt(req.params.userid);

  // Validate input
  if (!userid || typeof userid !== 'number') {
    return res.status(400).json({ error: "Invalid user ID." });
  }

  try {
    // Retrieve player honor from Firebase
    const playerRef = ref(database, `players/${userid}`);
    const snapshot = await get(playerRef);
    const data = snapshot.val();

    if (data) {
      await rbx.setCookie(cookie);

      // Fetch player info
      const playerInfo = await rbx.getPlayerInfo(userid);

      // Fetch the user's role ID
      const userGroups = await rbx.getRankInGroup(groupId, userid);
      const roleId = userGroups;

      // Fetch role name
      const role = await rbx.getRole(groupId, roleId);

      res.json({ honor: data.honor, roleName: role.name });
    } else {
      res.status(404).json({ error: "Player not found." });
    }
  } catch (err) {
    console.error("Failed to retrieve player data: ", err);
    res.status(500).json({ error: "Failed to retrieve player data." });
  }
});



app.post("/populatehonor", async (req, res) => {
  try {
    await rbx.setCookie(cookie);

    for (const [honor, roleId] of Object.entries(honorRanks)) {
      // Fetch players with the current roleId
      const players = await rbx.getPlayers(groupId, roleId);

      for (const player of players) {
        const { userId } = player;

        // Store player data in Firebase with the appropriate honor points
        await set(ref(database, `players/${userId}`), { honor: parseInt(honor) });

        console.log(`Set honor for user ${userId} to ${honor}`);
      }
    }

    res.json({ message: "Honor points populated successfully!" });
  } catch (err) {
    console.error("Failed to populate honor points: ", err);
    res.status(500).json({ error: "Failed to populate honor points." });
  }
});

// Test endpoint
app.post("/test", (req, res) => {
  console.log("Test request received");
  res.json({ message: "Test request processed" });
});

// Test endpoint
app.post("/test", (req, res) => {
  console.log("Test request received");
  res.json({ message: "Test request processed" });
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
