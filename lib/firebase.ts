import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase for both client and server environments
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase if it hasn't been initialized yet
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error; // Re-throw to prevent undefined services
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

// Initialize analytics only in the browser
const analytics = typeof window !== 'undefined'
  ? isSupported().then(() => getAnalytics(app))
  : null;

// Export a function to check if Firebase is initialized
const isFirebaseInitialized = () => {
  try {
    return !!app && !!auth && !!db;
  } catch (error) {
    console.error('Error checking Firebase initialization:', error);
    return false;
  }
};

// Export initialized services
export { auth, db, analytics, isFirebaseInitialized }; 