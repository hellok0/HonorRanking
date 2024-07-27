/*INSERT GROUP ID AND COOKIE BELOW*/

var groupId = 15049970; // << Replace with your Group Id
var cookie = "YOUR_SECURE_COOKIE"; // << Replace with your account cookie

/*INSERT GROUP ID AND COOKIE ABOVE*/

const express = require("express");
const rbx = require("noblox.js");
const app = express();

app.use(express.json()); // To handle JSON payloads

async function startApp() {
  try {
    await rbx.setCookie(cookie);
    let currentUser = await rbx.getCurrentUser();
    console.log(`Logged in as ${currentUser.UserName}`);
  } catch (err) {
    console.error("Failed to login: ", err);
  }
}
startApp();

app.post("/ranker", async (req, res) => {
  const { userid, rank } = req.body;
  
  try {
    await rbx.setRank(groupId, parseInt(userid), parseInt(rank));
    res.json({ message: "Ranked successfully!" });
  } catch (err) {
    console.error("Failed to set rank: ", err);
    res.status(500).json({ error: "Failed to set rank." });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
