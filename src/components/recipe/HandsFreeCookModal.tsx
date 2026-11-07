'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Flame,
  Clock,
  Eye,
} from 'lucide-react';
import { Instruction, Recipe } from '@/types';
import { useCookingTimer } from '@/contexts/TimerContext';

interface HandsFreeCookModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function HandsFreeCookModal({ recipe, onClose }: HandsFreeCookModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const { startTimer } = useCookingTimer();
  const wakeLockRef = useRef<any>(null);

  const instructions = recipe.instructions || [];
  const currentStep = instructions[currentStepIndex];

  // Request Screen Wake Lock so screen doesn't sleep while cooking
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setWakeLockActive(true);
        }
      } catch (err) {
        console.warn('Wake Lock request error:', err);
      }
    }
    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Speak current instruction using Web Speech API
  const speakCurrentStep = () => {
    if (isMuted || !('speechSynthesis' in window) || !currentStep) return;

    window.speechSynthesis.cancel();
    const textToSpeak = `Langkah ${currentStepIndex + 1}. ${currentStep.title || ''}. ${currentStep.text}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    speakCurrentStep();
  }, [currentStepIndex, isMuted]);

  const handleNext = () => {
    if (currentStepIndex < instructions.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Detect time mentions in step text (e.g., "15 menit", "30 detik")
  const timeRegex = /(\d+)\s*(menit|mins|min|jam|hours|hour)/i;
  const match = currentStep?.text.match(timeRegex);
  const detectedMinutes = match
    ? match[2].toLowerCase().startsWith('j') || match[2].toLowerCase().startsWith('h')
      ? parseInt(match[1]) * 60
      : parseInt(match[1])
    : null;

  return (
    <div className="fixed inset-0 z-9999 bg-zinc-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 sm:pb-4 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary block">
              Zen Cook Mode
            </span>
            <h2 className="text-sm sm:text-lg font-bold text-zinc-100 truncate max-w-37.5 sm:max-w-md">
              {recipe.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {wakeLockActive && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              <Eye className="w-3.5 h-3.5" /> Layar Tetap Menyala
            </span>
          )}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            title="Keluar"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Step Display (Large Kitchen Typography) */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full my-6 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-primary text-xs font-black uppercase tracking-wider mb-6">
          <span>Langkah {currentStepIndex + 1} dari {instructions.length}</span>
        </div>

        {currentStep?.title && (
          <h3 className="font-display font-black text-2xl sm:text-3xl text-zinc-200 mb-4">
            {currentStep.title}
          </h3>
        )}

        {/* Large readable text for cooking from distance */}
        <p className="font-sans font-medium text-xl sm:text-3xl md:text-4xl text-zinc-100 leading-snug sm:leading-relaxed tracking-normal max-w-3xl">
          {currentStep?.text}
        </p>

        {/* Quick timer trigger if step mentions time */}
        {detectedMinutes && (
          <div className="mt-8">
            <button
              onClick={() => startTimer(detectedMinutes, `${recipe.title} (Langkah ${currentStepIndex + 1})`)}
              className="px-5 py-2.5 rounded-full bg-primary/20 border border-primary/40 text-primary hover:bg-primary hover:text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Clock className="w-4 h-4" /> Mulai Timer {detectedMinutes} Menit
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Step Progress Bar */}
        <div className="w-full sm:w-1/3">
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{
                width: `${((currentStepIndex + 1) / instructions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-3">
          <button
            onClick={speakCurrentStep}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white shrink-0"
            title="Ulangi Suara"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex-1 sm:flex-initial px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white disabled:opacity-30 font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-base transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Sebelumnya
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex === instructions.length - 1}
            className="flex-1 sm:flex-initial px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary-container text-white disabled:opacity-30 font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-base shadow-xl shadow-primary/25 transition-transform active:scale-95"
          >
            Berikutnya <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
