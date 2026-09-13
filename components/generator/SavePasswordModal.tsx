"use client";

import React, { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { usePin } from "@/context/PinContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PinPad } from "@/components/security/PinPad";
import { Globe, User, Key, FileText, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SavePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPassword: string;
}

export function SavePasswordModal({
  isOpen,
  onClose,
  initialPassword,
}: SavePasswordModalProps) {
  const { addItem } = useVault();
  const { isUnlocked, verifyAndUnlock } = usePin();

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(initialPassword);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"form" | "pin" | "success">("form");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync password when opened
  React.useEffect(() => {
    if (isOpen) {
      setPassword(initialPassword);
      setStep("form");
      setPinError(null);
    }
  }, [isOpen, initialPassword]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !password) return;

    if (isUnlocked) {
      await executeSave();
    } else {
      setStep("pin");
    }
  };

  const executeSave = async () => {
    setIsSaving(true);
    const res = await addItem({
      title: title.trim(),
      username: username.trim(),
      password,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      category: "login",
      favorite: false,
    });

    setIsSaving(false);
    if (res) {
      setStep("success");
      setTimeout(() => {
        onClose();
        // Reset state
        setTitle("");
        setUsername("");
        setNotes("");
        setUrl("");
        setStep("form");
      }, 1200);
    }
  };

  const handlePinSubmit = async (pin: string) => {
    setPinError(null);
    const valid = await verifyAndUnlock(pin);
    if (valid) {
      await executeSave();
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#0e0e0e] border border-zinc-200 dark:border-[#242424] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Chromatic RGB Accent Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600]" />

        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-[#222222]">
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            {step === "pin"
              ? "Verify PIN to Encrypt"
              : step === "success"
              ? "Saved to Vault"
              : "Save to Vault"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleFormSubmit}
              className="space-y-4"
            >
              <Input
                label="Website or Service Name *"
                placeholder="e.g. Google, GitHub, Stripe"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                leftIcon={<Globe className="w-4 h-4" />}
              />

              <Input
                label="Username / Email"
                placeholder="e.g. user@gmail.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-mono-code"
                leftIcon={<Key className="w-4 h-4" />}
              />

              <Input
                label="Website URL (Optional)"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Notes (Optional & Encrypted)
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Recovery codes, PIN notes, or security questions..."
                    className="w-full rounded-xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
                  />
                  <FileText className="w-4 h-4 text-zinc-400 dark:text-zinc-600 absolute right-3 bottom-3 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  Save to Vault
                </Button>
              </div>
            </motion.form>
          )}

          {step === "pin" && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-2"
            >
              <PinPad
                title="Enter Security PIN"
                subtitle="Your 4-digit PIN secures your client-side encryption key."
                error={pinError}
                clearError={() => setPinError(null)}
                onComplete={handlePinSubmit}
                disabled={isSaving}
              />
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  ← Back to Details
                </button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Encrypted & Stored
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                Your credential has been encrypted with AES-256-GCM and saved to your Keyora vault.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
