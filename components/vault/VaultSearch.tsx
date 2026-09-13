"use client";

import React from "react";
import { Search, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface VaultSearchProps {
  query: string;
  onChange: (q: string) => void;
  count: number;
  onAddNew: () => void;
}

export function VaultSearch({
  query,
  onChange,
  count,
  onAddNew,
}: VaultSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search vault by app, username, or website..."
          className="w-full rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-[#222222] pl-10 pr-9 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-all shadow-2xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <span className="text-xs font-mono-code text-zinc-400 dark:text-zinc-500">
          {count} {count === 1 ? "item" : "items"}
        </span>
        <Button size="sm" onClick={onAddNew} className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" />
          <span>Add Password</span>
        </Button>
      </div>
    </div>
  );
}
