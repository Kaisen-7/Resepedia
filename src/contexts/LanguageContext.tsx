'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

export type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Comprehensive dictionary for all UI text across the website
const EXTRA_TRANSLATIONS: Record<string, { id: string; en: string }> = {
  // Navigation & Branding
  'Beranda': { id: 'Beranda', en: 'Home' },
  'Home': { id: 'Beranda', en: 'Home' },
  'Eksplorasi': { id: 'Eksplorasi', en: 'Explore' },
  'Explore': { id: 'Eksplorasi', en: 'Explore' },
  'Koleksi': { id: 'Koleksi', en: 'Collection' },
  'Collection': { id: 'Koleksi', en: 'Collection' },
  'Daftar Belanja': { id: 'Daftar Belanja', en: 'Shopping List' },
  'Shopping List': { id: 'Daftar Belanja', en: 'Shopping List' },
  'Asisten Dapur': { id: 'Asisten Dapur', en: 'Kitchen Assistant' },
  'Kitchen Assistant': { id: 'Asisten Dapur', en: 'Kitchen Assistant' },
  'Tulis Resep': { id: 'Tulis Resep', en: 'Create Recipe' },
  'Create Recipe': { id: 'Tulis Resep', en: 'Create Recipe' },
  'Tulis': { id: 'Tulis', en: 'Create' },
  'Belanja': { id: 'Belanja', en: 'Shopping' },
  'Profil': { id: 'Profil', en: 'Profile' },
  'Profile': { id: 'Profil', en: 'Profile' },
  'Katalog Nusantara': { id: 'Katalog Nusantara', en: 'Archipelago Catalog' },
  'Cari resep...': { id: 'Cari resep...', en: 'Search recipes...' },
  'Masuk dengan Google': { id: 'Masuk dengan Google', en: 'Sign in with Google' },
  'Keluar': { id: 'Keluar', en: 'Sign Out' },
  'Sign Out': { id: 'Keluar', en: 'Sign Out' },
  'Terverifikasi': { id: 'Terverifikasi', en: 'Verified' },
  'Pengguna Tamu': { id: 'Pengguna Tamu', en: 'Guest User' },
  'Belum masuk dengan akun Google': {
    id: 'Belum masuk dengan akun Google',
    en: 'Not signed in with Google account',
  },

  // Profile Page
  'Resep Disimpan': { id: 'Resep Disimpan', en: 'Saved Recipes' },
  'Saved Recipes': { id: 'Resep Disimpan', en: 'Saved Recipes' },
  'Bahan Belanja': { id: 'Bahan Belanja', en: 'Shopping Items' },
  'Shopping Items': { id: 'Bahan Belanja', en: 'Shopping Items' },
  'Resep Saya': { id: 'Resep Saya', en: 'My Recipes' },
  'My Recipes': { id: 'Resep Saya', en: 'My Recipes' },
  'Kelola Resep Masakan Anda': {
    id: 'Kelola Resep Masakan Anda',
    en: 'Manage Your Recipes',
  },
  'Tulis resep baru atau perbarui resep masakan yang telah Anda publikasikan.': {
    id: 'Tulis resep baru atau perbarui resep masakan yang telah Anda publikasikan.',
    en: 'Write new recipes or update recipes you have published.',
  },
  'Buka Koleksi Saya': { id: 'Buka Koleksi Saya', en: 'Open My Collection' },
  'Pengaturan & Preferensi': { id: 'Pengaturan & Preferensi', en: 'Settings & Preferences' },
  'Tampilan Gelap (Dark Mode)': { id: 'Tampilan Gelap (Dark Mode)', en: 'Dark Mode' },
  'Menyesuaikan pencahayaan layar agar nyaman saat memasak di dapur': {
    id: 'Menyesuaikan pencahayaan layar agar nyaman saat memasak di dapur',
    en: 'Adjust screen lighting for comfort while cooking in the kitchen',
  },
  'Bahasa Antarmuka': { id: 'Bahasa Antarmuka', en: 'Interface Language' },
  'Pilih bahasa yang digunakan di aplikasi': {
    id: 'Pilih bahasa yang digunakan di aplikasi',
    en: 'Choose language used in application',
  },
  'Preferensi Diet & Pantangan': {
    id: 'Preferensi Diet & Pantangan',
    en: 'Dietary Preferences & Restrictions',
  },
  'Resepedia akan memprioritaskan resep yang sesuai dengan gaya makan Anda': {
    id: 'Resepedia akan memprioritaskan resep yang sesuai dengan gaya makan Anda',
    en: 'Resepedia will prioritize recipes matching your eating style',
  },

  // Collection Page
  'Koleksi Pribadi': { id: 'Koleksi Pribadi', en: 'Personal Collection' },
  'Koleksi & Resep Saya': { id: 'Koleksi & Resep Saya', en: 'My Collection & Recipes' },
  'Akses cepat resep masakan favorit Anda dan kelola resep yang telah Anda bagikan.': {
    id: 'Akses cepat resep masakan favorit Anda dan kelola resep yang telah Anda bagikan.',
    en: 'Quick access to your favorite recipes and manage recipes you have shared.',
  },
  'Tulis Resep Baru': { id: 'Tulis Resep Baru', en: 'Write New Recipe' },
  'Kreasi Resep Saya': { id: 'Kreasi Resep Saya', en: 'My Created Recipes' },
  'Belum ada resep yang disimpan': {
    id: 'Belum ada resep yang disimpan',
    en: 'No saved recipes yet',
  },
  'Jelajahi resep Nusantara dan klik tombol bookmark untuk menyimpannya di sini.': {
    id: 'Jelajahi resep Nusantara dan klik tombol bookmark untuk menyimpannya di sini.',
    en: 'Explore Nusantara recipes and click the bookmark button to save them here.',
  },
  'Jelajahi Resep Sekarang': {
    id: 'Jelajahi Resep Sekarang',
    en: 'Explore Recipes Now',
  },
  'Belum ada resep buatan Anda': {
    id: 'Belum ada resep buatan Anda',
    en: 'No recipes created yet',
  },
  'Bagikan resep keluarga atau kreasi kuliner Nusantara Anda kepada komunitas.': {
    id: 'Bagikan resep keluarga atau kreasi kuliner Nusantara Anda kepada komunitas.',
    en: 'Share your family recipes or culinary creations with the community.',
  },

  // Shopping List Page
  'Daftar Belanja Pasar': { id: 'Daftar Belanja Pasar', en: 'Market Shopping List' },
  'bahan telah dibeli': { id: 'bahan telah dibeli', en: 'items purchased' },
  'Daftar belanja Anda masih kosong.': {
    id: 'Daftar belanja Anda masih kosong.',
    en: 'Your shopping list is empty.',
  },
  'Bersihkan yang Selesai': { id: 'Bersihkan yang Selesai', en: 'Clear Completed' },
  'Tambah Bahan': { id: 'Tambah Bahan', en: 'Add Item' },
  'Catatan Pribadi': { id: 'Catatan Pribadi', en: 'Personal Note' },
  'Semua Selesai': { id: 'Semua Selesai', en: 'All Done' },
  'Nama bahan tambahan (misal: Minyak Goreng, Garam)...': {
    id: 'Nama bahan tambahan (misal: Minyak Goreng, Garam)...',
    en: 'Additional ingredient name (e.g. Cooking Oil, Salt)...',
  },
  'Takaran (1 liter, 2 ikat)...': {
    id: 'Takaran (1 liter, 2 ikat)...',
    en: 'Amount (1 liter, 2 bunches)...',
  },

  // Home & Recipe Card
  'Semua Daerah': { id: 'Semua Daerah', en: 'All Regions' },
  'Semua Hidangan': { id: 'Semua Hidangan', en: 'All Dishes' },
  'Makanan Utama': { id: 'Makanan Utama', en: 'Main Course' },
  'Camilan & Pembuka': { id: 'Camilan & Pembuka', en: 'Appetizers & Snacks' },
  'Hidangan Penutup': { id: 'Hidangan Penutup', en: 'Desserts' },
  'Minuman Tradisional': { id: 'Minuman Tradisional', en: 'Traditional Drinks' },
  'Pedas': { id: 'Pedas', en: 'Spicy' },
  'Belum ada ulasan': { id: 'Belum ada ulasan', en: 'No reviews yet' },
  'ulasan': { id: 'ulasan', en: 'reviews' },
  'Lihat': { id: 'Lihat', en: 'View' },
  'Waktu Persiapan': { id: 'Waktu Persiapan', en: 'Prep Time' },
  'Waktu Memasak': { id: 'Waktu Memasak', en: 'Cook Time' },
  'Tingkat Kesulitan': { id: 'Tingkat Kesulitan', en: 'Difficulty' },
  'Porsi Masakan': { id: 'Porsi Masakan', en: 'Servings' },
  'Porsi': { id: 'Porsi', en: 'Servings' },
  'Mnt': { id: 'Mnt', en: 'Min' },
  'Bahan-bahan Utama & Bumbu': {
    id: 'Bahan-bahan Utama & Bumbu',
    en: 'Ingredients & Seasonings',
  },
  'Masukkan Semua ke Daftar Belanja': {
    id: 'Masukkan Semua ke Daftar Belanja',
    en: 'Add All to Shopping List',
  },
  'Panduan Langkah Memasak': {
    id: 'Panduan Langkah Memasak',
    en: 'Cooking Step Guide',
  },
  'Mulai Masak Bebas Genggam': {
    id: 'Mulai Masak Bebas Genggam',
    en: 'Start Hands-Free Cooking',
  },
  'Video Tutorial Memasak': {
    id: 'Video Tutorial Memasak',
    en: 'Cooking Video Tutorial',
  },
  'Buka di YouTube': { id: 'Buka di YouTube', en: 'Open on YouTube' },
  'Ulasan & Komentar Komunitas': {
    id: 'Ulasan & Komentar Komunitas',
    en: 'Community Reviews & Comments',
  },
  'Beri Nilai Resep Ini': { id: 'Beri Nilai Resep Ini', en: 'Rate This Recipe' },
  'Tulis ulasan Anda...': { id: 'Tulis ulasan Anda...', en: 'Write your review...' },
  'Kirim Ulasan': { id: 'Kirim Ulasan', en: 'Submit Review' },
  'Hapus Resep': { id: 'Hapus Resep', en: 'Delete Recipe' },
  'Edit Resep Ini': { id: 'Edit Resep Ini', en: 'Edit This Recipe' },
};

// Build reverse map from translations.id (where values are Indonesian strings)
const ID_TO_EN_MAP = new Map<string, string>();
if (translations && translations.id) {
  Object.entries(translations.id).forEach(([enKey, idValue]) => {
    if (typeof idValue === 'string') {
      ID_TO_EN_MAP.set(idValue.toLowerCase().trim(), enKey);
    }
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedPrefs = localStorage.getItem('culinary_prefs');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.language === 'en' || parsed.language === 'id') {
          setLanguageState(parsed.language);
          return;
        }
        if (parsed.region === 'International (English)') {
          setLanguageState('en');
          return;
        }
      } catch (e) {
        console.error('Error parsing culinary_prefs language setting:', e);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem('culinary_prefs');
      let currentPrefs = savedPrefs ? JSON.parse(savedPrefs) : {};
      currentPrefs.language = lang;
      if (lang === 'id') {
        currentPrefs.region = 'Indonesia (Bahasa)';
      } else {
        currentPrefs.region = 'International (English)';
      }
      localStorage.setItem('culinary_prefs', JSON.stringify(currentPrefs));
      window.dispatchEvent(new Event('language-changed'));
    }
  };

  const t = (key: string): string => {
    if (!key) return '';
    const trimmed = key.trim();

    // 1. Check direct EXTRA_TRANSLATIONS map
    if (EXTRA_TRANSLATIONS[trimmed]) {
      return EXTRA_TRANSLATIONS[trimmed][language];
    }

    if (language === 'en') {
      // If asking for English:
      // a) Look in translations.en
      const enDict = translations['en'] as Record<string, string>;
      if (enDict && enDict[trimmed]) {
        return enDict[trimmed];
      }
      // b) Check if trimmed is Indonesian in ID_TO_EN_MAP
      const matchedEn = ID_TO_EN_MAP.get(trimmed.toLowerCase());
      if (matchedEn) {
        return matchedEn;
      }
      // Return key as fallback
      return key;
    } else {
      // If asking for Indonesian:
      // a) Look in translations.id
      const idDict = translations['id'] as Record<string, string>;
      if (idDict && idDict[trimmed]) {
        return idDict[trimmed];
      }
      // Return key as fallback
      return key;
    }
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
