// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAc0WzUsgae17Zyo4dN3WfuBIvgpVBrTQA",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "techvaseegrah-runanddevelop.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "techvaseegrah-runanddevelop",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "techvaseegrah-runanddevelop.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "876140121414",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:876140121414:web:4bc391bcb17cbe35c32947",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-GZJS335Y7G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; // Export auth and Firestore database