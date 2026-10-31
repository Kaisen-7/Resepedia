'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface TimerContextType {
  isOpen: boolean;
  isRunning: boolean;
  isMinimized: boolean;
  totalSeconds: number;
  secondsRemaining: number;
  recipeTitle: string;
  startTimer: (minutes: number, title?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  addMinutes: (mins: number) => void;
  closeTimer: () => void;
  toggleMinimize: () => void;
  isCompleted: boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [recipeTitle, setRecipeTitle] = useState('Timer Dapur');
  const [isCompleted, setIsCompleted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const beepIntervalRef = useRef<number | null>(null);

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  };

  const startBeeping = () => {
    playBeep();
    if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    beepIntervalRef.current = window.setInterval(playBeep, 1200);
  };

  const stopBeeping = () => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
  };

  useEffect(() => {
    let timer: number;
    if (isRunning && secondsRemaining > 0) {
      timer = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            startBeeping();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsRemaining]);

  const startTimer = (minutes: number, title?: string) => {
    stopBeeping();
    const secs = Math.max(1, Math.round(minutes * 60));
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    if (title) setRecipeTitle(title);
    setIsRunning(true);
    setIsCompleted(false);
    setIsOpen(true);
    setIsMinimized(false);
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => {
    if (secondsRemaining > 0) {
      setIsRunning(true);
      setIsCompleted(false);
      stopBeeping();
    }
  };

  const resetTimer = () => {
    stopBeeping();
    setIsRunning(false);
    setIsCompleted(false);
    setSecondsRemaining(totalSeconds);
  };

  const addMinutes = (mins: number) => {
    const additional = mins * 60;
    setTotalSeconds((prev) => prev + additional);
    setSecondsRemaining((prev) => Math.max(0, prev + additional));
    if (isCompleted) {
      setIsCompleted(false);
      stopBeeping();
      setIsRunning(true);
    }
  };

  const closeTimer = () => {
    stopBeeping();
    setIsRunning(false);
    setIsOpen(false);
  };

  const toggleMinimize = () => setIsMinimized((prev) => !prev);

  return (
    <TimerContext.Provider
      value={{
        isOpen,
        isRunning,
        isMinimized,
        totalSeconds,
        secondsRemaining,
        recipeTitle,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        addMinutes,
        closeTimer,
        toggleMinimize,
        isCompleted,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useCookingTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useCookingTimer must be used within TimerProvider');
  }
  return context;
}
