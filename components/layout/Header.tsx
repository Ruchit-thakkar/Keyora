"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Shield, Lock } from "lucide-react";
import { usePin } from "@/context/PinContext";

export function Header() {
  const { isUnlocked, lockVault } = usePin();

  return (
    <header className="w-full border-b border-zinc-200 dark:border-[#1e1e1e] bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 group select-none">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-sm">
            K
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base tracking-tight text-zinc-950 dark:text-white">
              Keyora
            </span>
            <span className="text-[10px] font-mono-code font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600]">
              ZERO-KNOWLEDGE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          {isUnlocked && (
            <button
              type="button"
              onClick={lockVault}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 transition-colors"
              title="Lock Vault session"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
