const express = require("express");
const rbx = require("noblox.js");
const { ref, set, get, database } = require('./firebaseConfig'); // Import Firebase functions
const app = express();
require('dotenv').config();
const fs = require('fs');

app.use(express.json());

// Read the group ID and cookie from environment variables
const groupId = 15049970;
const cookie = process.env.ROBLOSECURITY.trim(); // Read cookie from environment variables
console.log('Cookie:', cookie);

if (typeof cookie === 'string') {
    console.log("The cookie is a string:", cookie);
} else {
    console.log("The cookie is not a string. Type:", typeof cookie);
}


// Honor ranks with corresponding role IDs
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
  150: 89896768,
  6969: 98990029,
};


// Endpoint to update honor and timeSpent, optionally update rank if needed
app.post("/ranker", async (req, res) => {
  const { userid, honor, timeSpent } = req.body;

  // Validate input
  if (!userid || !honor || !timeSpent || typeof userid !== 'number' || typeof honor !== 'number' || typeof timeSpent !== 'number') {
    return res.status(400).json({ error: "Invalid input." });
  }

  // Determine the new role ID based on honor
  let newRoleId;
  for (let [threshold, id] of Object.entries(honorRanks).reverse()) {
    if (honor >= threshold) {
      newRoleId = id;
      break;
    }
  }

  if (!newRoleId) {
    return res.status(400).json({ error: "Invalid honor level." });
  }

  try {
    // Store the updated player data in Firebase
    await set(ref(database, `players/${userid}`), { honor, timeSpent });

    // Set Roblox cookie
    await rbx.setCookie(cookie);

    // Fetch the current role ID
    const currentRoleId = await rbx.getRankInGroup(groupId, userid);

    // Update rank only if it's different from the newRoleId
    if (currentRoleId !== newRoleId) {
      await rbx.setRank(groupId, parseInt(userid), newRoleId);
    }

    res.json({ message: "Honor and time spent updated successfully!" });
  } catch (err) {
    console.error("Failed to update player data: ", err);
    res.status(500).json({ error: "Failed to update player data." });
  }
});

app.get("/players", async (req, res) => {
  try {
    // Retrieve all player data from Firebase
    const playersRef = ref(database, 'players');
    const snapshot = await get(playersRef);
    const data = snapshot.val();

    if (data) {
      const players = await Promise.all(
        Object.entries(data).map(async ([userid, playerData]) => {
          const username = await rbx.getUsernameFromId(parseInt(userid));
          return {
            userid,
            username,
            honor: playerData.honor || 0,         // Ensure default values
            timeSpent: playerData.timeSpent || 0  // Ensure default values
          };
        })
      );

      res.json({ players });
    } else {
      res.status(404).json({ error: "No players found." });
    }
  } catch (err) {
    console.error("Failed to retrieve players data: ", err);
    res.status(500).json({ error: "Failed to retrieve players data." });
  }
});

app.get("/ranker/:userid", async (req, res) => {
  const userid = parseInt(req.params.userid);

  // Validate input
  if (!userid || typeof userid !== 'number') {
    return res.status(400).json({ error: "Invalid user ID." });
  }

  try {
    // Retrieve player data from Firebase
    const playerRef = ref(database, `players/${userid}`);
    const snapshot = await get(playerRef);
    const data = snapshot.val();

    if (data) {
      console.log("Setting cookie:", cookie);  // Log the cookie before setting

      // Set the cookie
      await rbx.setCookie("cookie");
      console.log("Cookie set successfully.");

      // Proceed with fetching player data
      const playerInfo = await rbx.getPlayerInfo(userid);
      console.log("Player info retrieved:", playerInfo);
      // Continue with the rest of your logic...
    } else {
      res.status(404).json({ error: "Player not found." });
    }
  } catch (err) {
    console.error("Failed to retrieve player data: ", err);
    res.status(500).json({ error: "Failed to retrieve player data." });
  }
});

app.post("/updateHonor", async (req, res) => {
  const { userid, elapsedMinutes } = req.body;

  // Validate input
  if (!userid || !elapsedMinutes || typeof userid !== 'number' || typeof elapsedMinutes !== 'number') {
    return res.status(400).json({ error: "Invalid input." });
  }

  try {
    // Retrieve current player data from Firebase
    const playerRef = ref(database, `players/${userid}`);
    const snapshot = await get(playerRef);
    const data = snapshot.val();

    if (!data) {
      return res.status(404).json({ error: "Player not found." });
    }

    let { honor, timeSpent } = data;
    timeSpent += elapsedMinutes;

    // Increment honor every 30 minutes
    let honorIncrement = Math.floor(timeSpent / 30);
    honor += honorIncrement;

    // Update player data in Firebase
    await set(playerRef, { honor, timeSpent });

    // Determine the new role ID based on honor
    let newRoleId;
    for (let [threshold, id] of Object.entries(honorRanks).reverse()) {
      if (honor >= threshold) {
        newRoleId = id;
        break;
      }
    }

    if (!newRoleId) {
      return res.status(400).json({ error: "Invalid honor level." });
    }

    // Set Roblox cookie
    await rbx.setCookie(cookie);

    // Fetch the current role ID
    const currentRoleId = await rbx.getRankInGroup(groupId, userid);

    // Update rank only if it's different from the newRoleId
    if (currentRoleId !== newRoleId) {
      await rbx.setRank(groupId, parseInt(userid), newRoleId);
    }

    res.json({ message: "Honor and time spent updated successfully!" });
  } catch (err) {
    console.error("Failed to update player data: ", err);
    res.status(500).json({ error: "Failed to update player data." });
  }
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
