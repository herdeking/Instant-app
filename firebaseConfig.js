import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC7DzEQEgpeyBcsUo_QaKl7faeYRer8e2E',
  authDomain: 'instantlivefootball.firebaseapp.com',
  projectId: 'instantlivefootball',
  storageBucket: 'instantlivefootball.firebasestorage.app',
  messagingSenderId: '584488048641',
  appId: '1:584488048641:web:7adf83799426222a5fc800',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
