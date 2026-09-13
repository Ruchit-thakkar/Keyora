"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { generatePassword, calculateStrength } from "@/lib/generator";
import { GeneratorConfig } from "@/types";
import { PasswordDisplay } from "@/components/generator/PasswordDisplay";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { GeneratorControls } from "@/components/generator/GeneratorControls";
import { SavePasswordModal } from "@/components/generator/SavePasswordModal";
import { Button } from "@/components/ui/Button";
import { useVault } from "@/context/VaultContext";
import { RefreshCw, BookmarkPlus, ShieldCheck, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { items } = useVault();

  const [config, setConfig] = useState<GeneratorConfig>({
    length: 20,
    complex: true,
    symbolsAndCaps: true,
    numbersOnly: false,
  });

  const [password, setPassword] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleRegenerate = useCallback(() => {
    const fresh = generatePassword(config);
    setPassword(fresh);
  }, [config]);

  // Initial password generation and regeneration on config change
  useEffect(() => {
    handleRegenerate();
  }, [handleRegenerate]);

  const strength = calculateStrength(password);

  return (
    <div className="space-y-6 max-w-2xl mx-auto select-none">
      {/* Page Title & Vault Quick Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Password Generator
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Generate zero-knowledge cryptographically strong credentials.
          </p>
        </div>

        <Link
          href="/vault"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-colors shadow-2xs group"
        >
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vault</span>
          <span className="font-mono-code px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400">
            {items.length}
          </span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Main Generator Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#222222] p-5 sm:p-7 shadow-lg relative overflow-hidden space-y-6"
      >
        {/* Subtle chromatic top edge accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600]" />

        {/* 1. Generated Password Display Area */}
        <PasswordDisplay
          password={password}
          onRegenerate={handleRegenerate}
          isVeryStrong={strength.level === "Very Strong"}
        />

        {/* 2. Security Level Progress & Indicator */}
        <div className="pt-2 border-t border-zinc-100 dark:border-[#1c1c1c]">
          <PasswordStrengthMeter strength={strength} />
        </div>

        {/* 3. Generator Controls (Complex, Symbols & Caps, Numbers Only, Length) */}
        <div className="pt-2 border-t border-zinc-100 dark:border-[#1c1c1c]">
          <GeneratorControls config={config} onChange={setConfig} />
        </div>

        {/* 4. Action Buttons (Regenerate, Save to Vault) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-[#1c1c1c] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleRegenerate}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Regenerate</span>
          </Button>

          <Button
            type="button"
            size="md"
            onClick={() => setIsSaveModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <BookmarkPlus className="w-4 h-4 mr-1.5 text-cyan-400" />
            <span>Save to Vault</span>
          </Button>
        </div>
      </motion.div>

      {/* Security Reassurance Callout */}
      <div className="p-4 rounded-2xl bg-zinc-100/60 dark:bg-[#0c0c0c]/80 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            True Cryptographic Randomness
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">
            Passwords are generated client-side using the browser&apos;s CSPRNG (
            <code className="font-mono-code text-[11px]">crypto.getRandomValues</code>).
            No passwords ever touch a network during generation.
          </p>
        </div>
      </div>

      {/* Save to Vault Modal */}
      <SavePasswordModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        initialPassword={password}
      />
    </div>
  );
}
