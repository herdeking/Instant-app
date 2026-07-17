import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC7DzEQEgpeyBcsUo_QaKl7faeYRer8e2E',
  authDomain: 'instantlivefootball.firebaseapp.com',
  projectId: 'instantlivefootball',
  storageBucket: 'instantlivefootball.firebasestorage.app',
  messagingSenderId: '584488048641',
  appId: '1:584488048641:web:7adf83799426222a5fc800',
};

const alreadyInitialized = getApps().length > 0;
const app = alreadyInitialized ? getApp() : initializeApp(firebaseConfig);

// React Native's networking stack doesn't reliably support Firestore's default
// WebSocket-based streaming transport, especially in production/standalone builds.
// Long-polling is slower but far more reliable on-device.
let db;
if (alreadyInitialized) {
  db = getFirestore(app);
} else {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
}

const storage = getStorage(app);
const auth = null;

export { app, auth, db, storage };
