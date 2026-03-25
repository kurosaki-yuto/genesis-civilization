"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import type { RegisteredUser } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function getApp() {
  if (!isConfigured) return null;
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

function getAuthInstance() {
  if (auth) return auth;
  const a = getApp();
  if (!a) return null;
  auth = getAuth(a);
  return auth;
}

function getDb() {
  if (db) return db;
  const a = getApp();
  if (!a) return null;
  db = getFirestore(a);
  return db;
}

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  const authInst = getAuthInstance();
  if (!authInst) {
    console.warn("Firebase not configured");
    return null;
  }
  try {
    const result = await signInWithPopup(authInst, provider);
    const user = result.user;
    const database = getDb();
    if (database) {
      await setDoc(
        doc(database, "users", user.uid),
        {
          name: user.displayName || "名無し",
          trait: "創造",
          registeredAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    return user;
  } catch (error) {
    console.error("Sign in error:", error);
    return null;
  }
}

export async function signOut() {
  const authInst = getAuthInstance();
  if (authInst) await fbSignOut(authInst);
}

export function onAuthChange(callback: (user: User | null) => void) {
  const authInst = getAuthInstance();
  if (!authInst) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(authInst, callback);
}

export function subscribeToUsers(
  callback: (users: RegisteredUser[]) => void
) {
  const database = getDb();
  if (!database) {
    callback([]);
    return () => {};
  }
  return onSnapshot(collection(database, "users"), (snapshot) => {
    const users: RegisteredUser[] = snapshot.docs.map((d) => ({
      uid: d.id,
      name: d.data().name || "名無し",
      trait: d.data().trait || "創造",
      registeredAt: d.data().registeredAt?.toMillis?.() || Date.now(),
    }));
    callback(users);
  });
}
