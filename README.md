# HonorRanking 

HonorRanking is a backend system that synchronizes **player honor, rank promotions, and in game progress** between **Roblox, firebase, and Discord**.  It ensures real time updates and rank management based on honor values.

---

## **Features**
✅ **Automatic Honor Tracking** – Players earn **1 honor every 30 minutes** in-game.  
✅ **Roblox Group Rank Integration** – Players get promoted based on their honor.  
✅ **Firebase Database Sync** – Stores player honor, time spent, and ranks.  
✅ **Discord Bot Support** – Allows honor modifications and queries via chat commands.  
✅ **Real-Time Updates** – Syncs data seamlessly between Roblox, Firebase, and Discord.  

---

## **How It Works**
1. **Roblox Game** 🡆 Sends a **POST request** when a player earns or loses honor.
2. **Server.js** 🡆 Updates **Firebase** with the player’s **honor and time spent**.
3. **Rank Promotions** 🡆 If the player meets the next rank’s requirement, the **Roblox API updates their group rank**.
4. **Discord Bot** 🡆 Fetches data from Firebase to allow users to check and modify honor.
5. **Honor Timer** 🡆 Automatically adds **1 honor every 30 minutes** spent in-game.

---

## API Endpoints
- POST /ranker Updates honor, timeSpent and promotes the player if needed.
- GET /players Retrieves all players with their username, honor and time spent.
- GET /ranker/:userid Retrieves a specific player's honor and time spent from Firebase.
- POST /updatehonor Updates a player's honor based on time spent and ranks them up if necessary
- POST /test A test endpoint to verify if server is running correctly.

---

## Setup Instructions 
### Prerequisites
- Node.js installed 
- Firebase project setup
- Roblox group and API access

### Installation

1. Clone the repository
```bash
git clone https://github.com/hellok0/HonorRanking.git
cd HonorRanking
```
2. Install dependencies
```bash
npm install
```
3. Set up environmental variables
  - Create a .env file and add your ROBLOSECURITY cookie.
```bash
ROBLOSECURITY=your_cookie_here
```
4. Run the server
```bash
node server.js
```

