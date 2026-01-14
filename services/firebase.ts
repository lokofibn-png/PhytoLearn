
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, indexedDBLocalPersistence, initializeAuth, browserLocalPersistence, browserPopupRedirectResolver } from 'firebase/auth'; 
import { getFirestore, Firestore } from 'firebase/firestore'; 
import { getDatabase, Database } from 'firebase/database';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: "AIzaSyD05f3-z5az77mE0nhZ1EHCwWkA4l1cuJo",
  authDomain: "pytholingo.firebaseapp.com",
  databaseURL: "https://pytholingo-default-rtdb.firebaseio.com",
  projectId: "pytholingo",
  storageBucket: "pytholingo.firebasestorage.app",
  messagingSenderId: "755959686276",
  appId: "1:755959686276:web:1c280b17d5eca275470ed1",
  measurementId: "G-BPLHKHFC3Y"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let rtdb: Database;

try {
  // Initialize App
  // If an app already exists (e.g. from HMR), reuse it.
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

  // Initialize Auth
  // We use a try/catch pattern to handle both "first load" and "hot reload" scenarios safely.
  // initializeAuth throws if auth is already initialized on this app instance.
  // getAuth throws if auth is NOT initialized on this app instance.
  const persistence = Capacitor.isNativePlatform() ? indexedDBLocalPersistence : browserLocalPersistence;
  const popupResolver = typeof window !== 'undefined' ? browserPopupRedirectResolver : undefined;

  try {
      // Try to initialize a fresh auth instance
      const authOptions: any = { persistence };
      if (popupResolver) authOptions.popupRedirectResolver = popupResolver;
      auth = initializeAuth(app, authOptions);
  } catch (e: any) {
      // If it fails (likely "already initialized"), retrieve the existing instance
      // We purposefully ignore the error and fall back to getAuth
      auth = getAuth(app);
      // Ensure persistence is set (idempotent operation)
      auth.setPersistence(persistence).catch(console.warn);
  }

  db = getFirestore(app);
  rtdb = getDatabase(app);
  console.log("✅ Connected to Firebase");
} catch (error) {
  console.warn("⚠️ Firebase connection failed. Switching to Mock Mode.", error);
  
  // Create a dummy app object to prevent crashes in other services
  app = { name: '[MOCK]', options: {} } as FirebaseApp;
  
  // Mock Auth Service (will be handled by authService.ts logic primarily)
  auth = { currentUser: null } as unknown as Auth;
  
  // Mock DBs
  db = {} as Firestore;
  rtdb = { app: { name: '[MOCK]' } } as unknown as Database;
}

export { app, auth, db, rtdb };
