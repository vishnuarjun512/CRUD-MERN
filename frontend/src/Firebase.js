// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-c2d2a.firebaseapp.com",
  projectId: "mern-estate-c2d2a",
  storageBucket: "mern-estate-c2d2a.appspot.com",
  messagingSenderId: "754921943368",
  appId: "1:754921943368:web:5aa558c24862e679ba037d",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
