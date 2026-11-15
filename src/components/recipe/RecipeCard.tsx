'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Star, Flame, Bookmark, ArrowUpRight, Edit3, Zap, CheckCircle2 } from 'lucide-react';
import { Recipe } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { playClickSound } from '@/lib/utils/sound-effects';
import { getLocalCookedRecipeIds } from '@/lib/utils/mastery-storage';

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
  const [isMastered, setIsMastered] = useState(false);
  const toast = useToast();
  const { user, isRecipeSaved, toggleBookmark } = useAuth();
  const { t, language } = useLanguage();

  const isSavedInAuth = isRecipeSaved(recipe.id);
  const [localSaved, setLocalSaved] = useState(isSavedInAuth || isSaved);

  useEffect(() => {
    setLocalSaved(isRecipeSaved(recipe.id));
    const cookedIds = getLocalCookedRecipeIds(user?.uid);
    setIsMastered(cookedIds.includes(recipe.id));
  }, [isRecipeSaved, recipe.id, user]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;

    playClickSound();
    setIsSaving(true);
    try {
      const isNowSaved = await toggleBookmark(recipe.id);
      setLocalSaved(isNowSaved);
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
      return {
        badgeClass: 'bg-[#4A7C59] text-white border-[#2C1E16]',
        label: language === 'en' ? '★ Rank C (Beginner)' : '★ Rank C (Pemula)',
      };
    if (diff === 'Medium')
      return {
        badgeClass: 'bg-[#D99B26] text-[#2C1E16] border-[#2C1E16]',
        label: language === 'en' ? '★★ Rank B (Skilled)' : '★★ Rank B (Terampil)',
      };
    return {
      badgeClass: 'bg-[#B83B2B] text-white border-[#2C1E16]',
      label: language === 'en' ? '★★★ Rank A (Mastery)' : '★★★ Rank A (Mahakarya)',
    };
  };

  const recipeUrl = `/resep/${recipe.slug || recipe.id}`;
  const editUrl = `/resep/${recipe.slug || recipe.id}/edit`;
  const isOwner = canEdit || (user && user.uid === recipe.authorId);
  const hasReviews = typeof recipe.ratingCount === 'number' && recipe.ratingCount > 0;
  const rankInfo = getDifficultyBadge(recipe.difficulty);

  return (
    <article className="group relative bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-2 border-[#5C3A21] dark:border-[#8C6239] overflow-hidden shadow-[4px_4px_0px_#2C1E16] hover:shadow-[6px_6px_0px_#2C1E16] hover:-translate-x-0.5 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-150 flex flex-col h-full">
      {/* Recipe Image with 4:3 Aspect Ratio */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#EFE4CE] dark:bg-[#1C1410] border-b-2 border-[#5C3A21] dark:border-[#8C6239]">
        <Link
          href={recipeUrl}
          onClick={() => playClickSound()}
          className="block w-full h-full relative focus:outline-none"
          title={`${t('Lihat')} ${recipe.title}`}
        >
          <img
            src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
            loading="lazy"
          />

          {/* Vignette Overlay for Warmth */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
        </Link>

        {/* Region & Mastered Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#EFE4CE] text-[#2C1E16] border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]">
            {language === 'en' ? `Seal of ${recipe.region || 'Nusantara'}` : `Segel ${recipe.region || 'Nusantara'}`}
          </span>
          {isMastered && (
            <span className="px-2 py-0.5 rounded-md bg-[#4A7C59] text-white border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] flex items-center gap-1 text-[10px] font-black">
              <CheckCircle2 className="w-3 h-3" />
              {language === 'en' ? 'Mastered' : 'Dikuasai'}
            </span>
          )}
        </div>

        {/* Action Buttons Top Right: Edit (if owner) and Bookmark */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
          {isOwner && (
            <Link
              href={editUrl}
              onClick={(e) => {
                e.stopPropagation();
                playClickSound();
              }}
              className="p-2 rounded-xl bg-[#FCF9F2] text-[#2C1E16] hover:bg-[#EFE4CE] border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] transition-transform active:translate-y-0.5"
              title={t('Edit Resep Ini')}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={handleBookmark}
            disabled={isSaving}
            className={`p-2 rounded-xl transition-all border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5 ${
              localSaved
                ? 'bg-[#C85A32] text-white'
                : 'bg-[#FCF9F2] text-[#2C1E16] hover:bg-[#EFE4CE]'
            }`}
            title={
              localSaved
                ? language === 'en'
                  ? 'Remove from saved'
                  : 'Hapus dari simpanan'
                : language === 'en'
                ? 'Save recipe'
                : 'Simpan resep'
            }
          >
            <Bookmark className={`w-3.5 h-3.5 ${localSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Difficulty Rank Badge on Image Bottom */}
        <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
          <span
            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wide border-2 shadow-[2px_2px_0px_#2C1E16] ${rankInfo.badgeClass}`}
          >
            {rankInfo.label}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link
            href={recipeUrl}
            onClick={() => playClickSound()}
            className="block group-hover:text-[#C85A32] transition-colors"
          >
            <h3 className="font-display font-black text-base sm:text-lg text-[#2C1E16] dark:text-[#F6EFE2] line-clamp-1 leading-snug">
              {recipe.title}
            </h3>
          </Link>
          <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA] mt-1 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* RPG Buffs & Metrics Bar */}
        <div className="mt-3 pt-2.5 border-t border-[#5C3A21]/20 dark:border-[#8C6239]/30 flex items-center justify-between text-[11px] text-[#5C3A21] dark:text-[#D9C8AA]">
          {/* Prep & Cook Time */}
          <div className="flex items-center gap-1 font-bold">
            <Clock className="w-3.5 h-3.5 text-[#8C6239]" />
            <span>{recipe.cookTime || recipe.prepTime || '20 Mnt'}</span>
          </div>

          {/* Stamina Buff from Calories */}
          <div className="hidden sm:flex items-center gap-1 font-mono font-bold text-[#4A7C59] dark:text-[#88C59A]">
            <Zap className="w-3.5 h-3.5" />
            <span>+{recipe.calories ? parseInt(recipe.calories) || 350 : 350} Stamina</span>
          </div>

          {/* Authentic Rating */}
          {hasReviews ? (
            <div className="flex items-center gap-1 font-bold text-[#D99B26]">
              <Star className="w-3.5 h-3.5 fill-[#D99B26] text-[#D99B26]" />
              <span>{recipe.rating.toFixed(1)}</span>
              <span className="text-[10px] text-[#8C6239] font-normal">
                ({recipe.ratingCount})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] font-medium text-[#8C6239]">
              <Star className="w-3 h-3 text-[#D9C8AA]" />
              <span>{language === 'en' ? 'Unrated' : 'Belum diulas'}</span>
            </div>
          )}

          {/* Details CTA Link */}
          <Link
            href={recipeUrl}
            onClick={() => playClickSound()}
            className="flex items-center gap-0.5 text-[#C85A32] font-black text-xs hover:underline"
          >
            {language === 'en' ? 'Quest' : 'Racik'} <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
