import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import axios from "axios";

let authInstance = null;

export const initFirebase = async () => {
  if (authInstance) return authInstance;

  // 1. Try to read from import.meta.env
  let config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const envKeysSet = config.apiKey && config.authDomain && config.projectId;
  
  // 2. Fetch from backend if env vars are missing
  if (!envKeysSet) {
    try {
      const baseUrl = window.location.hostname === "localhost" 
        ? "http://localhost:5000" 
        : "https://ecoshare-ai.onrender.com";
      
      const configRes = await axios.get(`${baseUrl}/api/config`);
      if (configRes.data && configRes.data.firebase && configRes.data.firebase.apiKey) {
        config = configRes.data.firebase;
      }
    } catch (e) {
      console.warn("Could not fetch Firebase configuration from backend:", e);
    }
  }

  // 3. Initialize Firebase if apiKey is present, otherwise fallback to simulation mode
  if (config.apiKey) {
    try {
      const app = getApps().length === 0 ? initializeApp(config) : getApp();
      authInstance = getAuth(app);
      authInstance.isSimulation = false;
      return authInstance;
    } catch (err) {
      console.error("Error initializing Firebase App:", err);
    }
  }

  // Fallback simulation auth object
  console.warn("⚠️ Firebase credentials missing. EcoShare AI Phone Authentication running in SIMULATION mode.");
  authInstance = {
    isSimulation: true,
    currentUser: null,
  };
  return authInstance;
};
