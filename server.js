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
  50: "[E-9] Master Sergeant",
  70: "[E-10] Sergeant Major",
  90: "[W-I] Warrant Officer",
  120: "[W-II] Upper Warrant Officer",
  150: "[W-III] Chief Warrant Officer"
};

app.post("/ranker", async (req, res) => {
  const { userid, honor } = req.body;
  
  // Determine the role based on honor
  let rankId;
  for (let [threshold, rank] of Object.entries(honorRanks).reverse()) {
    if (honor >= threshold) {
      rankId = rank;
      break;
    }
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
