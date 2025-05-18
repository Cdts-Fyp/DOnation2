// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqcCBvljCs9g8fGnJJx15SHkTpvvE9C50",
  authDomain: "donor-b5a50.firebaseapp.com",
  projectId: "donor-b5a50",
  storageBucket: "donor-b5a50.firebasestorage.app",
  messagingSenderId: "395428109693",
  appId: "1:395428109693:web:97ffe14512c552364d0014"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };