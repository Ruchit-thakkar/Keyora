"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Delete, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PinPadProps {
  onComplete: (pin: string) => void;
  error?: string | null;
  clearError?: () => void;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
  actionText?: string;
}

export function PinPad({
  onComplete,
  error,
  clearError,
  title,
  subtitle,
  disabled = false,
  actionText,
}: PinPadProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const isCompletingRef = useRef(false);

  // Trigger shake on error
  useEffect(() => {
    if (error) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
        setDigits([]);
        isCompletingRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAddDigit = useCallback(
    (digit: string) => {
      if (disabled || isCompletingRef.current || digits.length >= 4) return;
      if (error && clearError) clearError();

      const newDigits = [...digits, digit];
      setDigits(newDigits);

      if (newDigits.length === 4) {
        isCompletingRef.current = true;
        // Give 120ms for the 4th dot fill animation before notifying parent
        setTimeout(() => {
          onComplete(newDigits.join(""));
        }, 120);
      }
    },
    [disabled, digits, error, clearError, onComplete]
  );

  const handleDelete = useCallback(() => {
    if (disabled || digits.length === 0) return;
    if (error && clearError) clearError();
    isCompletingRef.current = false;
    setDigits((prev) => prev.slice(0, -1));
  }, [disabled, digits, error, clearError]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (/^[0-9]$/.test(e.key)) {
        handleAddDigit(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, handleAddDigit, handleDelete]);

  const keypadKeys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "delete"],
  ];

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center select-none">
      {title && (
        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white text-center mb-1">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-6 max-w-[260px] leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* 4-digit Indicator Dots with Shake */}
      <motion.div
        animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4 my-4"
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

      {/* Error display */}
      <div className="min-h-5 mb-3 flex items-center justify-center">
        {error ? (
          <p className="text-xs font-semibold text-rose-500 dark:text-rose-400 text-center animate-fade-in">
            {error}
          </p>
        ) : digits.length > 0 && digits.length < 4 ? (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono-code">
            {4 - digits.length} more {4 - digits.length === 1 ? "digit" : "digits"} needed
          </p>
        ) : null}
      </div>

      {/* 3x4 Tactile Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full mb-4">
        {keypadKeys.flat().map((key, i) => {
          if (key === "") {
            return <div key={`empty-${i}`} className="w-16 h-16 mx-auto" />;
          }

          if (key === "delete") {
            return (
              <button
                key="delete"
                type="button"
                onClick={handleDelete}
                disabled={disabled || digits.length === 0}
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
              onClick={() => handleAddDigit(key)}
              disabled={disabled || digits.length >= 4}
              className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#242424] text-xl font-bold font-mono-code text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-[#1c1c1c] hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition-colors duration-150 disabled:opacity-40"
            >
              {key}
            </motion.button>
          );
        })}
      </div>

      {/* Action Button (Optional per spec e.g. "Continue") */}
      {actionText && (
        <button
          type="button"
          onClick={() => {
            if (digits.length === 4) {
              onComplete(digits.join(""));
            }
          }}
          disabled={disabled || digits.length !== 4}
          className="w-full py-3 px-4 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-1 active:scale-[0.98]"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
