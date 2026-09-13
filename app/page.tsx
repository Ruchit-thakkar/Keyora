"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { usePin } from "@/context/PinContext";

export default function RootPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { pinConfigured, loading: pinLoading } = usePin();

  useEffect(() => {
    if (authLoading || pinLoading) return;

    if (!user) {
      router.replace("/login");
    } else if (pinConfigured === false) {
      router.replace("/setup-pin");
    } else {
      router.replace("/home");
    }
  }, [user, authLoading, pinConfigured, pinLoading, router]);

  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-zinc-950 dark:text-white select-none">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <Image
              src="/logo.png"
              alt="Keyora Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Chromatic glow ring */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600] opacity-30 blur-sm -z-10 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-bold text-lg tracking-tight">Keyora</span>
          <span className="text-xs font-mono-code text-zinc-400 dark:text-zinc-500">
            Initializing security enclave...
          </span>
        </div>
      </div>
    </div>
  );
}
