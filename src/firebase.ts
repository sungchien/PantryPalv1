import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpgRnMdGPAkV7PHT8Z1L14_Ws9z3LkT9o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studio-3853156846-991b7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studio-3853156846-991b7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studio-3853156846-991b7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "323184745715",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:323184745715:web:e43cd46409651f1d862b86"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
