// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu0tdBCj-ZNyrXHVGwulsyfjYb2h5XlT4",
  authDomain: "writecraft-477014.firebaseapp.com",
  projectId: "writecraft-477014",
  storageBucket: "writecraft-477014.firebasestorage.app",
  messagingSenderId: "596745678550",
  appId: "1:596745678550:web:15f4af68ca74ee5f54a377"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
