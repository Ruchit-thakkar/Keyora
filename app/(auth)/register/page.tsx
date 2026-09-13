"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { calculateStrength } from "@/lib/generator";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Eye, EyeOff, User, Mail, Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const strength = calculateStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await registerWithEmail(name.trim(), email.trim(), password);
      // Per spec: Do not immediately send user to Home -> Go to Set PIN
      router.push("/setup-pin");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create account.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/setup-pin");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Google sign-in failed.";
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-black text-zinc-950 dark:text-white p-4 sm:p-6 select-none">
      {/* Top Bar with brand and theme toggle */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm shadow-md">
            K
          </div>
          <span className="font-bold text-lg tracking-tight">Keyora</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Registration Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full mx-auto my-8 bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#222222] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        {/* Chromatic Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600]" />

        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Create your Keyora account
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Zero-knowledge security. Your master keys never leave your browser.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <Input
              label="Master Password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {password.length > 0 && (
              <div className="pt-2">
                <PasswordStrengthMeter strength={strength} />
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-2"
            isLoading={loading}
            disabled={!name || !email || !password || loading}
          >
            Create Account
          </Button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-[#222222]" />
          </div>
          <span className="relative bg-white dark:bg-[#0c0c0c] px-3 text-xs uppercase tracking-wider text-zinc-400 font-mono-code">
            OR
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-zinc-950 dark:text-white underline underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Log in
          </Link>
        </div>
      </motion.div>

      {/* Footer reassurance */}
      <div className="max-w-md w-full mx-auto flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>End-to-end encrypted with Web Crypto AES-256-GCM</span>
      </div>
    </div>
  );
}
