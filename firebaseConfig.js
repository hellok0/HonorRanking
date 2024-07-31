const firebase = require('firebase/app');
require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAoSaee2VIZWl0g0uoi3d5WvAxZPBL3dcw",
  authDomain: "tghhonordata.firebaseapp.com",
  projectId: "tghhonordata",
  storageBucket: "tghhonordata.appspot.com",
  messagingSenderId: "628214909470",
  appId: "1:628214909470:web:7e0f510286056338fc3c0f",
  measurementId: "G-HK5GBEZ8QV"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

module.exports = { database };