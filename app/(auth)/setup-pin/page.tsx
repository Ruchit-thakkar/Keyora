"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePin } from "@/context/PinContext";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ShieldCheck, Delete } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SetupPinPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { pinConfigured, loading: pinLoading, setTempPin } = usePin();

  const [digits, setDigits] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Hidden native input ref for screen readers & native mobile numeric keyboard support
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // 1. Authentication & Duplicate Setup Guards
  useEffect(() => {
    if (authLoading || pinLoading) return;

    if (!user) {
      // Unauthenticated -> redirect to login
      router.replace("/login");
      return;
    }

    if (pinConfigured === true) {
      // PIN already set up -> redirect to home
      router.replace("/home");
      return;
    }
  }, [user, authLoading, pinLoading, pinConfigured, router]);

  // Keep hidden input focused on desktop/click
  const focusInput = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  // Advance to /confirm-pin once 4 digits entered
  const handleComplete = useCallback(
    (pin: string) => {
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        setError("PIN must contain exactly 4 digits.");
        return;
      }
      setIsNavigating(true);
      // Store STRICTLY in temporary in-memory React state
      setTempPin(pin);
      // Transition smoothly
      setTimeout(() => {
        router.push("/confirm-pin");
      }, 120);
    },
    [router, setTempPin]
  );

  const handleInputDigit = useCallback(
    (val: string) => {
      if (isNavigating) return;
      setError(null);

      // Only allow digits 0-9
      const cleaned = val.replace(/\D/g, "").slice(0, 4);
      setDigits(cleaned);

      if (cleaned.length === 4) {
        handleComplete(cleaned);
      }
    },
    [isNavigating, handleComplete]
  );

  const handleKeypadPress = (key: string) => {
    if (isNavigating) return;
    if (key === "delete") {
      setDigits((prev) => prev.slice(0, -1));
      setError(null);
    } else if (digits.length < 4) {
      const next = digits + key;
      handleInputDigit(next);
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNavigating) return;
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
  }, [isNavigating, digits]);

  // Minimal Keyora loading screen while Firebase Auth resolves
  if (authLoading || pinLoading || isNavigating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-zinc-950 dark:text-white select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xl shadow-lg">
              K
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600] opacity-40 blur-sm -z-10 animate-pulse" />
          </div>
          <p className="text-xs font-mono-code text-zinc-400 dark:text-zinc-500">
            {isNavigating ? "Securing PIN..." : "Loading security enclave..."}
          </p>
        </div>
      </div>
    );
  }

  // If no user after loading, layout will redirect
  if (!user || pinConfigured === true) {
    return null;
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

      {/* Main PIN Setup Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto my-6 bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#222222] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        {/* Chromatic Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600]" />

        <div className="text-center space-y-1.5 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Create your PIN
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
            Your 4-digit PIN protects access to your Keyora vault.
          </p>
        </div>

        {/* Hidden password input for accessibility & mobile software keyboards */}
        <input
          ref={hiddenInputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={digits}
          onChange={(e) => handleInputDigit(e.target.value)}
          className="sr-only"
          aria-label="Enter 4-digit PIN"
          autoFocus
        />

        {/* 4 PIN Indicators */}
        <div className="flex items-center justify-center gap-4 my-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = digits.length > index;
            return (
              <div
                key={index}
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all duration-150",
                  isFilled
                    ? "bg-zinc-950 dark:bg-white border-zinc-950 dark:border-white scale-110 shadow-sm"
                    : "bg-transparent border-zinc-300 dark:border-zinc-700"
                )}
              />
            );
          })}
        </div>

        {/* Error message */}
        <div className="min-h-5 mb-4 flex items-center justify-center">
          {error && (
            <p className="text-xs font-semibold text-rose-500 dark:text-rose-400 text-center animate-fade-in">
              {error}
            </p>
          )}
        </div>

        {/* Custom Keyora 3x4 Numeric Keypad */}
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
                  disabled={digits.length === 0}
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
                className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#242424] text-xl font-bold font-mono-code text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-[#1c1c1c] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition-colors active:scale-95"
              >
                {key}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Reassurance Footer */}
      <div className="max-w-md w-full mx-auto flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600 text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Hardware-backed Web Crypto verifier. Plaintext PIN is never stored.</span>
      </div>
    </div>
  );
}
