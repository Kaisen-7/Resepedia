'use client';

import React from 'react';
import { Users, Minus, Plus, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { playClickSound } from '@/lib/utils/sound-effects';

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
  const { t, language } = useLanguage();
  const baseNum = parseInt(baseServings.replace(/[^0-9]/g, '')) || 4;
  const currentServings = Math.round(baseNum * multiplier);

  const presets = [
    { label: language === 'en' ? 'Solo' : '1 Orang', mult: 1 / baseNum, desc: '🧍 ' + (language === 'en' ? 'Solo Traveler' : 'Pengelana Tunggal') },
    { label: language === 'en' ? 'Duo' : 'Berdua', mult: 2 / baseNum, desc: '👥 ' + (language === 'en' ? 'Duo Feast' : 'Jamuan Berdua') },
    { label: language === 'en' ? 'Party' : '4 Orang', mult: 4 / baseNum, desc: '⛺ ' + (language === 'en' ? 'Small Party' : 'Rombongan') },
    { label: language === 'en' ? 'Feast' : 'Kenduri', mult: 8 / baseNum, desc: '🏰 ' + (language === 'en' ? 'Grand Banquet' : 'Kenduri Agung') },
  ];

  const handleDecrease = () => {
    playClickSound();
    if (multiplier > 0.5) {
      onMultiplierChange(Number(Math.max(0.5, multiplier - 0.5).toFixed(1)));
    }
  };

  const handleIncrease = () => {
    playClickSound();
    if (multiplier < 5) {
      onMultiplierChange(Number((multiplier + 0.5).toFixed(1)));
    }
  };

  const handleSelectPreset = (mult: number) => {
    playClickSound();
    const cleanMult = Number(Math.max(0.25, Math.min(5, mult)).toFixed(2));
    onMultiplierChange(cleanMult);
  };

  return (
    <div className="p-3.5 bg-[#EFE4CE] dark:bg-[#2C1E16] rounded-2xl border-2 border-[#5C3A21]/40 dark:border-[#8C6239]/50 shadow-[3px_3px_0px_#2C1E16] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C85A32] text-white flex items-center justify-center border border-[#2C1E16] shadow-[1px_1px_0px_#2C1E16]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-[#2C1E16] dark:text-[#F6EFE2] block">
              {language === 'en' ? 'Party Size & Portions' : 'Ukuran Rombongan & Porsi'}
            </span>
            <span className="text-[11px] font-semibold text-[#5C3A21] dark:text-[#D9C8AA]">
              {currentServings} {language === 'en' ? 'Servings' : 'Porsi'} ({multiplier}x {t('takaran')})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDecrease}
            disabled={multiplier <= 0.5}
            className="w-7 h-7 rounded-lg bg-[#FCF9F2] dark:bg-[#422B1D] border border-[#5C3A21] flex items-center justify-center text-[#2C1E16] dark:text-[#F6EFE2] disabled:opacity-40 hover:bg-[#E2D1B0] transition-colors active:translate-y-0.5"
            title={t('Kurangi porsi')}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono font-black text-xs w-9 text-center text-[#C85A32] dark:text-[#E26E45]">
            {multiplier}x
          </span>
          <button
            onClick={handleIncrease}
            disabled={multiplier >= 5}
            className="w-7 h-7 rounded-lg bg-[#FCF9F2] dark:bg-[#422B1D] border border-[#5C3A21] flex items-center justify-center text-[#2C1E16] dark:text-[#F6EFE2] disabled:opacity-40 hover:bg-[#E2D1B0] transition-colors active:translate-y-0.5"
            title={t('Tambah porsi')}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* RPG Party Size Presets */}
      <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-[#5C3A21]/20 dark:border-[#8C6239]/30">
        {presets.map((p, idx) => {
          const isSelected = Math.abs(multiplier - p.mult) < 0.05;
          return (
            <button
              key={idx}
              onClick={() => handleSelectPreset(p.mult)}
              className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                isSelected
                  ? 'bg-[#C85A32] text-white border-[#2C1E16] shadow-[1px_1px_0px_#2C1E16]'
                  : 'bg-[#FCF9F2] dark:bg-[#241912] text-[#5C3A21] dark:text-[#D9C8AA] border-[#5C3A21]/30 hover:border-[#5C3A21]'
              }`}
              title={p.desc}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
