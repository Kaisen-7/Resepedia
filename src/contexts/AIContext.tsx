'use client';

import React, { createContext, useContext, useState } from 'react';
import { Recipe } from '@/types';

interface AIContextType {
  isOpen: boolean;
  openAI: (context?: Recipe | null) => void;
  closeAI: () => void;
  toggleAI: () => void;
  currentRecipeContext: Recipe | null;
  setRecipeContext: (recipe: Recipe | null) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRecipeContext, setCurrentRecipeContext] = useState<Recipe | null>(null);

  const openAI = (context?: Recipe | null) => {
    if (context !== undefined) {
      setCurrentRecipeContext(context);
    }
    setIsOpen(true);
  };

  const closeAI = () => setIsOpen(false);
  const toggleAI = () => setIsOpen((prev) => !prev);
  const setRecipeContext = (recipe: Recipe | null) => setCurrentRecipeContext(recipe);

  return (
    <AIContext.Provider
      value={{
        isOpen,
        openAI,
        closeAI,
        toggleAI,
        currentRecipeContext,
        setRecipeContext,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
}
