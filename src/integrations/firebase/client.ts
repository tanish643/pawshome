import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDzqJB1CGsOBuwB3TQk8hOnowdphal9Kq4",
    authDomain: "pawstore-834f1.firebaseapp.com",
    projectId: "pawstore-834f1",
    storageBucket: "pawstore-834f1.firebasestorage.app",
    messagingSenderId: "62966785728",
    appId: "1:62966785728:web:4706506c02e5763836ef25",
    measurementId: "G-ZC4YZZP75H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, db, storage, googleProvider };
