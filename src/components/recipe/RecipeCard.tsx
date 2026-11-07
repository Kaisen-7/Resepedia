'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, Star, Flame, Bookmark, ArrowUpRight, Edit3 } from 'lucide-react';
import { Recipe } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved?: boolean;
  canEdit?: boolean;
}

export default function RecipeCard({
  recipe,
  isSaved = false,
  canEdit = false,
}: RecipeCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const { user, isRecipeSaved, toggleBookmark } = useAuth();
  const { t, language } = useLanguage();

  const saved = isRecipeSaved(recipe.id) || isSaved;

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const isNowSaved = await toggleBookmark(recipe.id);
      toast.success(
        isNowSaved
          ? language === 'en'
            ? 'Recipe saved to collection!'
            : 'Resep disimpan ke koleksi!'
          : language === 'en'
          ? 'Recipe removed from collection'
          : 'Resep dihapus dari koleksi'
      );
    } catch {
      toast.error(language === 'en' ? 'Failed to save recipe' : 'Gagal menyimpan resep');
    } finally {
      setIsSaving(false);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'Easy')
      return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60';
    if (diff === 'Medium')
      return 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60';
    return 'bg-red-50 text-red-800 dark:bg-red-950/70 dark:text-red-300 border-red-200/60 dark:border-red-800/60';
  };

  const recipeUrl = `/resep/${recipe.slug || recipe.id}`;
  const editUrl = `/resep/${recipe.slug || recipe.id}/edit`;
  const isOwner = canEdit || (user && user.uid === recipe.authorId);
  const hasReviews = typeof recipe.ratingCount === 'number' && recipe.ratingCount > 0;

  return (
    <article className="group relative bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col h-full">
      {/* Recipe Image with 4:3 Aspect Ratio (Clickable to Recipe Detail) */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Link
          href={recipeUrl}
          className="block w-full h-full relative focus:outline-none"
          title={`${t('Lihat')} ${recipe.title}`}
        >
          <img
            src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
            loading="lazy"
          />

          {/* Gradient Overlay for Contrast */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        </Link>

        {/* Region & Spicy Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 shadow-sm">
            {recipe.region || 'Nusantara'}
          </span>
          {recipe.spicy && (
            <span className="px-2 py-1 rounded-full bg-red-600 text-white shadow-sm flex items-center gap-1 text-[11px] font-bold">
              <Flame className="w-3 h-3 fill-white" /> {t('Pedas')}
            </span>
          )}
        </div>

        {/* Action Buttons Top Right: Edit (if owner) and Bookmark */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          {isOwner && (
            <Link
              href={editUrl}
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 hover:text-primary hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-transform active:scale-95"
              title={t('Edit Resep Ini')}
            >
              <Edit3 className="w-4 h-4" />
            </Link>
          )}

          <button
            onClick={handleBookmark}
            disabled={isSaving}
            className={`p-2.5 rounded-full transition-all shadow-sm ${
              saved
                ? 'bg-primary text-white shadow-primary/30'
                : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 hover:text-primary'
            }`}
            title={saved ? (language === 'en' ? 'Remove from saved' : 'Hapus dari simpanan') : (language === 'en' ? 'Save recipe' : 'Simpan resep')}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Difficulty Badge on Image Bottom */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
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
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={recipeUrl} className="block group-hover:text-primary transition-colors">
            <h3 className="font-display font-bold text-base sm:text-xl text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug">
              {recipe.title}
            </h3>
          </Link>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Metrics Footer */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
          {/* Total Time */}
          <div className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{recipe.cookTime || recipe.prepTime || '20 Mnt'}</span>
          </div>

          {/* Authentic Rating - starts at 0 if no reviews */}
          {hasReviews ? (
            <div className="flex items-center gap-1 font-bold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{recipe.rating.toFixed(1)}</span>
              <span className="text-[10px] text-zinc-400 font-normal">
                ({recipe.ratingCount})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              <Star className="w-3 h-3 text-zinc-300 dark:text-zinc-600" />
              <span>{language === 'en' ? 'No reviews' : 'Belum diulas'}</span>
            </div>
          )}

          {/* Details CTA Link */}
          <Link
            href={recipeUrl}
            className="flex items-center gap-0.5 text-primary font-bold text-xs hover:underline"
          >
            {t('Lihat')} <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
