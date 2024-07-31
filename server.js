const express = require("express");
const rbx = require("noblox.js");
const app = express();

app.use(express.json());

const groupId = 15049970;
const cookie = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_1DD860EBCDDAAB3BB662581CAFB6C27A39B544935CFE32EFEF892D430B8023DC185D76E6E060B7B8E633E0F1308A30292E197BACDCCABC3527049DC6085DE2BBE2665B0335A8676DA30376B2F69810DE19F133566A777C18925E975A0CCE6B7F5E8DA2419B84ADD4406F20641B4878A67E90EC0C3BCE3960C66CA353F1C884C6D5B28514B0561F4EE83DF140EA1963625E38F70F56EB7C0A905E81FC72BDC086CA422680CAB95BFDAE54D24B1E80A662495EDD244C2BBB8E2D29624F614A340AE4A6EA4A8E98A73FB14D802634FF6CF377B93EBAB76132727CC8C1CFC9674DE78C07CDD2E9D86605D5BE1BB12E8C96E3AD874F497534BD4497CE2DA0C0EEF1F40DA32EF4A90EA60EDB5DEF06453F11037CDE5C26F742EB65FC27C95358FBEE18132C881F130717579BB0C818C9771F02A59769A133DB4D24426930A18D64062E7DCD7603EAF7DC2F38027484223A1EB462B1F80FECC4F5BCCEFD95E7F420D2E6B61509DA8E96456A36BEBA9702E6B1086C6E18CC62B871B6FD7107BE395DBFD02CF57629CB09FDC3B059BDDF55DABB6D600E5CCB7D391FFD4337B3F8B8AA7FC2467F0BA7286620A7A31BCE87E3F115B991DA96EC1D4BEDA51ED7AE2F33377D32E8C855416D14562CE8D46BFD6BA57F144FC4F9B1DB547898EF3663ECC419FA708F8B8F63A30D46709AED1260F4C8BB69535ED94F87759D790BDC0625F5BC66B1F7194AFF1F7D3633AA45F4367868550481B909B230E07B4A7AA91EE85C8B517385EBF01E07F1738FCADBCB9B2562D49F395471DEC352731BD0CF34B9214B3AA8689DBF9D3E60F65FF871B8B218A649514CDA3105C005DBEFBDA29611690A246F69315FDA4B67C356A6E19088B146D688A34401DCFF47C94FEE7C8330AD69DF52F6199CD1FAE5FEBE09546481791FA5D7849A2941AAB297BE421C620403BFCC1335D2E4F56BDCF3C0CEF2776F0402D2BA28293548EB529078EDE3C861F0752B5C6666533AEAD57515EFB6DBB23062F27D699F32DEB21C74ED4A209DE73A84691168B6593C";
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
    await rbx.setCookie(cookie);
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
