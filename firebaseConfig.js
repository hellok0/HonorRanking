const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyAoSaee2VIZWl0g0uoi3d5WvAxZPBL3dcw",
  authDomain: "tghhonordata.firebaseapp.com",
  projectId: "tghhonordata",
  storageBucket: "tghhonordata.appspot.com",
  messagingSenderId: "628214909470",
  appId: "1:628214909470:web:7e0f510286056338fc3c0f",
  measurementId: "G-HK5GBEZ8QV"
};

const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

module.exports = { database };