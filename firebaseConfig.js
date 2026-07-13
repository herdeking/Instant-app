// firebaseConfig.js
// Paste your Firebase project config below (same project as instantlivefootball.com.ng)
// Find this in Firebase Console > Project Settings > General > Your apps > SDK setup and config

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'instantlivefootball.firebaseapp.com',
  projectId: 'instantlivefootball',
  storageBucket: 'instantlivefootball.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Avoid re-initializing on fast refresh
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth needs AsyncStorage persistence on native, but web uses default persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // initializeAuth throws if already called (e.g. hot reload) — fall back to getAuth
    auth = getAuth(app);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
