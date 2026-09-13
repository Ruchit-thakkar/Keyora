"use client";

import React, { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import confetti from "canvas-confetti";

interface PasswordDisplayProps {
  password: string;
  onRegenerate: () => void;
  isVeryStrong?: boolean;
}

export function PasswordDisplay({
  password,
  onRegenerate,
  isVeryStrong = false,
}: PasswordDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!password) return;
    const success = await copyToClipboard(password, 45);
    if (success) {
      setCopied(true);
      if (isVeryStrong) {
        try {
          confetti({
            particleCount: 25,
            spread: 60,
            origin: { y: 0.8 },
            colors: ["#00e5ff", "#ff0055", "#ffe600"],
          });
        } catch {
          // ignore if canvas unavailable
        }
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Generated Password
        </label>
        <button
          type="button"
          onClick={onRegenerate}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 transition-colors group p-1"
          title="Regenerate password"
        >
          <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
          <span className="hidden sm:inline">Regenerate</span>
        </button>
      </div>

      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#242424] rounded-2xl p-3.5 sm:p-4 transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
        <div className="overflow-x-auto overflow-y-hidden py-1">
          <span className="font-mono-code text-lg sm:text-xl font-bold tracking-wider text-zinc-950 dark:text-zinc-100 select-all break-all whitespace-pre-wrap">
            {password || "••••••••••••••••"}
          </span>
        </div>

        <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200/60 dark:border-zinc-800/60">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-95 ${
              copied
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100 border border-zinc-300/60 dark:border-zinc-700/60"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ctrl+C</span>
                <span className="sm:hidden">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
