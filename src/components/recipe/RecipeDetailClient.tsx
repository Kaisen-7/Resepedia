'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Flame,
  Users,
  Star,
  Bookmark,
  Share2,
  Printer,
  Sparkles,
  ShoppingBag,
  ChefHat,
  ChevronLeft,
  Play,
  MessageSquare,
  Send,
  Trash2,
  Check,
  Bell,
  Heart,
  Volume2,
} from 'lucide-react';
import { Recipe, Comment } from '@/types';
import PortionScaler from './PortionScaler';
import HandsFreeCookModal from './HandsFreeCookModal';
import { scaleQuantity } from '@/lib/utils/fraction-scaler';
import { toggleSaveRecipeAction } from '@/actions/bookmark.actions';
import { addShoppingItemAction } from '@/actions/shopping.actions';
import { createCommentAction, incrementCommentHelpfulAction } from '@/actions/comment.actions';
import { updateRatingAction } from '@/actions/recipe.actions';
import { useCookingTimer } from '@/contexts/TimerContext';
import { useAI } from '@/contexts/AIContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

interface RecipeDetailClientProps {
  recipe: Recipe;
  initialComments: Comment[];
  isSavedInitial: boolean;
}

export default function RecipeDetailClient({
  recipe,
  initialComments,
  isSavedInitial,
}: RecipeDetailClientProps) {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { startTimer } = useCookingTimer();
  const { openAI } = useAI();

  const [multiplier, setMultiplier] = useState(1);
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [isSaving, setIsSaving] = useState(false);
  const [isZenModeOpen, setIsZenModeOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedRating, setSelectedRating] = useState(recipe.rating || 5);
  const [hasRated, setHasRated] = useState(false);

  // Bookmark toggle
  const handleToggleSave = async () => {
    if (isSaving) return;
    if (!user) {
      toast.error('Silakan masuk untuk menyimpan resep favorit');
      return;
    }

    setIsSaving(true);
    const prev = isSaved;
    setIsSaved(!prev);

    const res = await toggleSaveRecipeAction(recipe.id, prev, user.uid);
    if (res.success) {
      setIsSaved(res.isSaved);
      toast.success(res.isSaved ? 'Resep disimpan ke koleksi!' : 'Resep dihapus dari koleksi');
    } else {
      setIsSaved(prev);
      toast.error(res.error || 'Gagal menyimpan resep');
    }
    setIsSaving(false);
  };

  // Add all ingredients or single ingredient to shopping list
  const handleAddAllIngredientsToShopping = async () => {
    let count = 0;
    for (const ing of recipe.ingredients) {
      const scaledDetail = scaleQuantity(ing.detail, multiplier);
      await addShoppingItemAction(ing.name, scaledDetail, recipe.title, user?.uid);
      count++;
    }
    toast.success(`${count} bahan berhasil ditambahkan ke Daftar Belanja!`);
  };

  const handleAddSingleIngredient = async (name: string, detail: string) => {
    const scaledDetail = scaleQuantity(detail, multiplier);
    const res = await addShoppingItemAction(name, scaledDetail, recipe.title, user?.uid);
    if (res.success) {
      toast.success(`${name} masuk ke Daftar Belanja`);
    } else {
      toast.error(res.error || 'Gagal menambahkan bahan');
    }
  };

  // Submit comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    if (!user) {
      toast.error('Silakan masuk (login) untuk menulis ulasan');
      return;
    }

    setIsSubmittingComment(true);
    const res = await createCommentAction(recipe.id, commentText.trim(), {
      id: user.uid,
      name: user.displayName || 'Chef Resepedia',
      avatarUrl: user.photoURL,
    });
    if (res.success && res.comment) {
      setComments((prev) => [res.comment!, ...prev]);
      setCommentText('');
      toast.success('Ulasan Anda berhasil dikirim!');
    } else {
      toast.error(res.error || 'Gagal mengirim ulasan');
    }
    setIsSubmittingComment(false);
  };

  // Helpful vote
  const handleHelpful = async (commentId: string, currentHelpful: number) => {
    const res = await incrementCommentHelpfulAction(commentId, currentHelpful, recipe.id);
    if (res.success && res.count !== undefined) {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, helpfulCount: res.count! } : c))
      );
    }
  };

  // Rate recipe
  const handleRate = async (star: number) => {
    if (hasRated) return;
    setSelectedRating(star);
    setHasRated(true);
    const res = await updateRatingAction(
      recipe.id,
      star,
      recipe.rating || 0,
      recipe.ratingCount || 0
    );
    if (res.success) {
      toast.success(`Terima kasih atas rating bintang ${star}!`);
    }
  };

  // Web Share or Copy Link
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${recipe.title} — Resepedia`,
          text: recipe.description,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Tautan resep disalin ke clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/eksplorasi"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Katalog
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-surface-container-low dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors"
            title="Bagikan Resep"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-full bg-surface-container-low dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors hidden sm:block"
            title="Cetak Resep"
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
            title="Simpan Resep"
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
              <Flame className="w-3.5 h-3.5 fill-red-500" /> Bercita Rasa Pedas
            </span>
          )}
        </div>

        <h1 className="font-display font-black text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          {recipe.title}
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          {recipe.description}
        </p>

        {/* Quick Recipe Info Bar */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            <span>Persiapan: <strong>{recipe.prepTime || '15 Mnt'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-primary" />
            <span>Memasak: <strong>{recipe.cookTime || '30 Mnt'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span>Porsi: <strong>{recipe.servings || '4 Porsi'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{recipe.rating || '4.8'}</span>
            <span className="text-xs text-zinc-400 font-normal">({recipe.ratingCount || 12} ulasan)</span>
          </div>
        </div>
      </div>

      {/* Featured Recipe Hero Image / Video */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* CTA Banner inside image */}
        <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-white">
            <span className="text-xs font-black uppercase tracking-wider text-primary-fixed block mb-1">
              Siap Memasak?
            </span>
            <p className="text-sm sm:text-base font-bold drop-shadow">
              Nyalakan panduan audio per langkah agar tangan tetap leluasa di dapur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZenModeOpen(true)}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-xs sm:text-sm shadow-xl shadow-primary/30 flex items-center gap-2 transition-transform active:scale-95 shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              <span>Mulai Mode Bebas Genggam</span>
            </button>
            <button
              onClick={() => openAI(recipe)}
              className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
              title="Tanya Chef AI seputar resep ini"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Split-Screen Layout (Desktop): Sticky Left 35% + Scrollable Right 65% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Kolom Kiri: Sticky Ingredients & Portion Scaler */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div>
            <h3 className="font-display font-black text-xl text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span>Bahan-Bahan</span>
              <span className="text-xs font-mono font-bold text-primary">
                {recipe.ingredients.length} Macam
              </span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Takaran menyesuaikan otomatis sesuai porsi yang Anda pilih.
            </p>
          </div>

          {/* Portion Scaler Controller */}
          <PortionScaler
            multiplier={multiplier}
            onMultiplierChange={setMultiplier}
            baseServings={recipe.servings}
          />

          {/* Ingredients Checklist */}
          <ul className="space-y-3 pt-2">
            {recipe.ingredients.map((ing, idx) => {
              const scaledDetail = scaleQuantity(ing.detail, multiplier);
              return (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-3 text-sm pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80 group"
                >
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-primary"
                      title="Tambah ke daftar belanja"
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
            <ShoppingBag className="w-4 h-4" /> Masukkan Semua ke Daftar Belanja
          </button>
        </aside>

        {/* Kolom Kanan: Scrollable Instructions, Nutrition, Variations, Comments */}
        <div className="lg:col-span-7 space-y-10">
          {/* Instructions List */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
              <h3 className="font-display font-black text-2xl text-zinc-900 dark:text-zinc-100">
                Cara Memasak
              </h3>
              <span className="text-xs text-zinc-500">
                {recipe.instructions.length} Langkah
              </span>
            </div>

            <ol className="space-y-6">
              {recipe.instructions.map((step, idx) => {
                // Inline step timer detection
                const timeMatch = step.text.match(/(\d+)\s*(menit|mins|min|jam)/i);
                const stepMinutes = timeMatch ? parseInt(timeMatch[1]) : null;

                return (
                  <li
                    key={idx}
                    className="p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-black flex items-center justify-center shadow-sm">
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
                            startTimer(stepMinutes, `${recipe.title} (Langkah ${idx + 1})`)
                          }
                          className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white flex items-center gap-1 transition-colors"
                          title="Nyalakan timer untuk langkah ini"
                        >
                          <Bell className="w-3 h-3" /> {stepMinutes} Menit
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
                <Play className="w-5 h-5 text-red-500" /> Video Tutorial Memasak
              </h3>
              <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800">
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
                💡 Variasi & Tips Chef
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recipe.variations.map((v, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 space-y-1.5"
                  >
                    <h5 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                      {v.title}
                    </h5>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Community Rating & Comments */}
          <section className="space-y-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-2xl text-zinc-900 dark:text-zinc-100">
                  Ulasan & Rating Komunitas
                </h3>
                <p className="text-xs text-zinc-500">Bagikan hasil masakan dan tips Anda di sini</p>
              </div>

              {/* Star Rating picker */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="p-1 hover:scale-125 transition-transform"
                    title={`Beri Bintang ${star}`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= selectedRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Bagikan pengalamanmu mencoba resep ini..."
                rows={3}
                maxLength={500}
                className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{commentText.length}/500</span>
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container disabled:opacity-40 flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Ulasan
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {comment.initial || 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                          {comment.name}
                        </span>
                        <span className="text-[10px] text-zinc-400">{comment.time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleHelpful(comment.id, comment.helpfulCount)}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-primary transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>{comment.helpfulCount || 0}</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-10">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
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
