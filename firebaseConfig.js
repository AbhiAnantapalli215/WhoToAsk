// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Platform } from "react-native";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let auth;

if (Platform.OS !== "web") {
  try {
    // require at runtime so web bundler doesn't try to resolve native-only modules
    // build the module path dynamically so Metro won't attempt to resolve it during bundling
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    const rnAuthPath = "firebase" + "/auth/react-native";
    const { initializeAuth, getReactNativePersistence } = require(rnAuthPath);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (err) {
    console.warn("Native auth persistence init failed, falling back to getAuth:", err);
    auth = getAuth(app);
  }
} else {
  // web fallback
  auth = getAuth(app);
}
export { app, auth, db };