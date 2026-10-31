'use client';

import React, { createContext, useContext, useState } from 'react';
import { translations } from '../translations';

export type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'] | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'id';
    const savedPrefs = localStorage.getItem("culinary_prefs");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.language) return parsed.language;
        if (parsed.region === "International (English)") return "en";
      } catch (e) {
        console.error("Error parsing culinary_prefs language setting:", e);
      }
    }
    return "id"; // Default to Indonesian
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem("culinary_prefs");
      let currentPrefs = savedPrefs ? JSON.parse(savedPrefs) : {};
      currentPrefs.language = lang;
      if (lang === "id") {
        currentPrefs.region = "Indonesia (Bahasa)";
      } else {
        currentPrefs.region = "International (English)";
      }
      localStorage.setItem("culinary_prefs", JSON.stringify(currentPrefs));
    }
  };

  const t = (key: string): string => {
    const dict = translations[language] || translations['en'];
    return (dict as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
