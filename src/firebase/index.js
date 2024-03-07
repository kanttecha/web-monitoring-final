
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import the Firebase authentication module
import { getFirestore } from "firebase/firestore"; // Import the Cloud Firestore module

// Your web app's Firebase configuration
const config = {
  apiKey: "AIzaSyAm7EHMXpmqFpTolPrAFjQsWxb6YTIgoEI",
  authDomain: "testlogin-88c09.firebaseapp.com",
  projectId: "testlogin-88c09",
  storageBucket: "testlogin-88c09.appspot.com",
  messagingSenderId: "1024726006882",
  appId: "1:1024726006882:web:4e61ca96fca3b3ec18e53b",
};

// Initialize Firebase
const app = initializeApp(config);

// Initialize Firebase authentication
const auth = getAuth(app);

const firestore = getFirestore(app); // Initialize Cloud Firestore

export { auth, firestore }; // Export the auth and firestore objects
