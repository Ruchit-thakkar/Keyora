"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-lg border-t border-zinc-200 dark:border-[#202020] px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1.5 px-4 rounded-xl transition-all select-none",
                isActive
                  ? "text-zinc-950 dark:text-white font-semibold"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-transform",
                  isActive && "scale-110"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
