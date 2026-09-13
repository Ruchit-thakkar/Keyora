"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "characters",
  onChange,
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full space-y-3 select-none", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {label}
          </span>
        )}
        <div className="flex items-baseline gap-1 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700/60">
          <span className="text-sm font-bold font-mono-code text-zinc-950 dark:text-white">
            {value}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {unit}
          </span>
        </div>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-white focus:outline-none"
          style={{
            background: `linear-gradient(to right, var(--text-primary) 0%, var(--text-primary) ${percentage}%, var(--border-subtle) ${percentage}%, var(--border-subtle) 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-mono-code text-zinc-400 dark:text-zinc-500 px-0.5">
        <span>{min}</span>
        <span>{Math.round((min + max) / 2)}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
