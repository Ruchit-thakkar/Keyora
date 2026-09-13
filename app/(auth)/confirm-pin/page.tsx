"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePin } from "@/context/PinContext";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ShieldCheck, ArrowLeft, Delete, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ConfirmPinPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { tempPin, setupPin } = usePin();

  const [digits, setDigits] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSecured, setIsSecured] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // 1. Guard against unauthenticated or direct access without initial PIN in memory
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!tempPin) {
      // In-memory PIN lost (e.g. user refreshed or navigated directly) -> return to setup
      router.replace("/setup-pin");
    }
  }, [user, authLoading, tempPin, router]);

  const focusInput = () => {
    if (!isSaving && !isSecured && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  const handleCompleteConfirmation = useCallback(
    async (confirmCandidate: string) => {
      if (!tempPin) {
        router.replace("/setup-pin");
        return;
      }

      if (confirmCandidate !== tempPin) {
        setError("PINs don't match. Please try again.");
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          setDigits("");
        }, 500);
        return;
      }

      setError(null);
      setIsSaving(true);

      const res = await setupPin(confirmCandidate);

      if (res.success) {
        setIsSaving(false);
        setIsSecured(true);
        setTimeout(() => {
          router.replace("/home");
        }, 900);
      } else {
        setIsSaving(false);
        setError(res.error || "Unable to save your security settings. Please try again.");
        setDigits("");
      }
    },
    [tempPin, router, setupPin]
  );

  const handleInputDigit = useCallback(
    (val: string) => {
      if (isSaving || isSecured) return;
      setError(null);

      const cleaned = val.replace(/\D/g, "").slice(0, 4);
      setDigits(cleaned);

      if (cleaned.length === 4) {
        handleCompleteConfirmation(cleaned);
      }
    },
    [isSaving, isSecured, handleCompleteConfirmation]
  );

  const handleKeypadPress = (key: string) => {
    if (isSaving || isSecured) return;

    if (key === "delete") {
      setDigits((prev) => prev.slice(0, -1));
      setError(null);
    } else if (digits.length < 4) {
      const next = digits + key;
      handleInputDigit(next);
    }
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSaving || isSecured) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeypadPress(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleKeypadPress("delete");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, isSecured, digits]);

  // Loading state while checking user
  if (authLoading || (!tempPin && user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-zinc-950 dark:text-white select-none">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-950 dark:border-t-white animate-spin" />
      </div>
    );
  }

  const keypadKeys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "delete"],
  ];

  return (
    <div
      onClick={focusInput}
      className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-black text-zinc-950 dark:text-white p-4 sm:p-6 select-none cursor-default"
    >
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm shadow-md">
            K
          </div>
          <span className="font-bold text-lg tracking-tight">Keyora</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Confirm Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto my-6 bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#222222] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        {/* Chromatic Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600]" />

        {isSecured ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
              PIN secured
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Opening your Keyora vault...
            </p>
          </div>
        ) : isSaving ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-950 dark:text-white" />
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono-code">
              Saving...
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Deriving cryptographic verifier in Web Crypto enclave...
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1.5 mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Confirm your PIN
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                Enter your 4-digit PIN again.
              </p>
            </div>

            {/* Hidden Input for Mobile Soft-Keyboard / Accessibility */}
            <input
              ref={hiddenInputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={digits}
              onChange={(e) => handleInputDigit(e.target.value)}
              className="sr-only"
              aria-label="Confirm 4-digit PIN"
              disabled={isSaving || isSecured}
              autoFocus
            />

            {/* 4 PIN Indicators with Shake Animation on mismatch */}
            <motion.div
              animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center gap-4 my-6"
            >
              {[0, 1, 2, 3].map((index) => {
                const isFilled = digits.length > index;
                return (
                  <div
                    key={index}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all duration-150",
                      isFilled
                        ? "bg-zinc-950 dark:bg-white border-zinc-950 dark:border-white scale-110 shadow-sm"
                        : "bg-transparent border-zinc-300 dark:border-zinc-700",
                      error && "border-rose-500 bg-rose-500/20"
                    )}
                  />
                );
              })}
            </motion.div>

            {/* Error message */}
            <div className="min-h-5 mb-4 flex items-center justify-center">
              {error && (
                <p className="text-xs font-semibold text-rose-500 dark:text-rose-400 text-center animate-fade-in">
                  {error}
                </p>
              )}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
              {keypadKeys.flat().map((key, i) => {
                if (key === "") {
                  return <div key={`empty-${i}`} className="w-16 h-16 mx-auto" />;
                }

                if (key === "delete") {
                  return (
                    <button
                      key="delete"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKeypadPress("delete");
                      }}
                      disabled={isSaving || isSecured || digits.length === 0}
                      className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Delete last digit"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  );
                }

                return (
                  <motion.button
                    key={key}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleKeypadPress(key);
                    }}
                    disabled={isSaving || isSecured}
                    className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#242424] text-xl font-bold font-mono-code text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-[#1c1c1c] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition-colors active:scale-95 disabled:opacity-40"
                  >
                    {key}
                  </motion.button>
                );
              })}
            </div>

            {/* Back to change PIN */}
            <div className="mt-6 text-center">
              <Link
                href="/setup-pin"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Re-enter first PIN</span>
              </Link>
            </div>
          </>
        )}
      </motion.div>

      {/* Reassurance Footer */}
      <div className="max-w-md w-full mx-auto flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600 text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Hardware-backed Web Crypto verifier. Plaintext PIN is never stored.</span>
      </div>
    </div>
  );
}
