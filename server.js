const express = require("express");
const rbx = require("noblox.js");
const app = express();

app.use(express.json());

const groupId = 15049970; // Replace with your Group Id
const cookie = "YOUR_SECURE_COOKIE"; // Replace with your account cookie

// honor amount: roleid
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

  try {
    await rbx.setCookie(cookie);
    await rbx.setRank(groupId, parseInt(userid), rankId);
    res.json({ message: "Rank updated successfully!" });
  } catch (err) {
    console.error("Failed to set rank: ", err);
    res.status(500).json({ error: "Failed to set rank." });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
