'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, ChefHat, Plus, ArrowRight, UserCheck } from 'lucide-react';
import { Recipe } from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAuth } from '@/contexts/AuthContext';

interface KoleksiClientProps {
  allRecipes: Recipe[];
  savedRecipeIds: string[];
  userId?: string | null;
}

export default function KoleksiClient({
  allRecipes,
  savedRecipeIds,
  userId,
}: KoleksiClientProps) {
  const { user, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'my-recipes'>('saved');

  const currentUserId = user?.uid || userId;

  // Filter saved recipes
  const savedRecipes = allRecipes.filter((r) => savedRecipeIds.includes(r.id));

  // Filter authored recipes
  const myRecipes = currentUserId
    ? allRecipes.filter((r) => r.authorId === currentUserId)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" /> Koleksi Pribadi
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
            Koleksi & Resep Saya
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Akses cepat resep masakan favorit Anda dan kelola resep yang telah Anda bagikan.
          </p>
        </div>

        <Link
          href="/resep/tambah"
          className="px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary-container shadow-md shadow-primary/20 flex items-center gap-1.5 self-start sm:self-auto transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tulis Resep Baru
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'saved'
              ? 'bg-primary text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Resep Disimpan ({savedRecipes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my-recipes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'my-recipes'
              ? 'bg-primary text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Kreasi Resep Saya ({myRecipes.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'saved' ? (
        <div>
          {savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                Belum ada resep yang disimpan
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                Saat menemukan resep yang Anda sukai, klik ikon bookmark untuk menyimpannya ke koleksi ini.
              </p>
              <Link
                href="/eksplorasi"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container"
              >
                Cari Resep Favorit <ArrowRight className="w-3.5 h-3.5" />
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
                Masuk untuk Melihat Resep Anda
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                Masuk dengan akun Google Anda untuk mulai mempublikasikan resep masakan Anda sendiri.
              </p>
              <button
                onClick={() => signInWithGoogle()}
                className="px-6 py-3 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-md shadow-primary/20"
              >
                Masuk dengan Google
              </button>
            </div>
          ) : myRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={savedRecipeIds.includes(recipe.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
                Belum ada resep yang Anda buat
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                Punya resep rahasia keluarga atau masakan daerah khas Anda? Bagikan ke komunitas Resepedia sekarang!
              </p>
              <Link
                href="/resep/tambah"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container"
              >
                <Plus className="w-4 h-4" /> Tulis Resep Pertamaku
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
