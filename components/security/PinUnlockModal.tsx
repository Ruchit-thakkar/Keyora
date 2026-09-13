"use client";

import React, { useState } from "react";
import { PinPad } from "./PinPad";
import { usePin } from "@/context/PinContext";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

interface PinUnlockModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  canCancel?: boolean;
}

export function PinUnlockModal({
  isOpen,
  onSuccess,
  onCancel,
  canCancel = false,
}: PinUnlockModalProps) {
  const { verifyAndUnlock } = usePin();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handlePinComplete = async (pin: string) => {
    setIsVerifying(true);
    setError(null);

    const success = await verifyAndUnlock(pin);
    setIsVerifying(false);

    if (success) {
      if (onSuccess) onSuccess();
    } else {
      setError("Incorrect PIN. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-sm bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-[#222222] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle RGB accent top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600]" />

        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-inner">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <PinPad
          title="Unlock Keyora Vault"
          subtitle="Enter your 4-digit PIN to decrypt your vault items."
          error={error}
          clearError={() => setError(null)}
          onComplete={handlePinComplete}
          disabled={isVerifying}
        />

        {canCancel && onCancel && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
