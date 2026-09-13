"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "flex items-center justify-between py-2 px-1 cursor-pointer select-none group transition-opacity",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <div className="flex flex-col pr-4">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white transition-colors">
          {label}
        </span>
        {description && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onChange(!checked);
        }}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400",
          checked
            ? "bg-zinc-950 dark:bg-white"
            : "bg-zinc-200 dark:bg-zinc-800"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black shadow-sm ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
