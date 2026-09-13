"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types";
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  db,
} from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemoMode: false,
  registerWithEmail: async () => {},
  loginWithEmail: async () => {},
  loginWithGoogle: async () => {},
  continueAsGuest: () => {},
  logout: async () => {},
});

const DEMO_USER_KEY = "keyora_demo_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isFirebaseConfigured;

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          };
          setUser(profile);
          localStorage.setItem(DEMO_USER_KEY, JSON.stringify(profile));
        } else {
          // Check if there is an active local/guest session
          const stored = localStorage.getItem(DEMO_USER_KEY);
          if (stored) {
            try {
              setUser(JSON.parse(stored));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local Enclave Mode
      const stored = localStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, [isDemoMode]);

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        try {
          await updateProfile(userCredential.user, { displayName: name });
        } catch {
          // ignore profile displayName update error
        }

        if (db) {
          try {
            await setDoc(doc(db, "users", userCredential.user.uid), {
              email,
              displayName: name,
              createdAt: serverTimestamp(),
            });
          } catch (dbErr) {
            console.warn("Firestore profile creation notice:", dbErr);
          }
        }

        const newUser: UserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name,
        };
        setUser(newUser);
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(newUser));
      } catch (err: unknown) {
        const fbErr = err as { code?: string; message?: string };
        if (fbErr?.code === "auth/operation-not-allowed") {
          throw new Error(
            "Email/Password sign-in is not yet enabled in Firebase Console. Please go to Firebase Authentication > Sign-in method and enable Email/Password, or click 'Continue as Guest' below."
          );
        } else if (fbErr?.code === "auth/email-already-in-use") {
          throw new Error("An account already exists with this email. Please log in.");
        } else if (fbErr?.code === "auth/weak-password") {
          throw new Error("Password is too weak. Please use at least 8 characters.");
        } else {
          throw new Error(fbErr?.message || "Failed to create account.");
        }
      }
    } else {
      // Local Enclave Mode
      const demoUser: UserProfile = {
        uid: "demo_usr_" + Math.random().toString(36).substring(2, 9),
        email,
        displayName: name,
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const loggedUser: UserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
        };
        setUser(loggedUser);
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(loggedUser));
      } catch (err: unknown) {
        const fbErr = err as { code?: string; message?: string };
        if (fbErr?.code === "auth/operation-not-allowed") {
          throw new Error(
            "Email/Password provider not enabled in Firebase Console. Enable it in Authentication settings or use 'Continue as Guest'."
          );
        } else if (
          fbErr?.code === "auth/invalid-credential" ||
          fbErr?.code === "auth/user-not-found" ||
          fbErr?.code === "auth/wrong-password"
        ) {
          throw new Error("Incorrect email or password. Please try again.");
        } else {
          throw new Error(fbErr?.message || "Failed to sign in.");
        }
      }
    } else {
      let demoUser: UserProfile;
      const stored = localStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        demoUser = JSON.parse(stored);
        demoUser.email = email;
      } else {
        demoUser = {
          uid: "demo_usr_" + Math.random().toString(36).substring(2, 9),
          email,
          displayName: email.split("@")[0],
        };
      }
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
    }
  };

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        if (db) {
          try {
            const userRef = doc(db, "users", result.user.uid);
            const snap = await getDoc(userRef);
            if (!snap.exists()) {
              await setDoc(userRef, {
                email: result.user.email,
                displayName: result.user.displayName,
                createdAt: serverTimestamp(),
              });
            }
          } catch (dbErr) {
            console.warn("Firestore profile sync notice:", dbErr);
          }
        }
        const profile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
        };
        setUser(profile);
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(profile));
      } catch (err: unknown) {
        const fbErr = err as { code?: string; message?: string };
        if (fbErr?.code === "auth/operation-not-allowed") {
          throw new Error(
            "Google sign-in is not yet enabled in Firebase Console. Enable Google provider in Authentication settings."
          );
        } else if (fbErr?.code === "auth/popup-closed-by-user") {
          return;
        } else {
          throw new Error(fbErr?.message || "Google sign-in failed.");
        }
      }
    } else {
      const demoUser: UserProfile = {
        uid: "demo_google_usr",
        email: "alex.demo@gmail.com",
        displayName: "Alex Rivera",
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
    }
  };

  const continueAsGuest = () => {
    const guestUser: UserProfile = {
      uid: "guest_" + Math.random().toString(36).substring(2, 9),
      email: "guest@keyora.vault",
      displayName: "Guest User",
      isAnonymous: true,
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn("Sign out notice:", err);
      }
    }
    localStorage.removeItem(DEMO_USER_KEY);
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
