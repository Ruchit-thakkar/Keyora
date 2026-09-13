"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePin } from "@/context/PinContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { pinConfigured, loading: pinLoading } = usePin();

  useEffect(() => {
    if (authLoading || pinLoading) return;

    if (!user) {
      router.replace("/login");
    } else if (pinConfigured === false) {
      router.replace("/setup-pin");
    }
  }, [user, authLoading, pinConfigured, pinLoading, router]);

  if (authLoading || pinLoading || !user || pinConfigured === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-zinc-950 dark:text-white select-none">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-950 dark:border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-black text-zinc-950 dark:text-white">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Mobile Header */}
        <div className="md:hidden">
          <Header />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
