'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Minimize2,
  Maximize2,
  Hourglass,
  Bell,
} from 'lucide-react';
import { useCookingTimer } from '@/contexts/TimerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { playClickSound } from '@/lib/utils/sound-effects';

export default function CookingTimer() {
  const { language } = useLanguage();
  const {
    isOpen,
    isRunning,
    isMinimized,
    totalSeconds,
    secondsRemaining,
    recipeTitle,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addMinutes,
    closeTimer,
    toggleMinimize,
    isCompleted,
  } = useCookingTimer();

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? (secondsRemaining / totalSeconds) * 100 : 0;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 pointer-events-auto">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              playClickSound();
              toggleMinimize();
            }}
            className={`cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] transition-all active:translate-y-0.5 ${
              isCompleted
                ? 'bg-[#B83B2B] text-white animate-bounce'
                : 'bg-[#FCF9F2] dark:bg-[#241912] text-[#2C1E16] dark:text-[#F6EFE2]'
            }`}
          >
            <Hourglass className={`w-4 h-4 text-[#C85A32] ${isRunning ? 'animate-spin' : ''}`} />
            <span className="font-mono font-black text-sm">{timeFormatted}</span>
            <span className="text-xs text-[#5C3A21] dark:text-[#D9C8AA] max-w-25 truncate">
              {recipeTitle}
            </span>
            <Maximize2 className="w-3.5 h-3.5 opacity-60 ml-1" />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`w-[calc(100vw-2rem)] sm:w-80 rounded-2xl p-4 sm:p-5 border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16] transition-colors ${
              isCompleted
                ? 'bg-[#FCF9F2] dark:bg-[#241912] border-[#B83B2B]'
                : 'bg-[#FCF9F2] dark:bg-[#241912]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#5C3A21]/20">
              <div className="flex items-center gap-2 truncate">
                <div className="w-7 h-7 rounded-xl bg-[#C85A32] flex items-center justify-center text-white border border-[#2C1E16]">
                  <Hourglass className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#C85A32]">
                    {language === 'en' ? 'Kitchen Hourglass' : 'Jam Pasir Dapur'}
                  </h4>
                  <p className="text-xs font-bold text-[#2C1E16] dark:text-[#F6EFE2] truncate">
                    {recipeTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    playClickSound();
                    toggleMinimize();
                  }}
                  title={language === 'en' ? 'Minimize' : 'Kecilkan'}
                  className="p-1.5 hover:bg-[#EFE4CE] dark:hover:bg-[#2C1E16] rounded-lg text-[#5C3A21] transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    closeTimer();
                  }}
                  title={language === 'en' ? 'Close' : 'Tutup'}
                  className="p-1.5 hover:bg-[#EFE4CE] dark:hover:bg-[#2C1E16] rounded-lg text-[#5C3A21] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Timer Display */}
            <div className="py-4 text-center">
              <div
                className={`font-mono font-black text-4xl sm:text-5xl tracking-tight transition-colors ${
                  isCompleted ? 'text-[#B83B2B] animate-pulse' : 'text-[#2C1E16] dark:text-[#F6EFE2]'
                }`}
              >
                {timeFormatted}
              </div>
              {isCompleted && (
                <div className="mt-2 text-xs font-black text-[#B83B2B] flex items-center justify-center gap-1 animate-bounce">
                  <Bell className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en' ? 'Cooking time is up!' : 'Waktu memasak selesai!'}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#EFE4CE] dark:bg-[#1C1410] border border-[#5C3A21]/30 overflow-hidden mb-4">
              <div
                className="h-full bg-[#C85A32] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Quick Add Minutes Presets */}
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {[1, 3, 5].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    playClickSound();
                    addMinutes(mins);
                  }}
                  className="py-1 rounded-lg text-xs font-bold bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] hover:bg-[#E2D1B0] border border-[#5C3A21]/30 transition-colors active:translate-y-0.5"
                >
                  +{mins} {language === 'en' ? 'Min' : 'Mnt'}
                </button>
              ))}
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  resetTimer();
                }}
                className="p-2.5 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] hover:bg-[#E2D1B0] border-2 border-[#5C3A21]/40 transition-colors active:translate-y-0.5"
                title={language === 'en' ? 'Reset' : 'Atur Ulang'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {isRunning ? (
                <button
                  onClick={() => {
                    playClickSound();
                    pauseTimer();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#D99B26] text-[#2C1E16] font-black text-xs flex items-center justify-center gap-1.5 border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
                >
                  <Pause className="w-4 h-4" />
                  <span>{language === 'en' ? 'Pause' : 'Jeda'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    playClickSound();
                    resumeTimer();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#C85A32] text-white font-black text-xs flex items-center justify-center gap-1.5 border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
                >
                  <Play className="w-4 h-4" />
                  <span>{language === 'en' ? 'Resume' : 'Lanjutkan'}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
