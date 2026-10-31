'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, Star, Flame, Bookmark, ArrowUpRight } from 'lucide-react';
import { Recipe } from '@/types';
import { toggleSaveRecipeAction } from '@/actions/bookmark.actions';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved?: boolean;
}

export default function RecipeCard({ recipe, isSaved = false }: RecipeCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;

    if (!user) {
      toast.error('Silakan masuk untuk menyimpan resep favorit');
      return;
    }

    setIsSaving(true);
    const prevSaved = saved;
    // Optimistic toggle
    setSaved(!prevSaved);

    const res = await toggleSaveRecipeAction(recipe.id, prevSaved, user.uid);
    if (res.success) {
      setSaved(res.isSaved);
      toast.success(
        res.isSaved ? 'Resep disimpan ke koleksi!' : 'Resep dihapus dari koleksi'
      );
    } else {
      setSaved(prevSaved);
      toast.error(res.error || 'Gagal menyimpan resep');
    }
    setIsSaving(false);
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'Easy')
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/50';
    if (diff === 'Medium')
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/50';
    return 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200/50';
  };

  const recipeUrl = `/resep/${recipe.slug || recipe.id}`;

  return (
    <article className="group relative bg-white dark:bg-zinc-900 rounded-[1.75rem] border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Recipe Image with 4:3 Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Region & Category Pills */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 backdrop-blur-md shadow-sm">
            {recipe.region || 'Nusantara'}
          </span>
          {recipe.spicy && (
            <span className="px-2 py-1 rounded-full bg-red-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1 text-[11px] font-bold">
              <Flame className="w-3 h-3 fill-white" /> Pedas
            </span>
          )}
        </div>

        {/* Bookmark Action Button */}
        <button
          onClick={handleBookmark}
          disabled={isSaving}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all z-10 ${
            saved
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-900 hover:scale-110'
          }`}
          title={saved ? 'Hapus dari simpanan' : 'Simpan resep'}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
        </button>

        {/* Difficulty Badge on Image Bottom */}
        <div className="absolute bottom-3 left-3 z-10">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md ${getDifficultyBadge(
              recipe.difficulty
            )}`}
          >
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={recipeUrl} className="block group-hover:text-primary transition-colors">
            <h3 className="font-display font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 line-clamp-1">
              {recipe.title}
            </h3>
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* 3 Core Metrics Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          {/* Total Time */}
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{recipe.cookTime || recipe.prepTime || '20 Mnt'}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 font-bold text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{recipe.rating && recipe.rating > 0 ? recipe.rating : '4.8'}</span>
            <span className="text-[10px] text-zinc-400">
              ({recipe.ratingCount || 12})
            </span>
          </div>

          {/* Details CTA Link */}
          <Link
            href={recipeUrl}
            className="flex items-center gap-0.5 text-primary font-bold text-xs hover:underline"
          >
            Lihat <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
