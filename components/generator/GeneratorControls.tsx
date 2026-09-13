"use client";

import React from "react";
import { GeneratorConfig } from "@/types";
import { Toggle } from "@/components/ui/Toggle";
import { Slider } from "@/components/ui/Slider";

interface GeneratorControlsProps {
  config: GeneratorConfig;
  onChange: (newConfig: GeneratorConfig) => void;
}

export function GeneratorControls({ config, onChange }: GeneratorControlsProps) {
  const handleToggleComplex = (checked: boolean) => {
    onChange({
      ...config,
      complex: checked,
      // If turning complex on, ensure numbersOnly is turned off
      numbersOnly: checked ? false : config.numbersOnly,
    });
  };

  const handleToggleSymbolsAndCaps = (checked: boolean) => {
    onChange({
      ...config,
      symbolsAndCaps: checked,
      // If turning symbols on, ensure numbersOnly is turned off
      numbersOnly: checked ? false : config.numbersOnly,
    });
  };

  const handleToggleNumbersOnly = (checked: boolean) => {
    onChange({
      ...config,
      numbersOnly: checked,
      // If numbers only is activated, disable symbols and caps
      symbolsAndCaps: checked ? false : config.symbolsAndCaps,
      complex: checked ? false : config.complex,
    });
  };

  const handleLengthChange = (length: number) => {
    onChange({
      ...config,
      length,
    });
  };

  return (
    <div className="w-full space-y-5">
      {/* Toggles List */}
      <div className="space-y-1 divide-y divide-zinc-100 dark:divide-[#1f1f1f]">
        <Toggle
          label="Complex"
          description="Include high-entropy symbols, special punctuation, and mixed sets"
          checked={config.complex}
          onChange={handleToggleComplex}
          disabled={config.numbersOnly}
        />

        <Toggle
          label="Symbols & Caps"
          description="Include uppercase characters (A-Z) and standard symbols (!@#$%)"
          checked={config.symbolsAndCaps}
          onChange={handleToggleSymbolsAndCaps}
          disabled={config.numbersOnly}
        />

        <Toggle
          label="Numbers Only"
          description="Strictly numeric digits (0-9). Overrides letters and symbols"
          checked={config.numbersOnly}
          onChange={handleToggleNumbersOnly}
        />
      </div>

      {/* Length Slider */}
      <div className="pt-3 border-t border-zinc-100 dark:border-[#1f1f1f]">
        <Slider
          label="Length"
          value={config.length}
          min={8}
          max={64}
          onChange={handleLengthChange}
        />
      </div>
    </div>
  );
}
