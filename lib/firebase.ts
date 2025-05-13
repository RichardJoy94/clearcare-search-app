import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// Check if all required Firebase configuration values are present
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value !== undefined && value !== '');

// Only initialize Firebase if it hasn't been initialized and configuration is complete
const app = isFirebaseConfigured && !getApps().length ? initializeApp(firebaseConfig) : null;

// Export auth and db only if Firebase is properly configured
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Initialize analytics only in the browser and if supported
export const analytics = typeof window !== 'undefined' && app
  ? isSupported().then(() => getAnalytics(app))
  : null;

// Export a function to check if Firebase is configured
export const isFirebaseInitialized = () => !!app; 