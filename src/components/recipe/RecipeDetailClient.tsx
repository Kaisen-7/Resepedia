'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Flame,
  Users,
  Star,
  Bookmark,
  Share2,
  Printer,
  ChevronLeft,
  Volume2,
  Play,
  ShoppingBag,
  Bell,
  Heart,
  Send,
  ChefHat,
  Edit3,
  BookOpen,
  CheckCircle2,
  Search,
  Check,
  Zap,
} from 'lucide-react';
import { Recipe, Comment } from '@/types';
import PortionScaler from './PortionScaler';
import HandsFreeCookModal from './HandsFreeCookModal';
import SpiceAlmanacDrawer from './SpiceAlmanacDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useTimer } from '@/contexts/TimerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { addShoppingItem } from '@/lib/utils/shopping-storage';
import {
  createCommentAction,
  incrementCommentHelpfulAction,
} from '@/actions/comment.actions';
import { findSpiceByIngredientName } from '@/lib/data/spice-almanac';
import { playClickSound, playChimeSound } from '@/lib/utils/sound-effects';
import { getYouTubeEmbedInfo } from '@/lib/utils/youtube';

interface RecipeDetailClientProps {
  recipe: Recipe;
  initialComments: Comment[];
  isSavedInitial?: boolean;
}

export default function RecipeDetailClient({
  recipe,
  initialComments,
  isSavedInitial = false,
}: RecipeDetailClientProps) {
  const { user, isRecipeSaved, toggleBookmark } = useAuth();
  const toast = useToast();
  const { startTimer } = useTimer();
  const { t, language } = useLanguage();

  const [multiplier, setMultiplier] = useState(1);
  const [isZenModeOpen, setIsZenModeOpen] = useState(false);
  const [isAlmanacOpen, setIsAlmanacOpen] = useState(false);
  const [selectedSpiceId, setSelectedSpiceId] = useState<string | null>(null);
  const [almanacInitialQuery, setAlmanacInitialQuery] = useState('');

  const [isSaved, setIsSaved] = useState(isRecipeSaved(recipe.id) || isSavedInitial);
  const [isSaving, setIsSaving] = useState(false);

  // Interactive RPG Crafting Grid & Quest Progress
  const [preparedIngredients, setPreparedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    setIsSaved(isRecipeSaved(recipe.id));
  }, [isRecipeSaved, recipe.id]);

  // Comments & Rating State
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [recipeState, setRecipeState] = useState(recipe);

  const isOwner = Boolean(user && user.uid === recipe.authorId);
  const hasReviews =
    typeof recipeState.ratingCount === 'number' && recipeState.ratingCount > 0;

  // Scale quantity strings (e.g., "500 gram" * 2 = "1000 gram")
  const scaleQuantity = (detail: string, mult: number): string => {
    if (!detail) return '';
    return detail.replace(/(\d+(?:[.,]\d+)?)/g, (match) => {
      const num = parseFloat(match.replace(',', '.'));
      if (isNaN(num)) return match;
      const scaled = num * mult;
      return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
    });
  };

  const handleToggleSave = async () => {
    if (isSaving) return;
    playClickSound();
    setIsSaving(true);
    try {
      const isNowSaved = await toggleBookmark(recipe.id);
      setIsSaved(isNowSaved);
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

  const handleToggleIngredientPrepared = (idx: number) => {
    playChimeSound();
    setPreparedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleToggleStepCompleted = (idx: number) => {
    playClickSound();
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleOpenAlmanacForIngredient = (ingName: string, spiceId?: string) => {
    playClickSound();
    if (spiceId) {
      setSelectedSpiceId(spiceId);
      setAlmanacInitialQuery('');
    } else {
      setSelectedSpiceId(null);
      setAlmanacInitialQuery(ingName);
    }
    setIsAlmanacOpen(true);
  };

  const handleAddAllIngredientsToShopping = async () => {
    playClickSound();
    try {
      for (const ing of recipe.ingredients) {
        const scaledDetail = scaleQuantity(ing.detail, multiplier);
        await addShoppingItem(ing.name, scaledDetail, recipe.title, user?.uid);
      }
      toast.success(
        language === 'en'
          ? `Added ${recipe.ingredients.length} items to shopping list!`
          : `${recipe.ingredients.length} bahan dimasukkan ke daftar belanja!`
      );
    } catch {
      toast.error(
        language === 'en'
          ? 'Failed to add items to shopping list'
          : 'Gagal memasukkan bahan ke daftar belanja'
      );
    }
  };

  const handleAddSingleIngredient = async (name: string, detail: string) => {
    playClickSound();
    try {
      const scaledDetail = scaleQuantity(detail, multiplier);
      await addShoppingItem(name, scaledDetail, recipe.title, user?.uid);
      toast.success(
        language === 'en'
          ? `Added ${name} to shopping list`
          : `${name} dimasukkan ke daftar belanja`
      );
    } catch {
      toast.error(
        language === 'en' ? 'Failed to add item' : 'Gagal memasukkan bahan'
      );
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    playClickSound();
    setIsSubmittingComment(true);
    const authorName =
      user?.displayName ||
      (language === 'en' ? 'Culinary Explorer' : 'Penjelajah Rasa');
    const authorAvatar = user?.photoURL || null;

    const author = {
      id: user?.uid || 'anonymous',
      name: authorName,
      avatarUrl: authorAvatar,
    };

    try {
      const commentRes = await createCommentAction(
        recipe.id,
        commentText.trim(),
        author,
        selectedRating
      );

      if (commentRes.success && commentRes.comment) {
        setComments((prev) => [commentRes.comment!, ...prev]);
        if (
          commentRes.newRating !== undefined &&
          commentRes.newCount !== undefined
        ) {
          setRecipeState((prev) => ({
            ...prev,
            rating: commentRes.newRating!,
            ratingCount: commentRes.newCount!,
          }));
        }
        setCommentText('');
        toast.success(
          language === 'en'
            ? 'Review and rating submitted! Thank you.'
            : 'Ulasan dan penilaian berhasil dikirim!'
        );
      } else {
        toast.error(
          commentRes.error ||
            (language === 'en' ? 'Failed to submit review' : 'Gagal mengirim ulasan')
        );
      }
    } catch {
      toast.error(
        language === 'en' ? 'Failed to submit review' : 'Gagal mengirim ulasan'
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleHelpful = async (commentId: string, currentHelpful: number = 0) => {
    playClickSound();
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, helpfulCount: (c.helpfulCount || 0) + 1 } : c
      )
    );
    try {
      await incrementCommentHelpfulAction(commentId, currentHelpful, recipe.id);
    } catch {}
  };

  const handleShare = () => {
    playClickSound();
    if (navigator.share) {
      navigator
        .share({
          title: recipe.title,
          text: recipe.description,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info(
        language === 'en'
          ? 'Recipe link copied to clipboard!'
          : 'Tautan resep disalin ke clipboard!'
      );
    }
  };

  const editUrl = `/resep/${recipe.slug || recipe.id}/edit`;
  const questProgress =
    recipe.instructions.length > 0
      ? Math.round((completedSteps.size / recipe.instructions.length) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-28 md:pb-16 space-y-6 sm:space-y-8">
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/eksplorasi"
          onClick={() => playClickSound()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C3A21] dark:text-[#D9C8AA] hover:text-[#C85A32] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> {t('Kembali ke Katalog')}
        </Link>

        <div className="flex items-center gap-2">
          {/* Edit Recipe Button for Author */}
          {isOwner && (
            <Link
              href={editUrl}
              onClick={() => playClickSound()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#C85A32] font-bold text-xs border-2 border-[#5C3A21] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
              title={t('Edit Resep Ini')}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('Edit Resep')}</span>
            </Link>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] hover:text-[#C85A32] border-2 border-[#5C3A21]/40 shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
            title={t('Bagikan Resep')}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] hover:text-[#C85A32] border-2 border-[#5C3A21]/40 shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5 hidden sm:block"
            title={t('Cetak Resep')}
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`p-2 rounded-xl transition-all border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5 ${
              isSaved
                ? 'bg-[#C85A32] text-white'
                : 'bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA]'
            }`}
            title={t('Simpan Resep')}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Title & Quest Header Card */}
      <div className="p-4 sm:p-7 rounded-2xl bg-[#FCF9F2] dark:bg-[#241912] border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[6px_6px_0px_#2C1E16] space-y-3.5 sm:space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#C85A32] text-white font-black uppercase text-xs tracking-wider border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]">
            {language === 'en'
              ? `Seal of ${recipe.region || 'Nusantara'}`
              : `Segel ${recipe.region || 'Nusantara'}`}
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] font-bold text-xs border border-[#5C3A21]/30">
            {recipe.category}
          </span>
          {recipe.spicy && (
            <span className="px-3 py-1 rounded-lg bg-[#B83B2B] text-white font-bold text-xs flex items-center gap-1 border border-[#2C1E16]">
              <Flame className="w-3.5 h-3.5 fill-white" /> {t('Pedas')}
            </span>
          )}
          {recipe.authorName && (
            <span className="px-3 py-1 rounded-lg bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] text-xs">
              {t('Oleh:')} <strong>{recipe.authorName}</strong>
            </span>
          )}
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#2C1E16] dark:text-[#F6EFE2] tracking-tight leading-tight">
          {recipe.title}
        </h1>

        <p className="text-sm sm:text-base text-[#5C3A21] dark:text-[#D9C8AA] max-w-3xl leading-relaxed">
          {recipe.description}
        </p>

        {/* Quick Recipe Info Bar */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-6 pt-3 text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] border-t-2 border-[#5C3A21]/20 dark:border-[#8C6239]/30">
          <div className="flex items-center gap-1.5 font-bold">
            <Clock className="w-4 h-4 text-[#C85A32] shrink-0" />
            <span>
              {t('Persiapan:')} <strong>{recipe.prepTime || '15 Mnt'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <Flame className="w-4 h-4 text-[#C85A32] shrink-0" />
            <span>
              {t('Memasak:')} <strong>{recipe.cookTime || '30 Mnt'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <Users className="w-4 h-4 text-[#4A7C59] shrink-0" />
            <span>
              {t('Porsi:')} <strong>{recipe.servings || '4 Porsi'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-bold text-[#4A7C59]">
            <Zap className="w-4 h-4 shrink-0" />
            <span>+{recipe.calories ? parseInt(recipe.calories) || 350 : 350} Stamina</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <Star
              className={`w-4 h-4 shrink-0 ${
                hasReviews ? 'fill-[#D99B26] text-[#D99B26]' : 'text-[#8C6239]'
              }`}
            />
            {hasReviews ? (
              <span className="font-bold text-[#D99B26]">
                {recipeState.rating.toFixed(1)}{' '}
                <span className="text-xs text-[#8C6239] font-normal">
                  ({recipeState.ratingCount} {t('ulasan')})
                </span>
              </span>
            ) : (
              <span className="text-xs text-[#8C6239] font-medium">
                {language === 'en' ? 'Unrated' : 'Belum diulas'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Featured Recipe Hero Image Banner with RPG Action Bar */}
      <div className="relative min-h-[260px] sm:min-h-0 aspect-4/3 sm:aspect-video lg:aspect-21/9 max-h-[440px] sm:max-h-none rounded-2xl overflow-hidden border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[6px_6px_0px_#2C1E16] bg-[#1C1410]">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

        {/* CTA Bar inside hero image */}
        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-white">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
              {language === 'en' ? 'Kitchen Guides' : 'Panduan Memasak Terpandu'}
            </span>
            <p className="text-xs sm:text-sm font-semibold drop-shadow line-clamp-2 sm:line-clamp-none">
              {language === 'en'
                ? 'Enter Hearth Mode for voice-assisted steps, or open Spice Almanac for instant substitutes.'
                : 'Masuk Mode Perapian dengan suara otomatis, atau buka Kitab Rempah untuk cek substitusi bumbu.'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                playClickSound();
                setIsZenModeOpen(true);
              }}
              className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A64422] text-white font-bold text-xs sm:text-sm border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] flex items-center gap-2 transition-transform active:translate-y-0.5 shrink-0"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>{language === 'en' ? 'Enter Hearth Mode' : 'Mode Perapian Dapur'}</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setSelectedSpiceId(null);
                setAlmanacInitialQuery('');
                setIsAlmanacOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-[#4A7C59] hover:bg-[#365C41] text-white font-bold text-xs border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] flex items-center gap-1.5 transition-transform active:translate-y-0.5 shrink-0"
              title={language === 'en' ? 'Open Spice Almanac' : 'Buka Kitab Rempah Nusantara'}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'en' ? 'Spice Almanac' : 'Kitab Rempah'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Split-Screen Layout: Left Column Ingredients + Right Column Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Kolom Kiri: Kotak Inventori Bahan & Scaler (Sticky on desktop) */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-4 sm:p-6 border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16]">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xl text-[#2C1E16] dark:text-[#F6EFE2] flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#C85A32]" />
                <span>{language === 'en' ? 'Ingredients Crafting Grid' : 'Kotak Inventori Bahan'}</span>
              </h3>
              <span className="text-xs font-mono font-black text-[#C85A32] bg-[#C85A32]/10 px-2.5 py-1 rounded-md border border-[#C85A32]/30">
                {preparedIngredients.size}/{recipe.ingredients.length} {language === 'en' ? 'Ready' : 'Siap'}
              </span>
            </div>
            <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA] mt-1">
              {language === 'en'
                ? 'Click items to mark them ready on your kitchen table, or inspect spice substitutes.'
                : 'Klik bahan untuk menandai sudah siap di meja, atau cek kitab substitusi rempah.'}
            </p>
          </div>

          {/* Portion Scaler */}
          <PortionScaler
            multiplier={multiplier}
            onMultiplierChange={setMultiplier}
            baseServings={recipe.servings}
          />

          {/* Interactive RPG Crafting Slots */}
          <div className="space-y-2.5 pt-1 max-h-[31.25rem] overflow-y-auto pr-1">
            {recipe.ingredients.map((ing, idx) => {
              const scaledDetail = scaleQuantity(ing.detail, multiplier);
              const isPrepared = preparedIngredients.has(idx);
              const matchedSpice = findSpiceByIngredientName(ing.name);

              return (
                <div
                  key={idx}
                  onClick={() => handleToggleIngredientPrepared(idx)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isPrepared
                      ? 'bg-[#4A7C59]/15 border-[#4A7C59] shadow-[2px_2px_0px_#2C1E16]'
                      : 'bg-[#EFE4CE] dark:bg-[#1C1410] border-[#5C3A21]/40 hover:border-[#5C3A21]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isPrepared
                          ? 'bg-[#4A7C59] border-[#2C1E16] text-white'
                          : 'bg-white dark:bg-[#2C1E16] border-[#5C3A21]/50 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-bold text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] ${
                            isPrepared ? 'line-through opacity-70' : ''
                          }`}
                        >
                          {ing.name}
                        </span>

                        {matchedSpice && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAlmanacForIngredient(ing.name, matchedSpice.id);
                            }}
                            className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#D99B26]/20 hover:bg-[#D99B26] text-[#9E6E12] hover:text-white dark:text-[#E9B858] border border-[#D99B26]/40 transition-colors flex items-center gap-1"
                            title={language === 'en' ? 'Inspect Spice Substitute' : 'Cek Pengganti Rempah'}
                          >
                            <Search className="w-2.5 h-2.5" />
                            <span>{language === 'en' ? 'Substitute' : 'Pengganti'}</span>
                          </button>
                        )}
                      </div>

                      {ing.role && (
                        <span className="text-[10px] text-[#8C6239] dark:text-[#D1A67B] italic block leading-snug">
                          {ing.role}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-black text-[#C85A32] text-xs bg-[#FCF9F2] dark:bg-[#2C1E16] px-2 py-0.5 rounded border border-[#5C3A21]/30">
                      {scaledDetail}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSingleIngredient(ing.name, ing.detail);
                      }}
                      className="p-1 text-[#8C6239] hover:text-[#C85A32] transition-colors"
                      title={language === 'en' ? 'Add to shopping basket' : 'Tambah ke bakul belanja'}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add All to Shopping Basket Button */}
          <button
            onClick={handleAddAllIngredientsToShopping}
            className="w-full py-3 px-4 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] hover:bg-[#E2D1B0] text-[#2C1E16] dark:text-[#F6EFE2] font-black text-xs border-2 border-[#5C3A21] shadow-[3px_3px_0px_#2C1E16] flex items-center justify-center gap-2 transition-transform active:translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4 text-[#C85A32]" /> {t('Masukkan Semua ke Daftar Belanja')}
          </button>
        </aside>

        {/* Kolom Kanan: Instructions Quest, Video, Variations, Reviews */}
        <div className="lg:col-span-7 space-y-8 sm:space-y-10">
          {/* Instructions Quest List */}
          <section className="space-y-5 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-4 sm:p-6 border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16]">
            <div className="flex items-center justify-between border-b-2 border-[#5C3A21]/20 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-display font-black text-2xl text-[#2C1E16] dark:text-[#F6EFE2]">
                  {language === 'en' ? 'Cooking Quest Steps' : 'Tahapan Quest Memasak'}
                </h3>
                <span className="text-xs text-[#5C3A21] dark:text-[#D9C8AA]">
                  {recipe.instructions.length} {language === 'en' ? 'Sequential Stages' : 'Tahapan Memasak'}
                </span>
              </div>

              {/* Quest Completion Progress */}
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs text-[#C85A32]">
                  {questProgress}% {language === 'en' ? 'Done' : 'Selesai'}
                </span>
                <div className="w-24 h-2.5 rounded-full bg-[#EFE4CE] dark:bg-[#1C1410] border border-[#5C3A21]/40 overflow-hidden">
                  <div
                    className="h-full bg-[#4A7C59] transition-all duration-300"
                    style={{ width: `${questProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <ol className="space-y-3.5">
              {recipe.instructions.map((step, idx) => {
                const timeMatch = step.text.match(/(\d+)\s*(menit|mins|min|jam)/i);
                const stepMinutes = timeMatch ? parseInt(timeMatch[1]) : null;
                const isStepDone = completedSteps.has(idx);

                return (
                  <li
                    key={idx}
                    className={`p-4 rounded-xl border-2 transition-all space-y-2.5 ${
                      isStepDone
                        ? 'bg-[#4A7C59]/10 border-[#4A7C59]/60'
                        : 'bg-[#EFE4CE] dark:bg-[#1C1410] border-[#5C3A21]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Diamond number badge */}
                        <div className="w-7 h-7 bg-[#C85A32] text-white flex items-center justify-center font-black text-xs rotate-45 border border-[#2C1E16] shadow-[1px_1px_0px_#2C1E16] shrink-0">
                          <span className="-rotate-45">{idx + 1}</span>
                        </div>
                        {step.title && (
                          <h4 className="font-display font-bold text-base text-[#2C1E16] dark:text-[#F6EFE2]">
                            {step.title}
                          </h4>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {stepMinutes && (
                          <button
                            onClick={() => {
                              playClickSound();
                              startTimer(
                                stepMinutes,
                                `${recipe.title} (${language === 'en' ? 'Step' : 'Tahap'} ${idx + 1})`
                              );
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#FCF9F2] dark:bg-[#2C1E16] text-[#C85A32] text-xs font-bold border border-[#5C3A21]/40 hover:bg-[#C85A32] hover:text-white flex items-center gap-1 transition-colors"
                            title={language === 'en' ? 'Start timer for this step' : 'Nyalakan timer untuk langkah ini'}
                          >
                            <Bell className="w-3 h-3" /> {stepMinutes} {language === 'en' ? 'Min' : 'Mnt'}
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleStepCompleted(idx)}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isStepDone
                              ? 'bg-[#4A7C59] border-[#2C1E16] text-white'
                              : 'bg-[#FCF9F2] dark:bg-[#2C1E16] border-[#5C3A21]/50 text-transparent'
                          }`}
                          title={language === 'en' ? 'Mark step completed' : 'Tandai tahap selesai'}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-[#5C3A21] dark:text-[#D9C8AA]">
                      {step.text}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* YouTube Video Embed if present */}
          {recipe.youtubeUrl && (() => {
            const embedInfo = getYouTubeEmbedInfo(recipe.youtubeUrl);
            return (
              <section className="space-y-3 p-4 sm:p-6 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display font-bold text-lg sm:text-xl text-[#2C1E16] dark:text-[#F6EFE2] flex items-center gap-2">
                    <Play className="w-5 h-5 text-[#B83B2B]" /> {t('Video Tutorial Memasak')}
                  </h3>
                  {embedInfo && (
                    <a
                      href={embedInfo.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#C85A32] hover:underline flex items-center gap-1"
                    >
                      <span>{language === 'en' ? 'Open in YouTube' : 'Buka di YouTube'}</span>
                      <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                    </a>
                  )}
                </div>
                <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-[#5C3A21] bg-black">
                  {embedInfo ? (
                    <iframe
                      src={embedInfo.embedUrl}
                      title={`Video Tutorial ${recipe.title}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white/80 space-y-2">
                      <Play className="w-10 h-10 text-[#C85A32]" />
                      <p className="text-xs">{recipe.youtubeUrl}</p>
                      <a
                        href={recipe.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-1.5 rounded-lg bg-[#C85A32] text-white text-xs font-bold"
                      >
                        {language === 'en' ? 'Watch on YouTube' : 'Tonton di YouTube'}
                      </a>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* Variations & Secret Kitchen Tips */}
          {recipe.variations && recipe.variations.length > 0 && (
            <section className="space-y-4 p-4 sm:p-6 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16]">
              <h3 className="font-display font-bold text-lg sm:text-xl text-[#2C1E16] dark:text-[#F6EFE2]">
                {language === 'en' ? 'Secret Variations & Guild Tips' : 'Variasi & Petuah Dapur'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recipe.variations.map((v, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#EFE4CE] dark:bg-[#1C1410] border-2 border-[#D99B26] shadow-[2px_2px_0px_#2C1E16] space-y-1.5"
                  >
                    <h5 className="font-bold text-xs text-[#2C1E16] dark:text-[#F6EFE2]">
                      {v.title}
                    </h5>
                    <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA] leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Community Rating & Comments */}
          <section className="space-y-6 pt-4 border-t-2 border-[#5C3A21]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-[#2C1E16] dark:text-[#F6EFE2]">
                  {t('Ulasan & Komentar Komunitas')}
                </h3>
                <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA]">
                  {hasReviews
                    ? language === 'en'
                      ? `Average ${recipeState.rating.toFixed(1)} from ${recipeState.ratingCount} reviews`
                      : `Rata-rata ${recipeState.rating.toFixed(1)} dari ${recipeState.ratingCount} ulasan`
                    : language === 'en'
                    ? 'No reviews yet for this recipe. Be the first to leave a rating!'
                    : 'Belum ada ulasan untuk resep ini. Jadilah yang pertama memberikan penilaian!'}
                </p>
              </div>

              {/* Header Rating Badge */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-xs font-black text-[#2C1E16] dark:text-[#F6EFE2] border-2 border-[#5C3A21] shadow-[2px_2px_0px_#2C1E16] self-start sm:self-auto">
                <Star
                  className={`w-4 h-4 ${
                    hasReviews ? 'fill-[#D99B26] text-[#D99B26]' : 'text-[#8C6239]'
                  }`}
                />
                <span>
                  {hasReviews
                    ? `${recipeState.rating.toFixed(1)} / 5.0`
                    : language === 'en'
                    ? '0 / 5.0 (New)'
                    : '0 / 5.0 (Baru)'}
                </span>
              </div>
            </div>

            {/* Review & Rating Form */}
            <form
              onSubmit={handleCommentSubmit}
              className="space-y-4 bg-[#FCF9F2] dark:bg-[#241912] p-4 sm:p-5 rounded-2xl border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16]"
            >
              <h4 className="font-bold text-sm text-[#2C1E16] dark:text-[#F6EFE2]">
                {t('Beri Nilai Resep Ini')}
              </h4>

              {/* Interactive Star Picker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-[#EFE4CE] dark:bg-[#1C1410] rounded-xl border border-[#5C3A21]/40">
                <div className="text-xs">
                  <span className="font-bold text-[#2C1E16] dark:text-[#F6EFE2] block">
                    {language === 'en' ? 'Rate this recipe:' : 'Nilai resep ini:'}
                  </span>
                  <span className="text-[11px] text-[#5C3A21] dark:text-[#D9C8AA]">
                    {(hoverRating || selectedRating) === 5 &&
                      (language === 'en' ? '⭐⭐⭐⭐⭐ 5/5 — Perfect & Authentic' : '⭐⭐⭐⭐⭐ 5/5 — Sempurna & Istimewa')}
                    {(hoverRating || selectedRating) === 4 &&
                      (language === 'en' ? '⭐⭐⭐⭐ 4/5 — Very Delicious' : '⭐⭐⭐⭐ 4/5 — Sangat Enak')}
                    {(hoverRating || selectedRating) === 3 &&
                      (language === 'en' ? '⭐⭐⭐ 3/5 — Pretty Good' : '⭐⭐⭐ 3/5 — Cukup Lezat')}
                    {(hoverRating || selectedRating) === 2 &&
                      (language === 'en' ? '⭐⭐ 2/5 — Needs Improvement' : '⭐⭐ 2/5 — Kurang Pas')}
                    {(hoverRating || selectedRating) === 1 &&
                      (language === 'en' ? '⭐ 1/5 — Not Recommended' : '⭐ 1/5 — Perlu Disesuaikan')}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setSelectedRating(star);
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      title={`${language === 'en' ? 'Rate' : 'Beri Bintang'} ${star}`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || selectedRating)
                            ? 'fill-[#D99B26] text-[#D99B26]'
                            : 'text-[#8C6239]/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Text input */}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Share your experience cooking this recipe, ingredient tweaks, or taste notes...'
                    : 'Bagikan pengalamanmu memasak resep ini, tips modifikasi bahan, atau kesan rasa...'
                }
                rows={3}
                maxLength={500}
                className="w-full p-4 rounded-xl bg-white dark:bg-[#1C1410] border-2 border-[#5C3A21]/40 text-sm text-[#2C1E16] dark:text-[#F6EFE2] placeholder-[#8C6239]/60 focus:outline-none focus:border-[#C85A32]"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8C6239]">{commentText.length}/500</span>
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="px-5 py-2.5 rounded-xl bg-[#C85A32] text-white font-bold text-xs hover:bg-[#A64422] disabled:opacity-40 flex items-center gap-2 border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
                >
                  <Send className="w-3.5 h-3.5" /> {t('Kirim Ulasan')}
                </button>
              </div>
            </form>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-3.5">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FCF9F2] dark:bg-[#241912] border-2 border-[#5C3A21]/40 space-y-2.5 shadow-[3px_3px_0px_#2C1E16]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#C85A32] text-white font-black text-xs flex items-center justify-center border border-[#2C1E16] shrink-0">
                          {comment.initial || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2]">
                              {comment.name}
                            </span>
                            {comment.rating && comment.rating > 0 && (
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= comment.rating!
                                        ? 'fill-[#D99B26] text-[#D99B26]'
                                        : 'text-[#8C6239]/30'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-[#8C6239] block">{comment.time}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleHelpful(comment.id, comment.helpfulCount)}
                        className="flex items-center gap-1 text-xs text-[#5C3A21] dark:text-[#D9C8AA] hover:text-[#C85A32] transition-colors px-2 py-1 rounded-lg hover:bg-[#EFE4CE]"
                        title={language === 'en' ? 'Helpful' : 'Bermanfaat'}
                      >
                        <Heart className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span className="font-mono font-bold">{comment.helpfulCount || 0}</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] leading-relaxed pl-0 sm:pl-12">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-6 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-2 border-dashed border-[#5C3A21]/40 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#EFE4CE] dark:bg-[#1C1410] text-[#D99B26] flex items-center justify-center mx-auto border border-[#5C3A21]/30">
                  <Star className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-base text-[#2C1E16] dark:text-[#F6EFE2]">
                  {language === 'en' ? 'No reviews yet for this recipe' : 'Belum ada ulasan untuk resep ini'}
                </h4>
                <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA] max-w-sm mx-auto leading-relaxed">
                  {language === 'en'
                    ? 'Be the first adventurer to try this recipe and share your taste review!'
                    : 'Jadilah petualang pertama yang mencoba resep ini dan bagikan ulasan serta bintang penilaian Anda di atas!'}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mode Perapian (Zen Cook) Modal */}
      {isZenModeOpen && (
        <HandsFreeCookModal recipe={recipe} onClose={() => setIsZenModeOpen(false)} />
      )}

      {/* Kitab Rempah & Substitusi Drawer Modal */}
      <SpiceAlmanacDrawer
        isOpen={isAlmanacOpen}
        onClose={() => setIsAlmanacOpen(false)}
        selectedSpiceId={selectedSpiceId}
        initialQuery={almanacInitialQuery}
      />
    </div>
  );
}
