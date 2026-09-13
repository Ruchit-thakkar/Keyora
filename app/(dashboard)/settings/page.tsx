"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { usePin } from "@/context/PinContext";
import { Button } from "@/components/ui/Button";
import { PinPad } from "@/components/security/PinPad";
import {
  Sun,
  Moon,
  Key,
  Lock,
  LogOut,
  ShieldCheck,
  User,
  Database,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const { user, logout, isDemoMode } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isUnlocked, lockVault, changePin } = usePin();

  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [pinStep, setPinStep] = useState<"old" | "new" | "confirm">("old");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);

  const handleOpenChangePin = () => {
    setIsChangePinOpen(true);
    setPinStep("old");
    setOldPin("");
    setNewPin("");
    setPinError(null);
    setPinSuccess(false);
  };

  const handleOldPinSubmit = (pin: string) => {
    setOldPin(pin);
    setPinStep("new");
    setPinError(null);
  };

  const handleNewPinSubmit = (pin: string) => {
    setNewPin(pin);
    setPinStep("confirm");
    setPinError(null);
  };

  const handleConfirmPinSubmit = async (confirmPin: string) => {
    if (confirmPin !== newPin) {
      setPinError("New PINs do not match. Please retry.");
      return;
    }

    const res = await changePin(oldPin, newPin);
    if (res.success) {
      setPinSuccess(true);
      setTimeout(() => {
        setIsChangePinOpen(false);
      }, 1500);
    } else {
      setPinError(res.error || "Failed to update PIN. Verify your old PIN.");
      setPinStep("old");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto select-none">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Settings & Security
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Manage your interface preferences, PIN security, and encryption status.
        </p>
      </div>

      {/* 1. Theme Configuration */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#222222] p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono-code text-[11px]">
          Appearance Theme
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
              theme === "dark"
                ? "bg-zinc-950 text-white border-zinc-950 dark:border-white shadow-sm ring-1 ring-white/20"
                : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <div className="p-2 rounded-xl bg-black text-white border border-zinc-800">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Dark Mode</p>
              <p className="text-[11px] opacity-70">Pitch black security aesthetic</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
              theme === "light"
                ? "bg-white text-zinc-950 border-zinc-950 shadow-sm ring-1 ring-zinc-950/20"
                : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <div className="p-2 rounded-xl bg-zinc-200 text-zinc-900 border border-zinc-300">
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Light Mode</p>
              <p className="text-[11px] opacity-70">Clean high-contrast layout</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Security PIN & Vault Lock */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#222222] p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono-code text-[11px]">
          Vault Protection & PIN
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  4-Digit Security PIN
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Secures your encryption keys and session unlocks
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleOpenChangePin}>
              Change PIN
            </Button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Session Lock Status
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isUnlocked ? "Vault is currently unlocked" : "Vault is locked"}
                </p>
              </div>
            </div>
            {isUnlocked && (
              <Button size="sm" variant="outline" onClick={lockVault}>
                Lock Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Cryptography & Storage Diagnostics */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#222222] p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono-code text-[11px]">
          Architecture Diagnostics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Client Cryptography</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-mono-code">
              AES-GCM-256 + PBKDF2 (SHA-256)
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Storage Backend</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-mono-code">
              {isDemoMode ? "Local Zero-Knowledge Enclave" : "Firebase Cloud Firestore"}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Account Profile & Logout */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#222222] p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono-code text-[11px]">
          Account
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-900 dark:text-zinc-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {user?.displayName || "Keyora Account"}
              </p>
              <p className="text-xs text-zinc-400">{user?.email}</p>
            </div>
          </div>

          <Button variant="danger" size="sm" onClick={logout}>
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Change PIN Modal */}
      <AnimatePresence>
        {isChangePinOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-[#0e0e0e] border border-zinc-200 dark:border-[#242424] rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-100 dark:border-[#222222]">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Change Security PIN
                </h3>
                <button
                  type="button"
                  onClick={() => setIsChangePinOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {pinSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  <p className="font-bold text-sm text-zinc-900 dark:text-white">
                    PIN Updated Successfully
                  </p>
                </div>
              ) : pinStep === "old" ? (
                <PinPad
                  title="Current PIN"
                  subtitle="Enter your existing 4-digit PIN."
                  error={pinError}
                  clearError={() => setPinError(null)}
                  onComplete={handleOldPinSubmit}
                />
              ) : pinStep === "new" ? (
                <PinPad
                  title="New PIN"
                  subtitle="Choose a new 4-digit security PIN."
                  error={pinError}
                  clearError={() => setPinError(null)}
                  onComplete={handleNewPinSubmit}
                />
              ) : (
                <PinPad
                  title="Confirm New PIN"
                  subtitle="Re-enter your new PIN to confirm."
                  error={pinError}
                  clearError={() => setPinError(null)}
                  onComplete={handleConfirmPinSubmit}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
