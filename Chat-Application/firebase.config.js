import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAP5mOxVHrP2vjHLj4wXkr3LoKEb9v05Z4",
  authDomain: "chat-application-b6115.firebaseapp.com",
  projectId: "chat-application-b6115",
  storageBucket: "chat-application-b6115.firebasestorage.app",
  messagingSenderId: "755210424744",
  appId: "1:755210424744:web:d9b1910d567aca6f5b4d9d",
  measurementId: "G-7EZFE8GCZE",
  databaseURL: "https://chat-application-b6115-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

// Firebase error code -> readable message
export function authErrorText(err) {
  const map = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Please check your internet connection.",
  };
  return map[err.code] || "Something went wrong: " + (err.message || err.code);
}
