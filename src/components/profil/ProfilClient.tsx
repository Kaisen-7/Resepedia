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
  Award,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { getShoppingCount, saveLocalShoppingItems } from '@/lib/utils/shopping-storage';
import { getMyLocalRecipesCount } from '@/lib/utils/recipe-storage';
import { subscribeShoppingItems } from '@/lib/firebase/service';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getLocalMastery, UserMastery } from '@/lib/utils/mastery-storage';
import { isSoundEnabled, setSoundEnabled, playClickSound } from '@/lib/utils/sound-effects';

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
  const { user, signInWithGoogle, logout, savedRecipeIds, userData } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const toast = useToast();

  const [darkMode, setDarkMode] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [selectedDiet, setSelectedDiet] = useState('None');
  const [localShoppingCount, setLocalShoppingCount] = useState(shoppingCount);
  const [localMyRecipesCount, setLocalMyRecipesCount] = useState(myRecipesCount);
  const [mastery, setMastery] = useState<UserMastery | null>(null);

  // Sync counters, mastery, and user preferences
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    setSoundActive(isSoundEnabled());
    setMastery(getLocalMastery(user?.uid, language));

    const saved = localStorage.getItem('culinary_prefs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedDiet) setSelectedDiet(parsed.selectedDiet);
      } catch {}
    } else if (userData?.preferences?.dietary) {
      setSelectedDiet(userData.preferences.dietary);
    }

    const initialShopping = getShoppingCount(user?.uid);
    setLocalShoppingCount(initialShopping > 0 ? initialShopping : shoppingCount);

    const localMy = getMyLocalRecipesCount(user?.uid);
    setLocalMyRecipesCount(Math.max(localMy, myRecipesCount));

    const handleShoppingUpdated = () => {
      setLocalShoppingCount(getShoppingCount(user?.uid));
    };

    const handleMyRecipesUpdated = () => {
      setLocalMyRecipesCount(Math.max(getMyLocalRecipesCount(user?.uid), myRecipesCount));
    };

    const handleMasteryUpdated = () => {
      setMastery(getLocalMastery(user?.uid, language));
    };

    window.addEventListener('shopping-list-updated', handleShoppingUpdated);
    window.addEventListener('my-recipes-updated', handleMyRecipesUpdated);
    window.addEventListener('mastery-updated', handleMasteryUpdated);

    let unsubscribeShopping: (() => void) | null = null;
    if (user?.uid) {
      unsubscribeShopping = subscribeShoppingItems(user.uid, (cloudItems) => {
        setLocalShoppingCount(cloudItems.length);
        saveLocalShoppingItems(cloudItems, user.uid);
      });

      const recipesQuery = query(
        collection(db, 'recipes'),
        where('authorId', '==', user.uid)
      );
      getDocs(recipesQuery)
        .then((snapshot) => {
          const cloudCount = snapshot.docs.length;
          const currentLocal = getMyLocalRecipesCount(user.uid);
          setLocalMyRecipesCount(Math.max(cloudCount, currentLocal));
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('shopping-list-updated', handleShoppingUpdated);
      window.removeEventListener('my-recipes-updated', handleMyRecipesUpdated);
      window.removeEventListener('mastery-updated', handleMasteryUpdated);
      if (unsubscribeShopping) unsubscribeShopping();
    };
  }, [user, userData, shoppingCount, myRecipesCount, language]);

  const handleToggleDark = () => {
    playClickSound();
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

    if (user?.uid) {
      try {
        updateDoc(doc(db, 'users', user.uid), { 'preferences.darkMode': next }).catch(() => {});
      } catch {}
    }

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

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playClickSound();
    toast.info(
      next
        ? language === 'en'
          ? 'Procedural Sound Effects Enabled'
          : 'Efek Suara Taktil Aktif'
        : language === 'en'
        ? 'Procedural Sound Effects Muted'
        : 'Efek Suara Taktil Dibisukan'
    );
  };

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === language) return;
    playClickSound();
    setLanguage(newLang);
    toast.success(
      newLang === 'en'
        ? 'Language switched to English'
        : 'Bahasa antarmuka diubah ke Bahasa Indonesia'
    );
  };

  const handleDietChange = (diet: string) => {
    playClickSound();
    setSelectedDiet(diet);
    const saved = localStorage.getItem('culinary_prefs');
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.selectedDiet = diet;
    localStorage.setItem('culinary_prefs', JSON.stringify(parsed));

    if (user?.uid) {
      try {
        updateDoc(doc(db, 'users', user.uid), { 'preferences.dietary': diet }).catch(() => {});
      } catch {}
    }

    toast.success(
      language === 'en'
        ? `Dietary preference set to: ${diet}`
        : `Preferensi diet diatur ke: ${diet}`
    );
  };

  const dietOptions = ['None', 'Halal', 'Vegetarian', 'Vegan', 'Gluten Free'];
  const displayedSavedCount = savedRecipeIds ? savedRecipeIds.length : savedCount;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-28 md:pb-16 space-y-6 sm:space-y-8">
      {/* Profile Header & Guild License Card */}
      <div className="bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-5 sm:p-8 border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[6px_6px_0px_#2C1E16] flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 sm:gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16]"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#C85A32] flex items-center justify-center font-display font-black text-2xl sm:text-3xl border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16]">
              <User className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="font-display font-black text-xl sm:text-2xl text-[#2C1E16] dark:text-[#F6EFE2]">
                {user?.displayName || t('Pengguna Tamu')}
              </h1>
              {user && (
                <span className="px-2 py-0.5 rounded-md bg-[#4A7C59] text-white text-[10px] font-black border border-[#2C1E16]">
                  {language === 'en' ? 'Verified Chef' : 'Terverifikasi'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA]">
              {user?.email || (language === 'en' ? 'Guest Adventurer Account' : 'Akun Tamu Petualang')}
            </p>

            {/* Chef Guild Rank Badge */}
            {mastery && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFE4CE] dark:bg-[#2C1E16] border border-[#D99B26] text-xs font-black text-[#9E6E12] dark:text-[#E9B858]">
                <Award className="w-3.5 h-3.5" />
                <span>
                  Lv. {mastery.level} — {mastery.title}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full sm:w-auto">
          {user ? (
            <button
              onClick={() => {
                playClickSound();
                logout();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] hover:bg-[#B83B2B] hover:text-white text-xs font-black text-[#2C1E16] dark:text-[#F6EFE2] border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> {t('Keluar')}
            </button>
          ) : (
            <button
              onClick={() => {
                playClickSound();
                signInWithGoogle();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C85A32] text-white font-black text-xs hover:bg-[#A64422] border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] active:translate-y-0.5"
            >
              {t('Masuk dengan Google')}
            </button>
          )}
        </div>
      </div>

      {/* Chef Mastery & Experience Card */}
      {mastery && (
        <div className="bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-4 sm:p-6 border-[3px] border-[#D99B26] shadow-[5px_5px_0px_#2C1E16] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D99B26] text-[#2C1E16] flex items-center justify-center border border-[#2C1E16] font-black">
                ★
              </div>
              <div>
                <h3 className="font-display font-black text-sm sm:text-base text-[#2C1E16] dark:text-[#F6EFE2]">
                  {language === 'en' ? 'Culinary Grimoire & Mastery' : 'Buku Kemahiran Koki Nusantara'}
                </h3>
                <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA]">
                  {language === 'en'
                    ? 'Earn XP by finishing recipes in Hearth Mode'
                    : 'Kumpulkan XP dengan menyelesaikan masakan di Mode Perapian'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono font-black text-xs sm:text-sm text-[#C85A32]">
                {mastery.xp} XP
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#8C6239] block">
                {language === 'en'
                  ? `Next Level at ${mastery.nextLevelXp} XP`
                  : `Level Berikutnya: ${mastery.nextLevelXp} XP`}
              </span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full h-3 rounded-full bg-[#EFE4CE] dark:bg-[#1C1410] border border-[#5C3A21]/40 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#D99B26] to-[#C85A32] transition-all duration-300"
              style={{ width: `${mastery.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Summary Counters (4 RPG Counters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <Link
          href="/koleksi"
          onClick={() => playClickSound()}
          className="bg-[#FCF9F2] dark:bg-[#241912] p-3 sm:p-4 rounded-2xl border-2 border-[#5C3A21] dark:border-[#8C6239] text-center shadow-[3px_3px_0px_#2C1E16] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#C85A32]/15 text-[#C85A32] flex items-center justify-center mx-auto mb-1.5 sm:mb-2 border border-[#C85A32]/40">
            <Bookmark className="w-4 h-4" />
          </div>
          <span className="font-mono font-black text-lg sm:text-xl text-[#2C1E16] dark:text-[#F6EFE2] block">
            {displayedSavedCount}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#5C3A21] dark:text-[#D9C8AA] line-clamp-1">
            {t('Resep Disimpan')}
          </span>
        </Link>

        <Link
          href="/belanja"
          onClick={() => playClickSound()}
          className="bg-[#FCF9F2] dark:bg-[#241912] p-3 sm:p-4 rounded-2xl border-2 border-[#5C3A21] dark:border-[#8C6239] text-center shadow-[3px_3px_0px_#2C1E16] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#4A7C59]/15 text-[#4A7C59] flex items-center justify-center mx-auto mb-1.5 sm:mb-2 border border-[#4A7C59]/40">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="font-mono font-black text-lg sm:text-xl text-[#2C1E16] dark:text-[#F6EFE2] block">
            {localShoppingCount}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#5C3A21] dark:text-[#D9C8AA] line-clamp-1">
            {t('Bahan Belanja')}
          </span>
        </Link>

        <Link
          href="/koleksi"
          onClick={() => playClickSound()}
          className="bg-[#FCF9F2] dark:bg-[#241912] p-3 sm:p-4 rounded-2xl border-2 border-[#5C3A21] dark:border-[#8C6239] text-center shadow-[3px_3px_0px_#2C1E16] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#D99B26]/15 text-[#D99B26] flex items-center justify-center mx-auto mb-1.5 sm:mb-2 border border-[#D99B26]/40">
            <ChefHat className="w-4 h-4" />
          </div>
          <span className="font-mono font-black text-lg sm:text-xl text-[#2C1E16] dark:text-[#F6EFE2] block">
            {localMyRecipesCount}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#5C3A21] dark:text-[#D9C8AA] line-clamp-1">
            {t('Resep Saya')}
          </span>
        </Link>

        <div className="bg-[#FCF9F2] dark:bg-[#241912] p-3 sm:p-4 rounded-2xl border-2 border-[#5C3A21] dark:border-[#8C6239] text-center shadow-[3px_3px_0px_#2C1E16]">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#4A7C59]/15 text-[#4A7C59] flex items-center justify-center mx-auto mb-1.5 sm:mb-2 border border-[#4A7C59]/40">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-mono font-black text-lg sm:text-xl text-[#2C1E16] dark:text-[#F6EFE2] block">
            {mastery?.cookedRecipeIds.length || 0}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#5C3A21] dark:text-[#D9C8AA] line-clamp-1">
            {language === 'en' ? 'Quests Mastered' : 'Dikuasai'}
          </span>
        </div>
      </div>

      {/* Quick Action: Recipe Management */}
      <div className="bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-4 sm:p-7 border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-black text-base sm:text-lg text-[#2C1E16] dark:text-[#F6EFE2] flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-[#C85A32]" /> {t('Kelola Resep Masakan Anda')}
            </h3>
            <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA] mt-0.5">
              {t('Tulis resep baru atau perbarui resep masakan yang telah Anda publikasikan.')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Link
              href="/resep/tambah"
              onClick={() => playClickSound()}
              className="px-4 py-2.5 rounded-xl bg-[#C85A32] text-white font-black text-xs hover:bg-[#A64422] border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] flex items-center justify-center gap-1.5 active:translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> {t('Tulis Resep')}
            </Link>
            <Link
              href="/koleksi"
              onClick={() => playClickSound()}
              className="px-4 py-2.5 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#2C1E16] dark:text-[#F6EFE2] font-black text-xs hover:bg-[#E2D1B0] border-2 border-[#5C3A21] shadow-[2px_2px_0px_#2C1E16] flex items-center justify-center gap-1.5 active:translate-y-0.5"
            >
              <Edit3 className="w-4 h-4" /> {t('Buka Koleksi Saya')}
            </Link>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-4 sm:p-7 border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16] space-y-6">
        <h3 className="font-display font-black text-base sm:text-lg text-[#2C1E16] dark:text-[#F6EFE2] pb-3 border-b-2 border-[#5C3A21]/20 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#C85A32]" /> {t('Pengaturan & Preferensi')}
        </h3>

        {/* Dark Mode Switch */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-bold text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] block">
              {t('Tampilan Gelap (Dark Mode)')}
            </span>
            <span className="text-[11px] sm:text-xs text-[#5C3A21] dark:text-[#D9C8AA]">
              {t('Menyesuaikan pencahayaan layar agar nyaman saat memasak di dapur')}
            </span>
          </div>
          <button
            onClick={handleToggleDark}
            className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 border-2 border-[#2C1E16] ${
              darkMode ? 'bg-[#C85A32]' : 'bg-[#EFE4CE] dark:bg-[#2C1E16]'
            }`}
            aria-label="Toggle Dark Mode"
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              } flex items-center justify-center`}
            >
              {darkMode ? (
                <Moon className="w-3.5 h-3.5 text-[#C85A32]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-[#D99B26]" />
              )}
            </div>
          </button>
        </div>

        {/* Procedural Sound Effects Toggle */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#5C3A21]/20">
          <div>
            <span className="font-bold text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] block">
              {language === 'en' ? 'Procedural Sound Effects' : 'Efek Suara Taktil (Web Audio SFX)'}
            </span>
            <span className="text-[11px] sm:text-xs text-[#5C3A21] dark:text-[#D9C8AA]">
              {language === 'en'
                ? 'Woodblock taps, page turns, and victory fanfares without external audio downloads'
                : 'Suara ketukan kayu lembut, gesekan perkamen, dan fanfare gamelan pentatonik'}
            </span>
          </div>
          <button
            onClick={handleToggleSound}
            className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 border-2 border-[#2C1E16] ${
              soundActive ? 'bg-[#4A7C59]' : 'bg-[#EFE4CE] dark:bg-[#2C1E16]'
            }`}
            aria-label="Toggle Sound Effects"
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                soundActive ? 'translate-x-6' : 'translate-x-0'
              } flex items-center justify-center`}
            >
              {soundActive ? (
                <Volume2 className="w-3.5 h-3.5 text-[#4A7C59]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[#8C6239]" />
              )}
            </div>
          </button>
        </div>

        {/* Language Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#5C3A21]/20">
          <div>
            <span className="font-bold text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] block">
              {t('Bahasa Antarmuka')}
            </span>
            <span className="text-[11px] sm:text-xs text-[#5C3A21] dark:text-[#D9C8AA]">
              {t('Pilih bahasa yang digunakan di aplikasi')}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 bg-[#EFE4CE] dark:bg-[#1C1410] p-1.5 rounded-xl border border-[#5C3A21]/40 w-full sm:w-auto">
            <button
              onClick={() => handleLanguageChange('id')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition-all text-center ${
                language === 'id'
                  ? 'bg-[#C85A32] text-white border border-[#2C1E16] shadow-[1px_1px_0px_#2C1E16]'
                  : 'text-[#5C3A21] dark:text-[#D9C8AA] hover:text-[#2C1E16]'
              }`}
            >
              ID (Indonesia)
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition-all text-center ${
                language === 'en'
                  ? 'bg-[#C85A32] text-white border border-[#2C1E16] shadow-[1px_1px_0px_#2C1E16]'
                  : 'text-[#5C3A21] dark:text-[#D9C8AA] hover:text-[#2C1E16]'
              }`}
            >
              EN (English)
            </button>
          </div>
        </div>

        {/* Dietary Preferences Chips */}
        <div className="space-y-3 pt-4 border-t border-[#5C3A21]/20">
          <div>
            <span className="font-bold text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] block">
              {t('Preferensi Diet & Pantangan')}
            </span>
            <span className="text-[11px] sm:text-xs text-[#5C3A21] dark:text-[#D9C8AA]">
              {t('Resepedia akan memprioritaskan resep yang sesuai dengan gaya makan Anda')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {dietOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleDietChange(opt)}
                className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all border active:translate-y-0.5 ${
                  selectedDiet === opt
                    ? 'bg-[#4A7C59] text-white border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]'
                    : 'bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] border-[#5C3A21]/30 hover:border-[#5C3A21]'
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
