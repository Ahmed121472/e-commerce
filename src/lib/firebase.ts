import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: firebaseConfigData.projectId || "dulcet-reducer-2lcf1",
  appId: firebaseConfigData.appId,
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific databaseId if provided
const customDatabaseId = (firebaseConfigData as any)?.firestoreDatabaseId || (firebaseConfigData as any)?.databaseId;

let dbInstance: Firestore;
try {
  if (customDatabaseId && customDatabaseId !== "(default)") {
    dbInstance = getFirestore(app, customDatabaseId);
  } else {
    dbInstance = getFirestore(app);
  }
} catch (err) {
  console.warn("Failed to initialize Firestore with custom databaseId, falling back to default:", err);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth: Auth = getAuth(app);
