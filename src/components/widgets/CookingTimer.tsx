'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Plus,
  Minus,
  Minimize2,
  Maximize2,
  Bell,
  Flame,
} from 'lucide-react';
import { useCookingTimer } from '@/contexts/TimerContext';

export default function CookingTimer() {
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
    <div className="fixed bottom-24 sm:bottom-6 left-4 sm:left-6 z-50 pointer-events-auto">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleMinimize}
            className={`cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl border backdrop-blur-xl transition-all ${
              isCompleted
                ? 'bg-red-500 text-white animate-bounce'
                : 'bg-white/95 dark:bg-zinc-900/95 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:border-primary/50'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="font-mono font-bold text-sm">{timeFormatted}</span>
            <span className="text-xs text-zinc-500 max-w-[100px] truncate">{recipeTitle}</span>
            <Maximize2 className="w-3.5 h-3.5 opacity-60 ml-1" />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`w-[calc(100vw-2rem)] sm:w-80 rounded-3xl p-4 sm:p-5 shadow-2xl border backdrop-blur-2xl transition-colors ${
              isCompleted
                ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800'
                : 'bg-white/95 dark:bg-zinc-900/95 border-zinc-200/80 dark:border-zinc-800/80'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 truncate">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary">Timer Dapur</h4>
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 truncate">
                    {recipeTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMinimize}
                  title="Minimize"
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={closeTimer}
                  title="Tutup"
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Timer Dial with Circular Progress */}
            <div className="my-5 flex flex-col items-center justify-center relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="text-zinc-100 dark:text-zinc-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className={`transition-all duration-500 ${isCompleted ? 'text-red-500' : 'text-primary'}`}
                  strokeWidth="8"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * progressPercent) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {timeFormatted}
                </span>
                <span className="text-[11px] font-bold text-zinc-400 mt-0.5">
                  {isCompleted ? 'WAKTU HABIS!' : isRunning ? 'SEDANG MEMASAK' : 'JEDA'}
                </span>
              </div>
            </div>

            {/* Adjustment Controls (+/- minutes) */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => addMinutes(-1)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 transition-colors"
              >
                -1m
              </button>
              <button
                onClick={() => addMinutes(1)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 transition-colors"
              >
                +1m
              </button>
              <button
                onClick={() => addMinutes(5)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 transition-colors"
              >
                +5m
              </button>
            </div>

            {/* Play/Pause & Reset Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={resetTimer}
                title="Reset"
                className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={isRunning ? pauseTimer : resumeTimer}
                className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                  isRunning
                    ? 'bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-900'
                    : 'bg-primary hover:bg-primary-container shadow-primary/25'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" /> Jeda
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Lanjut
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
