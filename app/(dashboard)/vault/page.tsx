"use client";

import React, { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { usePin } from "@/context/PinContext";
import { VaultCard } from "@/components/vault/VaultCard";
import { VaultSearch } from "@/components/vault/VaultSearch";
import { AddItemModal } from "@/components/vault/AddItemModal";
import { PinPad } from "@/components/security/PinPad";
import { VaultItem } from "@/types";
import { Shield, Lock, ShieldAlert, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VaultPage() {
  const { filteredItems, searchQuery, setSearchQuery, deleteItem, loading } =
    useVault();
  const { isUnlocked, verifyAndUnlock } = usePin();

  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);

  const handleUnlockSubmit = async (pin: string) => {
    setIsVerifying(true);
    setPinError(null);

    const success = await verifyAndUnlock(pin);
    setIsVerifying(false);

    if (!success) {
      setPinError("Incorrect PIN. Please try again.");
    }
  };

  const handleOpenEdit = (item: VaultItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  // 1. PIN Gatekeeper Screen (if vault is locked)
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto py-12 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-[#222222] p-6 sm:p-8 shadow-xl relative overflow-hidden text-center"
        >
          {/* Subtle Chromatic Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0055] via-[#00e5ff] to-[#ffe600]" />

          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mx-auto flex items-center justify-center text-zinc-900 dark:text-white mb-3 shadow-inner">
            <Lock className="w-6 h-6 text-cyan-400" />
          </div>

          <PinPad
            title="Unlock Keyora Vault"
            subtitle="Enter your 4-digit PIN to decrypt your stored credentials."
            error={pinError}
            clearError={() => setPinError(null)}
            onComplete={handleUnlockSubmit}
            disabled={isVerifying}
          />
        </motion.div>
      </div>
    );
  }

  // 2. Unlocked Vault View
  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Encrypted Vault
            </h1>
            <span className="text-[10px] font-mono-code font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              AES-GCM-256
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Decrypted in memory with your client-side master key.
          </p>
        </div>
      </div>

      {/* Search Bar & Add Button */}
      <div className="p-2 sm:p-3 rounded-2xl bg-zinc-50/80 dark:bg-[#0c0c0c]/80 border border-zinc-200/80 dark:border-[#202020]">
        <VaultSearch
          query={searchQuery}
          onChange={setSearchQuery}
          count={filteredItems.length}
          onAddNew={() => {
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
        />
      </div>

      {/* Vault Items List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-7 h-7 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-950 dark:border-t-white animate-spin" />
          <p className="text-xs font-mono-code text-zinc-400">
            Decrypting vault entries...
          </p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <VaultCard
                key={item.id}
                item={item}
                onEdit={handleOpenEdit}
                onDelete={deleteItem}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-10 text-center space-y-4 my-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            {searchQuery ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <Shield className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {searchQuery ? "No matching passwords found" : "Your vault is empty"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              {searchQuery
                ? `No credentials found matching "${searchQuery}". Try a different search term.`
                : "Generate strong passwords from the generator or add existing credentials manually."}
            </p>
          </div>
          {!searchQuery && (
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Add Your First Password
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Add / Edit Credential Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editingItem={editingItem}
      />
    </div>
  );
}
