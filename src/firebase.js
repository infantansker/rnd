// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getRemoteConfig } from "firebase/remote-config";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAc0WzUsgae17Zyo4dN3WfuBIvgpVBrTQA",
  authDomain: "techvaseegrah-runanddevelop.firebaseapp.com",
  projectId: "techvaseegrah-runanddevelop",
  storageBucket: "techvaseegrah-runanddevelop.firebasestorage.app",
  appId: "1:876140121414:web:4bc391bcb17cbe35c32947",
  measurementId: "G-GZJS335Y7G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
const auth = getAuth(app);

// Initialize Firestore and export it
const db = getFirestore(app);

// Initialize Remote Config and export it
const remoteConfig = getRemoteConfig(app);

// Set a minimum fetch interval for development
remoteConfig.settings.minimumFetchIntervalMillis = 10000; // 10 seconds


// Set default values for Remote Config parameters
remoteConfig.defaultConfig = {
  "spring_season": false
};

export { auth, db, remoteConfig };