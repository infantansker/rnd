// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Make sure getAuth is imported

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAc0WzUsgae17Zyo4dN3WfuBIvgpVBrTQA",
  authDomain: "techvaseegrah-runanddevelop.firebaseapp.com",
  projectId: "techvaseegrah-runanddevelop",
  storageBucket: "techvaseegrah-runanddevelop.firebasestorage.app",
  messagingSenderId: "876140121414",
  appId: "1:876140121414:web:4bc391bcb17cbe35c32947",
  measurementId: "G-GZJS335Y7G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
const auth = getAuth(app);

export { auth }; // Export the auth object so Login.jsx can use it