"use client";

import React from "react";
import { PasswordStrength } from "@/types";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
  showFeedback?: boolean;
}

export function PasswordStrengthMeter({
  strength,
  showFeedback = true,
}: PasswordStrengthMeterProps) {
  const { level, score, feedback } = strength;

  const segmentColors = [
    score >= 1
      ? level === "Weak"
        ? "bg-rose-500"
        : "bg-amber-500"
      : "bg-zinc-200 dark:bg-zinc-800",
    score >= 2
      ? level === "Medium"
        ? "bg-amber-500"
        : "bg-emerald-500"
      : "bg-zinc-200 dark:bg-zinc-800",
    score >= 3 ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800",
    score >= 4
      ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 shadow-sm"
      : "bg-zinc-200 dark:bg-zinc-800",
  ];

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {score >= 3 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Security Level
          </span>
        </div>
        <span
          className={cn(
            "text-xs font-semibold tracking-wide uppercase font-mono-code",
            level === "Weak" && "text-rose-500",
            level === "Medium" && "text-amber-500",
            level === "Strong" && "text-emerald-500",
            level === "Very Strong" &&
              "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400"
          )}
        >
          {level}
        </span>
      </div>

      {/* 4 Multi-segment meter */}
      <div className="grid grid-cols-4 gap-1.5 h-2">
        {segmentColors.map((colorClass, i) => (
          <div
            key={i}
            className={cn(
              "h-full rounded-full transition-all duration-300",
              colorClass
            )}
          />
        ))}
      </div>

      {showFeedback && (
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-tight">
          {feedback}
        </p>
      )}
    </div>
  );
}
