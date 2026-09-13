"use client";

import React, { useState, useEffect } from "react";
import { VaultItem } from "@/types";
import { useVault } from "@/context/VaultContext";
import { generatePassword } from "@/lib/generator";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Globe, User, Key, FileText, X, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: VaultItem | null;
}

export function AddItemModal({
  isOpen,
  onClose,
  editingItem = null,
}: AddItemModalProps) {
  const { addItem, updateItem } = useVault();

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setUsername(editingItem.username);
      setPassword(editingItem.password);
      setUrl(editingItem.url || "");
      setNotes(editingItem.notes || "");
    } else {
      setTitle("");
      setUsername("");
      setPassword(
        generatePassword({
          length: 20,
          complex: true,
          symbolsAndCaps: true,
          numbersOnly: false,
        })
      );
      setUrl("");
      setNotes("");
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleGenerateFresh = () => {
    setPassword(
      generatePassword({
        length: 20,
        complex: true,
        symbolsAndCaps: true,
        numbersOnly: false,
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !password) return;

    setIsSubmitting(true);

    if (editingItem) {
      await updateItem(editingItem.id, {
        title: title.trim(),
        username: username.trim(),
        password,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      await addItem({
        title: title.trim(),
        username: username.trim(),
        password,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
        category: "login",
        favorite: false,
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#0e0e0e] border border-zinc-200 dark:border-[#242424] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* RGB accent edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600]" />

        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-[#222222]">
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            {editingItem ? "Edit Password" : "Add New Password"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Website or Service Name *"
            placeholder="e.g. Netflix, Amazon, GitLab"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            leftIcon={<Globe className="w-4 h-4" />}
          />

          <Input
            label="Username / Email"
            placeholder="e.g. user@gmail.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password *
              </label>
              <button
                type="button"
                onClick={handleGenerateFresh}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Generate New</span>
              </button>
            </div>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] pl-10 pr-3.5 py-2.5 text-sm font-mono-code text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
            </div>
          </div>

          <Input
            label="Website URL (Optional)"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Encrypted Notes
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Recovery questions, backup PIN, secondary emails..."
                className="w-full rounded-xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#262626] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400"
              />
              <FileText className="w-4 h-4 text-zinc-400 dark:text-zinc-600 absolute right-3 bottom-3 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingItem ? "Save Changes" : "Add to Vault"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
