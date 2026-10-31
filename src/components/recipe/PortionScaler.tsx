'use client';

import React from 'react';
import { Users, Minus, Plus } from 'lucide-react';

interface PortionScalerProps {
  multiplier: number;
  onMultiplierChange: (newMult: number) => void;
  baseServings?: string;
}

export default function PortionScaler({
  multiplier,
  onMultiplierChange,
  baseServings = '4 Porsi',
}: PortionScalerProps) {
  const baseNum = parseInt(baseServings.replace(/[^0-9]/g, '')) || 4;
  const currentServings = Math.round(baseNum * multiplier);

  const handleDecrease = () => {
    if (multiplier > 0.5) {
      onMultiplierChange(Number(Math.max(0.5, multiplier - 0.5).toFixed(1)));
    }
  };

  const handleIncrease = () => {
    if (multiplier < 5) {
      onMultiplierChange(Number((multiplier + 0.5).toFixed(1)));
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 bg-surface dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
            Porsi Masakan
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {currentServings} Porsi ({multiplier}x takaran)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrease}
          disabled={multiplier <= 0.5}
          className="w-7 h-7 rounded-lg bg-zinc-200/70 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 disabled:opacity-40 hover:bg-zinc-300 transition-colors"
          title="Kurangi porsi"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="font-mono font-black text-sm w-8 text-center text-primary">
          {multiplier}x
        </span>
        <button
          onClick={handleIncrease}
          disabled={multiplier >= 5}
          className="w-7 h-7 rounded-lg bg-zinc-200/70 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 disabled:opacity-40 hover:bg-zinc-300 transition-colors"
          title="Tambah porsi"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
