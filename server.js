const express = require("express");
const rbx = require("noblox.js");
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
  90: 34706580,
  120: 102794281,
  150: 89896768
};

// In-memory storage
let playerData = {};

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

  // Store the player data
  playerData[userid] = { honor };

  try {
    await rbx.setCookie(cookie); // Use the cookie from environment variables
    await rbx.setRank(groupId, parseInt(userid), roleId);
    res.json({ message: "Rank updated successfully!" });
  } catch (err) {
    console.error("Failed to set rank: ", err);
    res.status(500).json({ error: "Failed to set rank." });
  }
});

app.get("/ranker/:userid", (req, res) => {
  const userid = parseInt(req.params.userid);

  // Validate input
  if (!userid || typeof userid !== 'number') {
    return res.status(400).json({ error: "Invalid user ID." });
  }

  // Retrieve player data
  const data = playerData[userid];
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: "Player not found." });
  }
});

app.post("/test", (req, res) => {
  console.log("Test request received");
  res.json({ message: "Test request processed" });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
