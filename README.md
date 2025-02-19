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
