"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { generateSalt, derivePinVerifier, verifyPinVerifier } from "@/lib/crypto";
import { isFirebaseConfigured, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { SecurityProfile } from "@/types";

interface PinContextType {
  hasPin: boolean | null;
  pinConfigured: boolean | null;
  loading: boolean;
  isUnlocked: boolean;
  setupPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  verifyAndUnlock: (pin: string) => Promise<boolean>;
  lockVault: () => void;
  changePin: (oldPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
  tempPin: string | null;
  setTempPin: (pin: string | null) => void;
  refreshPinStatus: () => Promise<void>;
}

const PinContext = createContext<PinContextType>({
  hasPin: null,
  pinConfigured: null,
  loading: true,
  isUnlocked: false,
  setupPin: async () => ({ success: false }),
  verifyAndUnlock: async () => false,
  lockVault: () => {},
  changePin: async () => ({ success: false }),
  tempPin: null,
  setTempPin: () => {},
  refreshPinStatus: async () => {},
});

export function PinProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [pinConfigured, setPinConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [securityProfile, setSecurityProfile] = useState<SecurityProfile | null>(null);

  // STRICT IN-MEMORY TEMPORARY PIN STATE (Never persisted to storage, URL, or cookies)
  const [tempPin, setTempPin] = useState<string | null>(null);

  const loadSecuritySettings = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setPinConfigured(null);
      setSecurityProfile(null);
      setIsUnlocked(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (isFirebaseConfigured && db) {
      try {
        const secRef = doc(db, "users", user.uid, "security", "settings");
        const snap = await getDoc(secRef);

        if (snap.exists()) {
          const data = snap.data();
          if (data && data.pinConfigured === true && data.pinVerifier && data.pinSalt) {
            const profile: SecurityProfile = {
              pinSalt: data.pinSalt,
              pinVerifier: data.pinVerifier,
              pinVersion: data.pinVersion || 1,
              pinConfigured: true,
              vaultSalt: data.vaultSalt,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
            setSecurityProfile(profile);
            setPinConfigured(true);
          } else {
            setPinConfigured(false);
            setSecurityProfile(null);
          }
        } else {
          // Check fallback doc if previous version used profile doc
          const fallbackRef = doc(db, "users", user.uid, "security", "profile");
          const fallbackSnap = await getDoc(fallbackRef);
          if (fallbackSnap.exists()) {
            const fbData = fallbackSnap.data();
            const profile: SecurityProfile = {
              pinSalt: fbData.pinSalt,
              pinVerifier: fbData.pinVerifier || fbData.pinHash,
              pinVersion: 1,
              pinConfigured: true,
            };
            setSecurityProfile(profile);
            setPinConfigured(true);
          } else {
            setPinConfigured(false);
            setSecurityProfile(null);
          }
        }
      } catch (err) {
        console.error("Error reading Firestore security settings:", err);
        // If error occurred (e.g. offline), fall back to session/profile state if available
        setPinConfigured(false);
      }
    } else {
      // Local development without Firebase configured
      const local = localStorage.getItem(`keyora_security_${user.uid}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.pinConfigured) {
            setSecurityProfile(parsed);
            setPinConfigured(true);
          } else {
            setPinConfigured(false);
          }
        } catch {
          setPinConfigured(false);
        }
      } else {
        setPinConfigured(false);
      }
    }

    setLoading(false);
  }, [user, authLoading]);

  useEffect(() => {
    loadSecuritySettings();
  }, [loadSecuritySettings]);

  const setupPin = async (
    pin: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return {
        success: false,
        error: "You must be signed in to configure a PIN.",
      };
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return {
        success: false,
        error: "PIN must contain exactly 4 digits.",
      };
    }

    try {
      // Cryptographically derive salt and verifier using Web Crypto API
      const pinSalt = generateSalt(16);
      const vaultSalt = generateSalt(16);
      const pinVerifier = await derivePinVerifier(pin, pinSalt);

      const profilePayload: SecurityProfile = {
        pinSalt,
        pinVerifier,
        pinVersion: 1,
        pinConfigured: true,
        vaultSalt,
      };

      if (isFirebaseConfigured && db) {
        const secRef = doc(db, "users", user.uid, "security", "settings");
        await setDoc(secRef, {
          pinSalt,
          pinVerifier,
          pinVersion: 1,
          pinConfigured: true,
          vaultSalt,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        localStorage.setItem(
          `keyora_security_${user.uid}`,
          JSON.stringify(profilePayload)
        );
      }

      setSecurityProfile(profilePayload);
      setPinConfigured(true);
      setIsUnlocked(true);
      setTempPin(null); // Clear in-memory PIN immediately after derivation

      return { success: true };
    } catch (err: unknown) {
      console.error("Firestore PIN save error:", err);
      const msg =
        err instanceof Error && err.message.includes("offline")
          ? "Unable to save your security settings. Check your internet connection and try again."
          : "Unable to save your security settings. Please try again.";
      return { success: false, error: msg };
    }
  };

  const verifyAndUnlock = async (pin: string): Promise<boolean> => {
    if (!user || !securityProfile) return false;

    try {
      const isValid = await verifyPinVerifier(
        pin,
        securityProfile.pinVerifier,
        securityProfile.pinSalt
      );

      if (isValid) {
        setIsUnlocked(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const lockVault = () => {
    setIsUnlocked(false);
  };

  const changePin = async (
    oldPin: string,
    newPin: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !securityProfile) {
      return { success: false, error: "Security settings not found." };
    }

    const isOldValid = await verifyPinVerifier(
      oldPin,
      securityProfile.pinVerifier,
      securityProfile.pinSalt
    );
    if (!isOldValid) {
      return { success: false, error: "Incorrect current PIN." };
    }

    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return { success: false, error: "New PIN must contain exactly 4 digits." };
    }

    try {
      const newSalt = generateSalt(16);
      const newVerifier = await derivePinVerifier(newPin, newSalt);

      const updatedPayload = {
        pinSalt: newSalt,
        pinVerifier: newVerifier,
        pinVersion: (securityProfile.pinVersion || 1) + 1,
        pinConfigured: true,
        updatedAt: serverTimestamp(),
      };

      if (isFirebaseConfigured && db) {
        const secRef = doc(db, "users", user.uid, "security", "settings");
        await setDoc(secRef, updatedPayload, { merge: true });
      }

      setSecurityProfile((prev) =>
        prev
          ? {
              ...prev,
              pinSalt: newSalt,
              pinVerifier: newVerifier,
              pinVersion: (prev.pinVersion || 1) + 1,
            }
          : null
      );

      return { success: true };
    } catch {
      return {
        success: false,
        error: "Unable to update your security settings. Please try again.",
      };
    }
  };

  return (
    <PinContext.Provider
      value={{
        hasPin: pinConfigured,
        pinConfigured,
        loading: loading || authLoading,
        isUnlocked,
        setupPin,
        verifyAndUnlock,
        lockVault,
        changePin,
        tempPin,
        setTempPin,
        refreshPinStatus: loadSecuritySettings,
      }}
    >
      {children}
    </PinContext.Provider>
  );
}

export const usePin = () => useContext(PinContext);
