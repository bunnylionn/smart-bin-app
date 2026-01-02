import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCDfUcrfjDOCXZVuoqdJ6MQhZGSS-CQ5mE",
  authDomain: "smartbin-cpc357-project.firebaseapp.com",
  projectId: "smartbin-cpc357-project",
  storageBucket: "smartbin-cpc357-project.firebasestorage.app",
  messagingSenderId: "51984990106",
  appId: "1:51984990106:web:3fa188ff875f2754fcc423"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Realtime Database (optional)
export const database = getDatabase(app);

// Initialize Firestore
export const firestore = getFirestore(app);

export default app;

