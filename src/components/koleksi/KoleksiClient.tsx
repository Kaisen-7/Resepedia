'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Bookmark, ChefHat, Plus, ArrowRight } from 'lucide-react';
import { Recipe } from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMyLocalRecipes } from '@/lib/utils/recipe-storage';

interface KoleksiClientProps {
  allRecipes: Recipe[];
  savedRecipeIds: string[];
  userId?: string | null;
}

export default function KoleksiClient({
  allRecipes,
  savedRecipeIds: initialSavedRecipeIds,
  userId,
}: KoleksiClientProps) {
  const { user, signInWithGoogle, savedRecipeIds: authSavedRecipeIds } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'saved' | 'my-recipes'>('saved');
  const [localMyRecipes, setLocalMyRecipes] = useState<Recipe[]>([]);

  const currentUserId = user?.uid || userId;

  // Active saved IDs synced from AuthContext or initial props
  const activeSavedIds = useMemo(() => {
    return Array.from(new Set([...(authSavedRecipeIds || []), ...(initialSavedRecipeIds || [])]));
  }, [authSavedRecipeIds, initialSavedRecipeIds]);

  // Load and listen to local recipes created by user
  useEffect(() => {
    const loadMy = () => {
      setLocalMyRecipes(getMyLocalRecipes(currentUserId));
    };
    loadMy();

    window.addEventListener('my-recipes-updated', loadMy);
    return () => window.removeEventListener('my-recipes-updated', loadMy);
  }, [currentUserId]);

  // Combined pool of all available recipes (server fallback + user creations)
  const allAvailableRecipes = useMemo(() => {
    const map = new Map<string, Recipe>();
    allRecipes.forEach((r) => map.set(r.id, r));
    localMyRecipes.forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  }, [allRecipes, localMyRecipes]);

  // Filter saved recipes
  const savedRecipes = useMemo(() => {
    return allAvailableRecipes.filter((r) => activeSavedIds.includes(r.id));
  }, [allAvailableRecipes, activeSavedIds]);

  // Filter authored recipes
  const myRecipes = useMemo(() => {
    if (!currentUserId) return [];
    const serverAuthored = allRecipes.filter((r) => r.authorId === currentUserId);
    const map = new Map<string, Recipe>();
    serverAuthored.forEach((r) => map.set(r.id, r));
    localMyRecipes.forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  }, [allRecipes, localMyRecipes, currentUserId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" /> {t('Koleksi Pribadi')}
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
            {t('Koleksi & Resep Saya')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {t('Akses cepat resep masakan favorit Anda dan kelola resep yang telah Anda bagikan.')}
          </p>
        </div>

        <Link
          href="/resep/tambah"
          className="px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary-container shadow-md shadow-primary/20 flex items-center gap-1.5 self-start sm:self-auto transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> {t('Tulis Resep Baru')}
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'saved'
              ? 'bg-primary text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>
            {t('Resep Disimpan')} ({savedRecipes.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('my-recipes')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'my-recipes'
              ? 'bg-primary text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>
            {t('Kreasi Resep Saya')} ({myRecipes.length})
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'saved' ? (
        <div>
          {savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {savedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} isSaved={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
                {t('Belum ada resep yang disimpan')}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                {t('Jelajahi resep Nusantara dan klik tombol bookmark untuk menyimpannya di sini.')}
              </p>
              <Link
                href="/eksplorasi"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-sm"
              >
                {t('Jelajahi Resep Sekarang')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div>
          {!currentUserId ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
                {language === 'en' ? 'Sign In to View Your Recipes' : 'Masuk untuk Melihat Resep Anda'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                {language === 'en'
                  ? 'Sign in with your Google account to start publishing and editing your own recipes.'
                  : 'Masuk dengan akun Google Anda untuk mulai mempublikasikan dan mengedit resep masakan Anda sendiri.'}
              </p>
              <button
                onClick={() => signInWithGoogle()}
                className="px-6 py-3 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-md shadow-primary/20"
              >
                {t('Masuk dengan Google')}
              </button>
            </div>
          ) : myRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {myRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={activeSavedIds.includes(recipe.id)}
                  canEdit={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
                {t('Belum ada resep buatan Anda')}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                {t('Bagikan resep keluarga atau kreasi kuliner Nusantara Anda kepada komunitas.')}
              </p>
              <Link
                href="/resep/tambah"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-sm"
              >
                <Plus className="w-4 h-4" /> {t('Tulis Resep Baru')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
