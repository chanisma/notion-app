// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: "kijun-dream-planner.firebasestorage.app",
  messagingSenderId: "491214877392",
  appId: "1:491214877392:web:5f3edc7465c0a71c9e64d5",
  measurementId: "G-FXBTE68HGE"
};

if (typeof window !== "undefined") {
    // firebase/app 으로부터 import
    console.log("🔥 Initializing Firebase Auth on client");
    const { setLogLevel } = require("firebase/app");
    setLogLevel("debug");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
