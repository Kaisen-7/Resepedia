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
  Menu,
  X,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/contexts/AIContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signInWithGoogle, isGuest } = useAuth();
  const { openAI } = useAI();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

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
  }, []);

  const toggleDarkMode = () => {
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

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Eksplorasi', href: '/eksplorasi' },
    { name: 'Koleksi', href: '/koleksi' },
    { name: 'Daftar Belanja', href: '/belanja' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/eksplorasi?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-surface/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/70 dark:border-zinc-800/70 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-on-surface">
                Resepedia
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary block -mt-1">
                Katalog Nusantara
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-container-low dark:bg-zinc-800/60 p-1.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface-container-low dark:bg-zinc-800/80 text-on-surface-variant text-xs font-semibold hover:border-primary/50 transition-colors border border-transparent"
              title="Cari Resep"
            >
              <Search className="w-4 h-4 text-zinc-400" />
              <span className="hidden lg:inline text-zinc-400">Cari resep...</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300">
                ⌘K
              </kbd>
            </button>

            {/* Asisten Dapur Button */}
            <button
              onClick={() => openAI()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all active:scale-95 border border-primary/20"
              title="Konsultasi racikan bumbu dan panduan masak"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Asisten Dapur</span>
            </button>

            {/* Add Recipe Button */}
            <Link
              href="/resep/tambah"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-container text-xs font-bold shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Resep</span>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full hover:bg-surface-container-high dark:hover:bg-zinc-800 text-on-surface-variant transition-colors"
              title="Ganti Tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile / Auth Avatar */}
            <Link
              href="/profil"
              className="p-1 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-primary transition-colors"
              title="Profil Pengguna"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Global Command / Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Search className="w-5 h-5 text-primary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari masakan, bahan (ayam, santan, tahu), atau daerah..."
                autoFocus
                className="flex-1 bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 px-1">
              <span>Tekan <strong>Enter</strong> untuk mencari</span>
              <span>Katalog Resepedia</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
