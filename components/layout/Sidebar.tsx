"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePin } from "@/context/PinContext";
import { ThemeToggle } from "./ThemeToggle";
import { KeyRound, Shield, Settings, Lock, Unlock, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isDemoMode } = useAuth();
  const { isUnlocked, lockVault } = usePin();

  const navLinks = [
    {
      href: "/home",
      label: "Generator",
      icon: KeyRound,
    },
    {
      href: "/vault",
      label: "Vault",
      icon: Shield,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-zinc-200 dark:border-[#1e1e1e] bg-white dark:bg-[#070707] p-5 justify-between select-none">
      {/* Top Branding */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-md shrink-0 border border-zinc-200 dark:border-zinc-800">
              <Image
                src="/logo.png"
                alt="Keyora Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-zinc-950 dark:text-white leading-none">
                Keyora
              </h1>
              <p className="text-[10px] font-mono-code font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600] mt-1">
                ENCRYPTED VAULT
              </p>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        {/* Demo Mode Badge if live Firebase is pending */}
        {isDemoMode && (
          <div className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                Mode
              </span>
              <span className="text-[10px] font-mono-code font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500">
                LOCAL CRYPTO
              </span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="space-y-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Area & Session Lock */}
      <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-[#1e1e1e]">
        {/* Lock status banner */}
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            {isUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Session Unlocked</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Vault Locked</span>
              </>
            )}
          </div>
          {isUnlocked && (
            <button
              type="button"
              onClick={lockVault}
              className="text-[11px] font-medium text-zinc-500 hover:text-rose-500 transition-colors"
            >
              Lock now
            </button>
          )}
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {user?.displayName || "Keyora User"}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                {user?.email || "Encrypted Session"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
