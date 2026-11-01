'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Bookmark,
  ShoppingBag,
  ChefHat,
  Moon,
  Sun,
  LogOut,
  Settings,
  Plus,
  Edit3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { getShoppingCount } from '@/lib/utils/shopping-storage';
import { getMyLocalRecipesCount } from '@/lib/utils/recipe-storage';

interface ProfilClientProps {
  savedCount: number;
  shoppingCount: number;
  myRecipesCount: number;
}

export default function ProfilClient({
  savedCount,
  shoppingCount,
  myRecipesCount,
}: ProfilClientProps) {
  const { user, signInWithGoogle, logout, savedRecipeIds } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const toast = useToast();

  const [darkMode, setDarkMode] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState('None');
  const [localShoppingCount, setLocalShoppingCount] = useState(shoppingCount);
  const [localMyRecipesCount, setLocalMyRecipesCount] = useState(myRecipesCount);

  // Sync counters with local/cloud state
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    const saved = localStorage.getItem('culinary_prefs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedDiet) setSelectedDiet(parsed.selectedDiet);
      } catch {}
    }

    // Initialize shopping count
    const initialShopping = getShoppingCount(user?.uid);
    setLocalShoppingCount(initialShopping > 0 ? initialShopping : shoppingCount);

    // Initialize my recipes count
    const localMy = getMyLocalRecipesCount(user?.uid);
    setLocalMyRecipesCount(Math.max(localMy, myRecipesCount));

    const handleShoppingUpdated = () => {
      setLocalShoppingCount(getShoppingCount(user?.uid));
    };

    const handleMyRecipesUpdated = () => {
      setLocalMyRecipesCount(Math.max(getMyLocalRecipesCount(user?.uid), myRecipesCount));
    };

    window.addEventListener('shopping-list-updated', handleShoppingUpdated);
    window.addEventListener('my-recipes-updated', handleMyRecipesUpdated);

    return () => {
      window.removeEventListener('shopping-list-updated', handleShoppingUpdated);
      window.removeEventListener('my-recipes-updated', handleMyRecipesUpdated);
    };
  }, [user, shoppingCount, myRecipesCount]);

  const handleToggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const saved = localStorage.getItem('culinary_prefs');
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.darkMode = next;
    localStorage.setItem('culinary_prefs', JSON.stringify(parsed));
    toast.info(
      next
        ? language === 'en'
          ? 'Dark Mode Enabled'
          : 'Mode Gelap Aktif'
        : language === 'en'
        ? 'Light Mode Enabled'
        : 'Mode Terang Aktif'
    );
  };

  const handleDietChange = (diet: string) => {
    setSelectedDiet(diet);
    const saved = localStorage.getItem('culinary_prefs');
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.selectedDiet = diet;
    localStorage.setItem('culinary_prefs', JSON.stringify(parsed));
    toast.success(
      language === 'en'
        ? `Dietary preference set to: ${diet}`
        : `Preferensi diet diatur ke: ${diet}`
    );
  };

  const dietOptions = ['None', 'Halal', 'Vegetarian', 'Vegan', 'Gluten Free'];

  const displayedSavedCount = savedRecipeIds ? savedRecipeIds.length : savedCount;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-black text-3xl shadow-inner">
              <User className="w-10 h-10" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                {user?.displayName || t('Pengguna Tamu')}
              </h1>
              {user && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  {t('Terverifikasi')}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-500">
              {user?.email || t('Belum masuk dengan akun Google')}
            </p>
          </div>
        </div>

        <div>
          {user ? (
            <button
              onClick={() => logout()}
              className="px-5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> {t('Keluar')}
            </button>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="px-6 py-3 rounded-full bg-primary text-white font-bold text-xs hover:bg-primary-container shadow-md shadow-primary/20"
            >
              {t('Masuk dengan Google')}
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/koleksi"
          className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 text-center hover:border-primary/50 transition-colors shadow-sm group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Bookmark className="w-5 h-5" />
          </div>
          <span className="font-mono font-black text-xl text-zinc-900 dark:text-zinc-100 block">
            {displayedSavedCount}
          </span>
          <span className="text-[11px] font-semibold text-zinc-500">{t('Resep Disimpan')}</span>
        </Link>

        <Link
          href="/belanja"
          className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 text-center hover:border-primary/50 transition-colors shadow-sm group"
        >
          <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-mono font-black text-xl text-zinc-900 dark:text-zinc-100 block">
            {localShoppingCount}
          </span>
          <span className="text-[11px] font-semibold text-zinc-500">{t('Bahan Belanja')}</span>
        </Link>

        <Link
          href="/koleksi"
          className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 text-center hover:border-primary/50 transition-colors shadow-sm group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="font-mono font-black text-xl text-zinc-900 dark:text-zinc-100 block">
            {localMyRecipesCount}
          </span>
          <span className="text-[11px] font-semibold text-zinc-500">{t('Resep Saya')}</span>
        </Link>
      </div>

      {/* Quick Action: Recipe Management */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" /> {t('Kelola Resep Masakan Anda')}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t('Tulis resep baru atau perbarui resep masakan yang telah Anda publikasikan.')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/resep/tambah"
              className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" /> {t('Tulis Resep')}
            </Link>
            <Link
              href="/koleksi"
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-4 h-4" /> {t('Buka Koleksi Saya')}
            </Link>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" /> {t('Pengaturan & Preferensi')}
        </h3>

        {/* Dark Mode Switch */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
              {t('Tampilan Gelap (Dark Mode)')}
            </span>
            <span className="text-xs text-zinc-500">
              {t('Menyesuaikan pencahayaan layar agar nyaman saat memasak di dapur')}
            </span>
          </div>
          <button
            onClick={handleToggleDark}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${
              darkMode ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-700'
            }`}
            aria-label="Toggle Dark Mode"
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              } flex items-center justify-center`}
            >
              {darkMode ? (
                <Moon className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
          </button>
        </div>

        {/* Language Selection */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
              {t('Bahasa Antarmuka')}
            </span>
            <span className="text-xs text-zinc-500">
              {t('Pilih bahasa yang digunakan di aplikasi')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
            <button
              onClick={() => setLanguage('id')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                language === 'id'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              ID (Indonesia)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              EN (English)
            </button>
          </div>
        </div>

        {/* Dietary Preferences Chips */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
              {t('Preferensi Diet & Pantangan')}
            </span>
            <span className="text-xs text-zinc-500">
              {t('Resepedia akan memprioritaskan resep yang sesuai dengan gaya makan Anda')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dietOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleDietChange(opt)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedDiet === opt
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
