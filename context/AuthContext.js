// context/AuthContext.js
// Tracks whether the current user is a logged-in admin.
// Usernames are mapped to an internal email so Firebase Auth (email/password)
// can be used behind a "username" login field.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const AuthContext = createContext(null);

// Change this to match your real domain / convention if you set one up in Firebase
const USERNAME_DOMAIN = 'instantlivefootball.internal';

function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const loginWithUsername = async (username, password) => {
    const email = usernameToEmail(username);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    isAdmin: !!user, // Refine later: check a custom claim or Firestore "admins" doc if you want per-user roles
    initializing,
    loginWithUsername,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
