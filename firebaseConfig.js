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

// Mobile carrier networks (common in Nigeria) frequently interfere with
// persistent WebSocket connections via proxying/DPI. Auto-detect long-polling
// lets Firestore probe the network and fall back automatically when needed,
// which is more robust than forcing one transport blindly.
let db;
if (alreadyInitialized) {
  db = getFirestore(app);
} else {
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    useFetchStreams: false,
  });
}

const storage = getStorage(app);
const auth = null;

export { app, auth, db, storage };
