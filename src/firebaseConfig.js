const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');


// insert parameters here
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

module.exports = { ref, set, get, database };
