'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Bookmark, ChefHat, Plus, ArrowRight, BookOpen } from 'lucide-react';
import { Recipe } from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMyLocalRecipes } from '@/lib/utils/recipe-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { playClickSound } from '@/lib/utils/sound-effects';

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
  const [cloudAuthoredRecipes, setCloudAuthoredRecipes] = useState<Recipe[]>([]);

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

  // Fetch authored recipes from Cloud Firestore when user is logged in
  useEffect(() => {
    if (user?.uid) {
      const q = query(collection(db, 'recipes'), where('authorId', '==', user.uid));
      getDocs(q)
        .then((snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Recipe));
          setCloudAuthoredRecipes(list);
        })
        .catch(() => {});
    }
  }, [user]);

  // Combined pool of all available recipes
  const allAvailableRecipes = useMemo(() => {
    const map = new Map<string, Recipe>();
    allRecipes.forEach((r) => map.set(r.id, r));
    cloudAuthoredRecipes.forEach((r) => map.set(r.id, r));
    localMyRecipes.forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  }, [allRecipes, cloudAuthoredRecipes, localMyRecipes]);

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
    cloudAuthoredRecipes.forEach((r) => map.set(r.id, r));
    localMyRecipes.forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  }, [allRecipes, cloudAuthoredRecipes, localMyRecipes, currentUserId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#5C3A21]/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#C85A32] font-black text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" /> {language === 'en' ? 'Chef Grimoire' : 'Kitab Koleksi Pribadi'}
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#2C1E16] dark:text-[#F6EFE2]">
            {t('Koleksi & Resep Saya')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] mt-1">
            {t('Akses cepat resep masakan favorit Anda dan kelola resep yang telah Anda bagikan.')}
          </p>
        </div>

        <Link
          href="/resep/tambah"
          onClick={() => playClickSound()}
          className="px-5 py-2.5 rounded-xl bg-[#C85A32] text-white font-black text-xs hover:bg-[#A64422] border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] flex items-center gap-1.5 self-start sm:self-auto transition-transform active:translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-3" /> {t('Tulis Resep Baru')}
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('saved');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap shrink-0 border-2 active:translate-y-0.5 ${
            activeTab === 'saved'
              ? 'bg-[#C85A32] text-white border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]'
              : 'bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] border-[#5C3A21]/30 hover:border-[#5C3A21]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>
            {t('Resep Disimpan')} ({savedRecipes.length})
          </span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveTab('my-recipes');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap shrink-0 border-2 active:translate-y-0.5 ${
            activeTab === 'my-recipes'
              ? 'bg-[#C85A32] text-white border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]'
              : 'bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] border-[#5C3A21]/30 hover:border-[#5C3A21]'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {savedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} isSaved={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-3 border-dashed border-[#5C3A21]/40 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EFE4CE] text-[#C85A32] flex items-center justify-center mx-auto border border-[#5C3A21]/30">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#2C1E16] dark:text-[#F6EFE2]">
                {t('Belum ada resep yang disimpan')}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] max-w-md mx-auto">
                {t('Jelajahi resep Nusantara dan klik tombol bookmark untuk menyimpannya di sini.')}
              </p>
              <Link
                href="/eksplorasi"
                onClick={() => playClickSound()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-black border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
              >
                {t('Jelajahi Resep Sekarang')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div>
          {!currentUserId ? (
            <div className="text-center py-20 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-3 border-[#5C3A21] dark:border-[#8C6239] p-8 space-y-4 shadow-[4px_4px_0px_#2C1E16]">
              <div className="w-16 h-16 rounded-2xl bg-[#EFE4CE] text-[#C85A32] flex items-center justify-center mx-auto border border-[#5C3A21]/30">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#2C1E16] dark:text-[#F6EFE2]">
                {language === 'en' ? 'Sign In to View Your Recipes' : 'Masuk untuk Melihat Resep Anda'}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] max-w-md mx-auto">
                {language === 'en'
                  ? 'Sign in with your Google account to start publishing and editing your own recipes.'
                  : 'Masuk dengan akun Google Anda untuk mulai mempublikasikan dan mengedit resep masakan Anda sendiri.'}
              </p>
              <button
                onClick={() => {
                  playClickSound();
                  signInWithGoogle();
                }}
                className="px-6 py-3 rounded-xl bg-[#C85A32] text-white text-xs font-black hover:bg-[#A64422] border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] active:translate-y-0.5"
              >
                {t('Masuk dengan Google')}
              </button>
            </div>
          ) : myRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
            <div className="text-center py-20 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-3 border-dashed border-[#5C3A21]/40 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EFE4CE] text-[#C85A32] flex items-center justify-center mx-auto border border-[#5C3A21]/30">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#2C1E16] dark:text-[#F6EFE2]">
                {t('Belum ada resep buatan Anda')}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] max-w-md mx-auto">
                {t('Bagikan resep keluarga atau kreasi kuliner Nusantara Anda kepada komunitas.')}
              </p>
              <Link
                href="/resep/tambah"
                onClick={() => playClickSound()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-black border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
              >
                <Plus className="w-4 h-4 stroke-3" /> {t('Tulis Resep Baru')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
