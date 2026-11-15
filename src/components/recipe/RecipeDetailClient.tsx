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
  Sparkles,
  Edit3,
} from 'lucide-react';
import { Recipe, Comment } from '@/types';
import PortionScaler from './PortionScaler';
import HandsFreeCookModal from './HandsFreeCookModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useAI } from '@/contexts/AIContext';
import { useTimer } from '@/contexts/TimerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { addShoppingItem } from '@/lib/utils/shopping-storage';
import {
  createCommentAction,
  incrementCommentHelpfulAction,
} from '@/actions/comment.actions';
import { updateRatingAction } from '@/actions/recipe.actions';

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
  const { openAI } = useAI();
  const { startTimer } = useTimer();
  const { t, language } = useLanguage();

  const [multiplier, setMultiplier] = useState(1);
  const [isZenModeOpen, setIsZenModeOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(isRecipeSaved(recipe.id) || isSavedInitial);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleAddAllIngredientsToShopping = async () => {
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

    setIsSubmittingComment(true);
    const authorName = user?.displayName || (language === 'en' ? 'Culinary Explorer' : 'Penjelajah Rasa');
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
        if (commentRes.newRating !== undefined && commentRes.newCount !== undefined) {
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
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      }).catch(() => {});
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/eksplorasi"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> {t('Kembali ke Katalog')}
        </Link>

        <div className="flex items-center gap-2">
          {/* Edit Recipe Button for Author / Creator */}
          {isOwner && (
            <Link
              href={editUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary/10 dark:bg-primary/20 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all active:scale-95 border border-primary/20 shadow-sm"
              title={t('Edit Resep Ini')}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('Edit Resep')}</span>
            </Link>
          )}

          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-surface-container-low dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors"
            title={t('Bagikan Resep')}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-full bg-surface-container-low dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors hidden sm:block"
            title={t('Cetak Resep')}
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`p-2.5 rounded-full transition-all ${
              isSaved
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-surface-container-low dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-primary'
            }`}
            title={t('Simpan Resep')}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Title & Header Banner */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-black uppercase text-xs tracking-wider">
            {recipe.region || 'Nusantara'}
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs">
            {recipe.category}
          </span>
          {recipe.spicy && (
            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-red-500" /> {t('Pedas')}
            </span>
          )}
          {recipe.authorName && (
            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs">
              {t('Oleh:')} <strong>{recipe.authorName}</strong>
            </span>
          )}
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          {recipe.title}
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          {recipe.description}
        </p>

        {/* Quick Recipe Info Bar */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-8 pt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>
              {t('Persiapan:')} <strong>{recipe.prepTime || '15 Mnt'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-primary shrink-0" />
            <span>
              {t('Memasak:')} <strong>{recipe.cookTime || '30 Mnt'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <span>
              {t('Porsi:')} <strong>{recipe.servings || '4 Porsi'}</strong>
            </span>
          </div>

          {/* Authentic Rating / Review Status */}
          <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <Star
              className={`w-4 h-4 shrink-0 ${
                hasReviews ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'
              }`}
            />
            {hasReviews ? (
              <span className="font-bold text-amber-500">
                {recipeState.rating.toFixed(1)}{' '}
                <span className="text-xs text-zinc-400 font-normal">
                  ({recipeState.ratingCount} {t('ulasan')})
                </span>
              </span>
            ) : (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {language === 'en' ? 'No reviews yet (0 stars)' : 'Belum ada ulasan (0 bintang)'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Featured Recipe Hero Image Banner */}
      <div className="relative min-h-[280px] sm:min-h-0 aspect-4/3 sm:aspect-video lg:aspect-21/9 rounded-3xl overflow-hidden shadow-lg bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />

        {/* CTA Bar inside image */}
        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-white">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
              {language === 'en' ? 'Cooking Guide' : 'Panduan Memasak'}
            </span>
            <p className="text-xs sm:text-sm font-semibold drop-shadow line-clamp-2 sm:line-clamp-none">
              {language === 'en'
                ? 'Turn on voice-guided step-by-step instructions for easy hands-free cooking.'
                : 'Nyalakan panduan audio per langkah untuk kemudahan di dapur.'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsZenModeOpen(true)}
              className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95 shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t('Mulai Masak Bebas Genggam')}</span>
            </button>
            <button
              onClick={() => openAI(recipe)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              title={language === 'en' ? 'Consult this recipe with Kitchen Assistant' : 'Konsultasikan resep ini dengan asisten dapur'}
            >
              <ChefHat className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Tanya Dapur')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Split-Screen Layout: Left Column Ingredients + Right Column Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Kolom Kiri: Ingredients & Portion Scaler (Sticky on desktop) */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div>
            <h3 className="font-display font-black text-xl text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span>{t('Bahan-bahan Utama & Bumbu')}</span>
              <span className="text-xs font-mono font-bold text-primary">
                {recipe.ingredients.length} {language === 'en' ? 'Items' : 'Macam'}
              </span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {language === 'en'
                ? 'Amounts automatically adjust to your chosen servings.'
                : 'Takaran menyesuaikan otomatis sesuai porsi yang Anda pilih.'}
            </p>
          </div>

          {/* Portion Scaler */}
          <PortionScaler
            multiplier={multiplier}
            onMultiplierChange={setMultiplier}
            baseServings={recipe.servings}
          />

          {/* Ingredients Checklist */}
          <ul className="space-y-2.5 pt-2 max-h-120 overflow-y-auto pr-1">
            {recipe.ingredients.map((ing, idx) => {
              const scaledDetail = scaleQuantity(ing.detail, multiplier);
              return (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-3 text-sm pb-2 border-b border-zinc-100 dark:border-zinc-800/80 group"
                >
                  <div className="flex-1">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs sm:text-sm">
                      {ing.name}
                    </span>
                    {ing.role && (
                      <span className="text-[11px] text-zinc-500 italic block leading-snug">
                        {ing.role}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-primary text-xs bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-md">
                      {scaledDetail}
                    </span>
                    <button
                      onClick={() => handleAddSingleIngredient(ing.name, ing.detail)}
                      className="p-1 text-zinc-400 hover:text-primary transition-colors"
                      title={language === 'en' ? 'Add to shopping list' : 'Tambah ke daftar belanja'}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Add All to Shopping List Button */}
          <button
            onClick={handleAddAllIngredientsToShopping}
            className="w-full py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" /> {t('Masukkan Semua ke Daftar Belanja')}
          </button>
        </aside>

        {/* Kolom Kanan: Instructions, Video, Variations, Reviews */}
        <div className="lg:col-span-7 space-y-10">
          {/* Instructions List */}
          <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
              <h3 className="font-display font-black text-2xl text-zinc-900 dark:text-zinc-100">
                {t('Panduan Langkah Memasak')}
              </h3>
              <span className="text-xs text-zinc-500 font-semibold">
                {recipe.instructions.length} {language === 'en' ? 'Structured Steps' : 'Langkah Terstruktur'}
              </span>
            </div>

            <ol className="space-y-4">
              {recipe.instructions.map((step, idx) => {
                const timeMatch = step.text.match(/(\d+)\s*(menit|mins|min|jam)/i);
                const stepMinutes = timeMatch ? parseInt(timeMatch[1]) : null;

                return (
                  <li
                    key={idx}
                    className="p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-black flex items-center justify-center shadow-sm shrink-0">
                          {idx + 1}
                        </span>
                        {step.title && (
                          <h4 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
                            {step.title}
                          </h4>
                        )}
                      </div>

                      {stepMinutes && (
                        <button
                          onClick={() =>
                            startTimer(
                              stepMinutes,
                              `${recipe.title} (${language === 'en' ? 'Step' : 'Langkah'} ${idx + 1})`
                            )
                          }
                          className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white flex items-center gap-1 transition-colors shrink-0"
                          title={language === 'en' ? 'Start timer for this step' : 'Nyalakan timer untuk langkah ini'}
                        >
                          <Bell className="w-3 h-3" /> {stepMinutes} {language === 'en' ? 'Min' : 'Menit'}
                        </button>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {step.text}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* YouTube Video Embed if present */}
          {recipe.youtubeUrl && (
            <section className="space-y-3">
              <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Play className="w-5 h-5 text-red-500" /> {t('Video Tutorial Memasak')}
              </h3>
              <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
                <iframe
                  src={recipe.youtubeUrl}
                  title={`Video Tutorial ${recipe.title}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {/* Variations & Tips */}
          {recipe.variations && recipe.variations.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
                {language === 'en' ? 'Kitchen Tips & Variations' : 'Variasi & Tips Dapur'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recipe.variations.map((v, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 space-y-1.5"
                  >
                    <h5 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                      {v.title}
                    </h5>
                    <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Community Rating & Comments */}
          <section className="space-y-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-black text-2xl text-zinc-900 dark:text-zinc-100">
                  {t('Ulasan & Komentar Komunitas')}
                </h3>
                <p className="text-xs text-zinc-500">
                  {hasReviews
                    ? language === 'en'
                      ? `Average ${recipeState.rating.toFixed(1)} from ${recipeState.ratingCount} community reviews`
                      : `Rata-rata ${recipeState.rating.toFixed(1)} dari ${recipeState.ratingCount} ulasan pembaca`
                    : language === 'en'
                    ? 'No reviews yet for this recipe. Be the first to leave a rating!'
                    : 'Belum ada ulasan untuk resep ini. Jadilah yang pertama memberikan penilaian!'}
                </p>
              </div>

              {/* Header Rating Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 self-start sm:self-auto">
                <Star
                  className={`w-4 h-4 ${
                    hasReviews ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'
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
            <form onSubmit={handleCommentSubmit} className="space-y-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {t('Beri Nilai Resep Ini')}
              </h4>

              {/* Interactive Star Picker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                    {language === 'en' ? 'Rate this recipe:' : 'Nilai resep ini:'}
                  </span>
                  <span className="text-[11px] text-zinc-500">
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
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      title={`${language === 'en' ? 'Rate' : 'Beri Bintang'} ${star}`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || selectedRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300 dark:text-zinc-600'
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
                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{commentText.length}/500</span>
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container disabled:opacity-40 flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" /> {t('Kirim Ulasan')}
                </button>
              </div>
            </form>

            {/* Comments List / Empty State */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {comment.initial || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                              {comment.name}
                            </span>
                            {/* Star rating if reviewer provided one */}
                            {comment.rating && comment.rating > 0 && (
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= comment.rating!
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-zinc-200 dark:text-zinc-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400 block">{comment.time}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleHelpful(comment.id, comment.helpfulCount)}
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-primary transition-colors px-2 py-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title={language === 'en' ? 'Helpful' : 'Bermanfaat'}
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{comment.helpfulCount || 0}</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-0 sm:pl-12">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {language === 'en' ? 'No reviews yet for this recipe' : 'Belum ada ulasan untuk resep ini'}
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  {language === 'en'
                    ? 'Be the first to try this recipe and share your rating and comments above!'
                    : 'Jadilah yang pertama mencoba resep ini dan bagikan ulasan serta bintang penilaian Anda di atas!'}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Hands-Free Cook Mode Modal */}
      {isZenModeOpen && (
        <HandsFreeCookModal recipe={recipe} onClose={() => setIsZenModeOpen(false)} />
      )}
    </div>
  );
}
