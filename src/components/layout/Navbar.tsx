'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Bookmark,
  ShoppingBag,
  Plus,
  Search,
  User,
  ChefHat,
  Moon,
  Sun,
  X,
  BookOpen,
  Volume2,
  VolumeX,
  Award,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import SpiceAlmanacDrawer from '@/components/recipe/SpiceAlmanacDrawer';
import { isSoundEnabled, setSoundEnabled, playClickSound } from '@/lib/utils/sound-effects';
import { getLocalMastery, UserMastery } from '@/lib/utils/mastery-storage';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAlmanacOpen, setIsAlmanacOpen] = useState(false);
  const [almanacInitialQuery, setAlmanacInitialQuery] = useState('');
  const [soundActive, setSoundActive] = useState(true);
  const [mastery, setMastery] = useState<UserMastery | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    setSoundActive(isSoundEnabled());
    setMastery(getLocalMastery(user?.uid, language));

    const handleMasteryUpdate = () => {
      setMastery(getLocalMastery(user?.uid, language));
    };

    const handleOpenAlmanac = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.query) {
        setAlmanacInitialQuery(customEvent.detail.query);
      }
      setIsAlmanacOpen(true);
    };

    window.addEventListener('mastery-updated', handleMasteryUpdate);
    window.addEventListener('open-spice-almanac', handleOpenAlmanac);

    return () => {
      window.removeEventListener('mastery-updated', handleMasteryUpdate);
      window.removeEventListener('open-spice-almanac', handleOpenAlmanac);
    };
  }, [user, language]);

  const toggleDarkMode = () => {
    playClickSound();
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const saved = localStorage.getItem('culinary_prefs');
    const parsed = saved ? JSON.parse(saved) : {};
    parsed.darkMode = nextDark;
    localStorage.setItem('culinary_prefs', JSON.stringify(parsed));
  };

  const toggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  const navLinks = [
    { name: t('Beranda'), href: '/' },
    { name: t('Eksplorasi'), href: '/eksplorasi' },
    { name: t('Koleksi'), href: '/koleksi' },
    { name: t('Daftar Belanja'), href: '/belanja' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      playClickSound();
      router.push(`/eksplorasi?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F6EFE2]/95 dark:bg-[#1C1410]/95 backdrop-blur-md border-b-2 border-[#5C3A21]/30 dark:border-[#8C6239]/40 shadow-[0px_4px_0px_rgba(44,30,22,0.06)]'
            : 'bg-[#F6EFE2] dark:bg-[#1C1410] border-b border-[#5C3A21]/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Brand Logo - Papan Nama Kedai */}
            <Link
              href="/"
              onClick={() => playClickSound()}
              className="flex items-center gap-2 group shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] transition-transform group-hover:scale-105">
                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="font-display font-black text-base sm:text-2xl tracking-tight text-[#2C1E16] dark:text-[#F6EFE2]">
                  Resepedia
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-[#C85A32] dark:text-[#E26E45] -mt-1">
                  {language === 'en' ? 'Archipelago Tavern' : 'Kedai Kuliner Nusantara'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#EFE4CE] dark:bg-[#2C1E16] p-1.5 rounded-2xl border-2 border-[#5C3A21]/50 dark:border-[#8C6239]/50 shadow-[2px_2px_0px_#2C1E16]">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => playClickSound()}
                    className={`px-3.5 lg:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#C85A32] text-white border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]'
                        : 'text-[#5C3A21] dark:text-[#D9C8AA] hover:text-[#2C1E16] hover:bg-[#E2D1B0] dark:hover:bg-[#422B1D]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Trigger */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsSearchOpen(true);
                }}
                className="w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] text-xs font-bold border-2 border-[#5C3A21]/40 dark:border-[#8C6239]/50 hover:border-[#5C3A21] transition-colors shrink-0 flex items-center justify-center"
                title={language === 'en' ? 'Search scrolls' : 'Cari Resep'}
                aria-label="Cari Resep"
              >
                <Search className="w-4 h-4 text-[#8C6239]" />
                <span className="hidden lg:inline text-[#8C6239] ml-1.5">
                  {language === 'en' ? 'Search scrolls...' : 'Cari gulungan...'}
                </span>
                <kbd className="hidden lg:inline ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-[#E2D1B0] dark:bg-[#422B1D] rounded text-[#5C3A21] dark:text-[#E2D1B0]">
                  ⌘K
                </kbd>
              </button>

              {/* Kitab Rempah & Almanak Substitusi (Zero AI, Pure Craft) */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsAlmanacOpen(true);
                }}
                className="w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center gap-1.5 p-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#4A7C59] text-white hover:bg-[#365C41] text-xs font-bold border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] transition-transform active:translate-y-0.5 shrink-0"
                title={language === 'en' ? 'Open Spice Almanac' : 'Buka Kitab Rempah & Substitusi'}
                aria-label="Kitab Rempah"
              >
                <BookOpen className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">
                  {language === 'en' ? 'Spice Almanac' : 'Kitab Rempah'}
                </span>
              </button>

              {/* Add Recipe Button (Always visible) */}
              <Link
                href="/resep/tambah"
                onClick={() => playClickSound()}
                className="w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center gap-1 p-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#C85A32] text-white hover:bg-[#A64422] text-xs font-bold border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] transition-transform active:translate-y-0.5 shrink-0"
                title={t('Tulis Resep')}
                aria-label={t('Tulis Resep')}
              >
                <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">{t('Tulis Resep')}</span>
              </Link>

              {/* Sound Effects Toggle (Hidden on mobile to save space, visible from sm up) */}
              <button
                onClick={toggleSound}
                className="hidden sm:flex p-2 sm:p-2.5 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] hover:bg-[#E2D1B0] dark:hover:bg-[#422B1D] border-2 border-[#5C3A21]/30 transition-colors shrink-0"
                title={soundActive ? 'Matikan Suara SFX' : 'Nyalakan Suara SFX'}
                aria-label="Toggle Sound Effects"
              >
                {soundActive ? (
                  <Volume2 className="w-4 h-4 text-[#4A7C59]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#8C6239]" />
                )}
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center p-1.5 sm:p-2.5 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] hover:bg-[#E2D1B0] dark:hover:bg-[#422B1D] border-2 border-[#5C3A21]/30 transition-colors shrink-0"
                title="Ganti Suasana (Siang / Malam)"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-[#D99B26]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#5C3A21]" />
                )}
              </button>

              {/* Profile / Guild Rank Badge */}
              <Link
                href="/profil"
                onClick={() => playClickSound()}
                className="flex items-center gap-1.5 p-1 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] border-2 border-[#5C3A21]/40 hover:border-[#C85A32] transition-colors shrink-0"
                title={mastery ? `${mastery.title} (Level ${mastery.level})` : 'Profil Pengguna'}
                aria-label="Profil Pengguna"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#2C1E16]"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#E2D1B0] dark:bg-[#422B1D] flex items-center justify-center text-[#5C3A21] dark:text-[#E2D1B0]">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
                {mastery && (
                  <div className="hidden xl:flex flex-col pr-1 text-left">
                    <span className="text-[10px] font-black text-[#C85A32] leading-tight">
                      Lv. {mastery.level}
                    </span>
                    <span className="text-[9px] font-semibold text-[#5C3A21] dark:text-[#D9C8AA] leading-none line-clamp-1">
                      {mastery.title}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Global Command / Search Modal */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-[#FCF9F2] dark:bg-[#1C1410] rounded-2xl p-4 shadow-[6px_6px_0px_#2C1E16] border-[3px] border-[#5C3A21] dark:border-[#8C6239]">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-3 border-b-2 border-[#5C3A21]/20 dark:border-[#8C6239]/40 pb-3"
              >
                <Search className="w-5 h-5 text-[#C85A32]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Search recipes, spices (candlenut, ginger, coconut), or regions...'
                      : 'Cari masakan, bahan (ayam, santan, tahu), atau daerah...'
                  }
                  autoFocus
                  className="flex-1 bg-transparent text-sm sm:text-base text-[#2C1E16] dark:text-[#F6EFE2] placeholder-[#8C6239]/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-[#8C6239] hover:text-[#2C1E16] dark:hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
              <div className="mt-3 flex items-center justify-between text-xs text-[#8C6239] px-1 font-mono">
                <span>{language === 'en' ? 'Press Enter to explore' : 'Tekan Enter untuk mencari'}</span>
                <span>{language === 'en' ? 'Resepedia Grimoire' : 'Katalog Resepedia'}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Spice Almanac Modal Drawer */}
      <SpiceAlmanacDrawer
        isOpen={isAlmanacOpen}
        onClose={() => setIsAlmanacOpen(false)}
        initialQuery={almanacInitialQuery}
      />
    </>
  );
}
