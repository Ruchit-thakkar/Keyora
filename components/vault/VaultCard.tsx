"use client";

import React, { useState, useEffect } from "react";
import { VaultItem } from "@/types";
import { copyToClipboard, getDomain } from "@/lib/utils";
import {
  Globe,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Edit2,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";

interface VaultCardProps {
  item: VaultItem;
  onEdit: (item: VaultItem) => void;
  onDelete: (id: string) => void;
}

export function VaultCard({ item, onEdit, onDelete }: VaultCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState<"user" | "pass" | null>(null);
  const [revealCountdown, setRevealCountdown] = useState<number | null>(null);

  // Auto-hide revealed password after 20 seconds for security
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (isRevealed) {
      setRevealCountdown(20);
      interval = setInterval(() => {
        setRevealCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);

      timer = setTimeout(() => {
        setIsRevealed(false);
        setRevealCountdown(null);
      }, 20000);
    } else {
      setRevealCountdown(null);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isRevealed]);

  const handleCopy = async (text: string, field: "user" | "pass") => {
    if (!text) return;
    const success = await copyToClipboard(text, 45);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const domain = getDomain(item.url);
  const firstLetter = (item.title || "K").charAt(0).toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative rounded-2xl bg-white dark:bg-[#111111] border border-zinc-200/90 dark:border-[#222222] p-4 sm:p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Monogram / Icon & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-900 dark:text-zinc-100 shrink-0 select-none shadow-inner">
            {domain ? (
              <Globe className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            ) : (
              firstLetter
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2">
              <span>{item.title}</span>
              {domain && (
                <a
                  href={item.url?.startsWith("http") ? item.url : `https://${item.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  title={`Open ${domain}`}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {item.username || "No username"}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Edit item"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Delete credential"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Masked Password & Controls Area */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#1c1c1c] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="font-mono-code text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 select-all truncate">
            {isRevealed ? item.password : "••••••••••••••••"}
          </span>
          {revealCountdown !== null && (
            <span className="text-[10px] text-amber-500 font-mono-code px-1.5 py-0.5 rounded bg-amber-500/10 shrink-0">
              {revealCountdown}s
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          {/* Toggle reveal */}
          <button
            type="button"
            onClick={() => setIsRevealed(!isRevealed)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={isRevealed ? "Mask password" : "Reveal password"}
          >
            {isRevealed ? (
              <EyeOff className="w-4 h-4 text-amber-500" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          {/* Copy Username */}
          {item.username && (
            <button
              type="button"
              onClick={() => handleCopy(item.username, "user")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              title="Copy username/email"
            >
              {copiedField === "user" ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">User</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>User</span>
                </>
              )}
            </button>
          )}

          {/* Copy Password */}
          <button
            type="button"
            onClick={() => handleCopy(item.password, "pass")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-2xs"
            title="Copy password"
          >
            {copiedField === "pass" ? (
              <>
                <Check className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Password</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
