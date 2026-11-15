'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  RotateCcw,
  Eye,
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Recipe } from '@/types';
import { useTimer as useCookingTimer } from '@/contexts/TimerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { playClickSound, playLevelUpFanfare } from '@/lib/utils/sound-effects';
import { claimRecipeCooked } from '@/lib/utils/mastery-storage';

interface HandsFreeCookModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function HandsFreeCookModal({ recipe, onClose }: HandsFreeCookModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<{
    xpGained: number;
    totalXp: number;
    newLevel: number;
    levelUp: boolean;
    newTitle: string;
  } | null>(null);

  const { startTimer } = useCookingTimer();
  const wakeLockRef = useRef<any>(null);

  const instructions = recipe.instructions || [];
  const currentStep = instructions[currentStepIndex];
  const isLastStep = currentStepIndex === instructions.length - 1;

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
    if (isMuted || !('speechSynthesis' in window) || !currentStep || isCompleted) return;

    window.speechSynthesis.cancel();
    const prefix = language === 'en' ? `Step ${currentStepIndex + 1}` : `Langkah ${currentStepIndex + 1}`;
    const textToSpeak = `${prefix}. ${currentStep.title || ''}. ${currentStep.text}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'en' ? 'en-US' : 'id-ID';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isCompleted) {
      speakCurrentStep();
    }
  }, [currentStepIndex, isMuted, isCompleted]);

  const handleNext = () => {
    playClickSound();
    if (currentStepIndex < instructions.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinishCooking = async () => {
    window.speechSynthesis?.cancel();
    playLevelUpFanfare();
    const result = await claimRecipeCooked(
      recipe.id,
      recipe.difficulty,
      user?.uid,
      language
    );
    setCompletionResult(result);
    setIsCompleted(true);
  };

  // Detect time mentions in step text
  const timeRegex = /(\d+)\s*(menit|mins|min|jam|hours|hour)/i;
  const match = currentStep?.text.match(timeRegex);
  const detectedMinutes = match
    ? match[2].toLowerCase().startsWith('j') || match[2].toLowerCase().startsWith('h')
      ? parseInt(match[1]) * 60
      : parseInt(match[1])
    : null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#1C1410] text-[#F6EFE2] flex flex-col justify-between p-4 sm:p-8 select-none border-4 border-[#5C3A21] overflow-y-auto">
      {/* Top Header - Perapian Dapur */}
      <div className="flex items-center justify-between border-b-2 border-[#5C3A21]/50 pb-3 sm:pb-4 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] shrink-0">
            <Flame className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D99B26] block">
              {language === 'en' ? 'Hearth Crafting Mode' : 'Mode Perapian Dapur'}
            </span>
            <h2 className="text-sm sm:text-base font-display font-bold text-[#F6EFE2] truncate max-w-37.5 sm:max-w-md">
              {recipe.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {wakeLockActive && (
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#4A7C59]/20 text-[#88C59A] border border-[#4A7C59]/40 text-xs font-bold">
              <Eye className="w-3.5 h-3.5" />{' '}
              {language === 'en' ? 'Screen Awake' : 'Layar Terjaga'}
            </span>
          )}
          <button
            onClick={() => {
              playClickSound();
              setIsMuted(!isMuted);
            }}
            className="p-2.5 rounded-xl bg-[#2C1E16] border-2 border-[#5C3A21] text-[#E2D1B0] hover:text-white"
            title={
              isMuted
                ? language === 'en'
                  ? 'Enable Kitchen Voice'
                  : 'Nyalakan Petuah Dapur'
                : language === 'en'
                ? 'Mute Voice'
                : 'Bisukan Petuah Dapur'
            }
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-[#8C6239]" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#D99B26]" />
            )}
          </button>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-[#2C1E16] border-2 border-[#5C3A21] text-[#E2D1B0] hover:text-white"
            title={language === 'en' ? 'Exit Hearth' : 'Tutup Mode Perapian'}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isCompleted ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full my-6 text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#2C1E16] border-2 border-[#D99B26] text-[#D99B26] text-xs font-black uppercase tracking-wider mb-6 shadow-[2px_2px_0px_#2C1E16]">
            <span>
              {language === 'en'
                ? `Quest Step ${currentStepIndex + 1} of ${instructions.length}`
                : `Tahap Racik ${currentStepIndex + 1} dari ${instructions.length}`}
            </span>
          </div>

          {currentStep?.title && (
            <h3 className="font-display font-black text-2xl sm:text-3xl text-amber-200 mb-4">
              {currentStep.title}
            </h3>
          )}

          {/* Large typography for viewing across the kitchen counter */}
          <p className="font-sans font-semibold text-xl sm:text-3xl md:text-4xl text-[#F6EFE2] leading-relaxed max-w-3xl drop-shadow-sm">
            {currentStep?.text}
          </p>

          {/* Quick timer button */}
          {detectedMinutes && (
            <div className="mt-8">
              <button
                onClick={() => {
                  playClickSound();
                  startTimer(
                    detectedMinutes,
                    `${recipe.title} (${language === 'en' ? 'Step' : 'Tahap'} ${currentStepIndex + 1})`
                  );
                }}
                className="px-5 py-2.5 rounded-xl bg-[#C85A32] text-white border-2 border-[#2C1E16] font-bold text-sm flex items-center gap-2 shadow-[3px_3px_0px_#2C1E16] active:translate-y-0.5"
              >
                <Clock className="w-4 h-4" />{' '}
                {language === 'en'
                  ? `Start ${detectedMinutes} Min Timer`
                  : `Nyalakan Jam Pasir ${detectedMinutes} Menit`}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* RPG Victory Screen */
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full my-6 text-center px-4 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-2xl bg-[#D99B26] text-[#2C1E16] flex items-center justify-center border-4 border-[#2C1E16] shadow-[4px_4px_0px_#2C1E16]">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#D99B26]">
              {language === 'en' ? 'Culinary Quest Completed!' : 'Mahakarya Berhasil Dirajut!'}
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
              {recipe.title}
            </h2>
            <p className="text-xs text-[#E2D1B0]">
              {language === 'en'
                ? 'You have mastered this recipe and gained experience points for your culinary grimoire!'
                : 'Resep ini kini resmi tercatat dalam lembar keahlian koki Anda!'}
            </p>
          </div>

          {completionResult && (
            <div className="w-full p-4 rounded-2xl bg-[#2C1E16] border-2 border-[#D99B26] shadow-[4px_4px_0px_#2C1E16] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#E2D1B0] pb-2 border-b border-[#5C3A21]">
                <span>{language === 'en' ? 'XP Reward' : 'Hadiah Pengalaman'}</span>
                <span className="font-mono text-sm text-[#4A7C59] bg-[#4A7C59]/20 px-2 py-0.5 rounded font-black">
                  +{completionResult.xpGained} XP
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[#E2D1B0]">
                <span>{language === 'en' ? 'Chef Rank' : 'Gelar Koki'}</span>
                <span className="text-[#D99B26] font-display font-black">
                  Lv. {completionResult.newLevel} ({completionResult.newTitle})
                </span>
              </div>

              {completionResult.levelUp && (
                <div className="p-2 rounded-xl bg-[#D99B26]/20 border border-[#D99B26] text-xs font-black text-[#D99B26]">
                  🌟 {language === 'en' ? 'LEVEL UP! New Chef Title Unlocked!' : 'NAIK LEVEL! Gelar Koki Baru Terbuka!'}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-[#C85A32] text-white font-black text-sm border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] active:translate-y-0.5"
          >
            {language === 'en' ? 'Return to Crafting Table' : 'Kembali ke Meja Dapur'}
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      {!isCompleted && (
        <div className="border-t-2 border-[#5C3A21]/50 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Progress Bar */}
          <div className="w-full sm:w-1/3">
            <div className="w-full h-3 rounded-full bg-[#2C1E16] border border-[#5C3A21] overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#D99B26] to-[#C85A32] transition-all duration-300 rounded-full"
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
              className="p-3 sm:p-4 rounded-xl bg-[#2C1E16] border-2 border-[#5C3A21] text-[#E2D1B0] hover:text-white"
              title={language === 'en' ? 'Replay Voice' : 'Ulangi Suara'}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex-1 sm:flex-initial px-4 sm:px-6 py-3 rounded-xl bg-[#2C1E16] border-2 border-[#5C3A21] text-[#E2D1B0] hover:text-white disabled:opacity-30 font-bold flex items-center justify-center gap-1.5 text-xs sm:text-sm active:translate-y-0.5"
            >
              <ChevronLeft className="w-4 h-4" />{' '}
              {language === 'en' ? 'Previous' : 'Sebelumnya'}
            </button>

            {isLastStep ? (
              <button
                onClick={handleFinishCooking}
                className="flex-1 sm:flex-initial px-5 sm:px-8 py-3 rounded-xl bg-[#4A7C59] text-white font-black flex items-center justify-center gap-2 text-xs sm:text-sm border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] active:translate-y-0.5 animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" />{' '}
                {language === 'en' ? 'Complete Feast (+XP)' : 'Hidangan Selesai (+XP)'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-initial px-5 sm:px-8 py-3 rounded-xl bg-[#C85A32] text-white font-black flex items-center justify-center gap-1.5 text-xs sm:text-sm border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] active:translate-y-0.5"
              >
                {language === 'en' ? 'Next' : 'Berikutnya'}{' '}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
