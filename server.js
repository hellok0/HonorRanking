const express = require("express");
const rbx = require("noblox.js");
const app = express();

app.use(express.json());

const groupId = 15049970; // Replace with your Group Id
const cookie = "YOUR_SECURE_COOKIE"; // Replace with your account cookie

const honorRanks = {
  0: "[E-1] Recruit",
  1: "[E-2] Private",
  5: "[E-3] Private First Class",
  10: "[E-4] Specialist",
  15: "[E-5] Corporal",
  20: "[E-6] Sergeant",
  30: "[E-7] Staff Sergeant",
  40: "[E-8] Sergeant First Class",
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
