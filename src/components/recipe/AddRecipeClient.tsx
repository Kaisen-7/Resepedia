'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChefHat,
  Clock,
  Flame,
  Plus,
  Trash2,
  Upload,
  ChevronLeft,
  Youtube,
} from 'lucide-react';
import { Recipe } from '@/types';
import { createRecipeAction } from '@/actions/recipe.actions';
import { saveMyLocalRecipe } from '@/lib/utils/recipe-storage';
import { extractYouTubeVideoId } from '@/lib/utils/youtube';
import { uploadRecipeImage } from '@/lib/firebase/service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { playClickSound } from '@/lib/utils/sound-effects';

export default function AddRecipeClient() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const toast = useToast();
  const { t, language } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('15 Mnt');
  const [cookTime, setCookTime] = useState('30 Mnt');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [category, setCategory] = useState<'Appetizer' | 'Main Course' | 'Dessert' | 'Drink'>('Main Course');
  const [region, setRegion] = useState('Jawa');
  const [servings, setServings] = useState('4 Porsi');
  const [calories, setCalories] = useState('350 kcal');
  const [spicy, setSpicy] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ingredients, setIngredients] = useState([
    { name: '', detail: '', role: '' },
    { name: '', detail: '', role: '' },
    { name: '', detail: '', role: '' },
  ]);

  const [instructions, setInstructions] = useState([
    { title: 'Persiapan Bahan', text: '' },
    { title: 'Menumis Bumbu', text: '' },
    { title: 'Memasak hingga Matang', text: '' },
  ]);

  const handleAddIngredient = () => {
    playClickSound();
    setIngredients((prev) => [...prev, { name: '', detail: '', role: '' }]);
  };

  const handleRemoveIngredient = (idx: number) => {
    playClickSound();
    if (ingredients.length > 1) {
      setIngredients((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleAddInstruction = () => {
    playClickSound();
    setInstructions((prev) => [
      ...prev,
      { title: `Langkah ${prev.length + 1}`, text: '' },
    ]);
  };

  const handleRemoveInstruction = (idx: number) => {
    playClickSound();
    if (instructions.length > 1) {
      setInstructions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadRecipeImage(file, user?.uid);
      if (publicUrl) {
        setImageUrl(publicUrl);
        toast.success('Foto resep berhasil diunggah!');
      } else {
        toast.error('Gagal mengunggah foto. Gunakan link URL langsung.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat unggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Harap isi judul dan deskripsi resep');
      return;
    }

    const validIngredients = ingredients.filter((i) => i.name.trim().length > 0);
    if (validIngredients.length === 0) {
      toast.error('Harap isi minimal 1 bahan masakan');
      return;
    }

    const validInstructions = instructions.filter((i) => i.text.trim().length > 0);
    if (validInstructions.length === 0) {
      toast.error('Harap isi minimal 1 langkah instruksi memasak');
      return;
    }

    setIsSubmitting(true);
    const newRecipeData: any = {
      title: title.trim(),
      description: description.trim(),
      image:
        imageUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      prepTime,
      cookTime,
      difficulty,
      category,
      region,
      servings,
      calories,
      spicy,
      youtubeUrl: (() => { const id = extractYouTubeVideoId(youtubeUrl); return id ? ('https://www.youtube-nocookie.com/embed/' + id) : (youtubeUrl.trim() || undefined); })(),
      ingredients: validIngredients,
      instructions: validInstructions,
      authorName: user?.displayName || 'Chef Resepedia',
    };

    const res = await createRecipeAction(newRecipeData, user?.uid);
    if (res.success && res.recipe) {
      saveMyLocalRecipe(res.recipe, user?.uid);
      toast.success('Resep berhasil dipublikasikan!');
      router.push(`/resep/${res.recipe.slug || res.recipe.id}`);
    } else {
      toast.error(res.error || 'Gagal membuat resep');
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-4">
        <div className="bg-[#FCF9F2] dark:bg-[#241912] p-8 sm:p-10 rounded-2xl border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[6px_6px_0px_#2C1E16] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center mx-auto border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16]">
            <ChefHat className="w-8 h-8" />
          </div>
          <h2 className="font-display font-black text-2xl text-[#2C1E16] dark:text-[#F6EFE2]">
            {language === 'en' ? 'Sign In to Publish Recipes' : 'Masuk untuk Menulis Resep'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-outline-variant leading-relaxed">
            {language === 'en'
              ? 'You need to sign in first to publish and manage your recipes on Resepedia.'
              : 'Anda perlu masuk terlebih dahulu untuk mempublikasikan resep masakan Anda di Resepedia.'}
          </p>
          <button
            onClick={() => {
              playClickSound();
              signInWithGoogle();
            }}
            className="px-6 py-3 rounded-xl bg-[#C85A32] text-white font-black text-xs hover:bg-[#A64422] border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] active:translate-y-0.5"
          >
            {t('Masuk dengan Google')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-28 md:pb-16 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/eksplorasi"
          onClick={() => playClickSound()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C3A21] dark:text-outline-variant hover:text-[#C85A32] transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" /> {t('Batal & Kembali')}
        </Link>
        <h1 className="font-display font-black text-2xl sm:text-4xl text-[#2C1E16] dark:text-[#F6EFE2]">
          {language === 'en' ? 'Write New Archipelago Recipe' : 'Tulis Resep Nusantara Baru'}
        </h1>
        <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-outline-variant mt-1">
          {language === 'en'
            ? 'Share your authentic heritage recipes with thousands of food lovers.'
            : 'Bagikan warisan rasa tradisional masakan Anda agar dapat dinikmati ribuan pecinta kuliner lainnya.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Informasi Utama */}
        <div className="bg-[#FCF9F2] dark:bg-[#241912] p-4 sm:p-7 rounded-2xl border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16] space-y-5">
          <h3 className="font-display font-black text-base sm:text-lg text-[#2C1E16] dark:text-[#F6EFE2] pb-2 border-b-2 border-[#5C3A21]/20">
            1. Informasi Resep
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5C3A21] dark:text-outline-variant">
              Judul Resep <span className="text-[#C85A32]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Rendang Daging Sapi Khas Minang Autentik"
              required
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] placeholder-[#8C6239]/60 focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5C3A21] dark:text-outline-variant">
              Deskripsi Singkat <span className="text-[#C85A32]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan keistimewaan rasa, aroma, atau sejarah singkat hidangan ini..."
              rows={3}
              required
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] placeholder-[#8C6239]/60 focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          {/* Region, Category, Difficulty Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C3A21] dark:text-outline-variant">Wilayah Asal</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 text-xs sm:text-sm font-bold text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
              >
                <option value="Sumatra">Sumatra</option>
                <option value="Jawa">Jawa</option>
                <option value="Bali">Bali & NTB</option>
                <option value="Sulawesi">Sulawesi</option>
                <option value="Kalimantan">Kalimantan</option>
                <option value="Papua">Papua & Maluku</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C3A21] dark:text-outline-variant">Kategori Hidangan</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 text-xs sm:text-sm font-bold text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
              >
                <option value="Main Course">Hidangan Utama (Main Course)</option>
                <option value="Appetizer">Hidangan Pembuka / Camilan</option>
                <option value="Dessert">Hidangan Penutup (Dessert)</option>
                <option value="Drink">Minuman Tradisional</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C3A21] dark:text-outline-variant">Tingkat Kesulitan</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 text-xs sm:text-sm font-bold text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
              >
                <option value="Easy">★ Rank C (Pemula / Easy)</option>
                <option value="Medium">★★ Rank B (Terampil / Medium)</option>
                <option value="Hard">★★★ Rank A (Mahakarya / Hard)</option>
              </select>
            </div>
          </div>

          {/* Time, Servings, Spicy row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C3A21] dark:text-outline-variant">Waktu Persiapan</label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15 Mnt"
                className="w-full px-3.5 py-2 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C3A21] dark:text-outline-variant">Waktu Memasak</label>
              <input
                type="text"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="45 Mnt"
                className="w-full px-3.5 py-2 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C3A21] dark:text-outline-variant">Porsi Saji</label>
              <input
                type="text"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4 Porsi"
                className="w-full px-3.5 py-2 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={spicy}
                  onChange={(e) => setSpicy(e.target.checked)}
                  className="rounded text-[#C85A32] focus:ring-[#C85A32]"
                />
                <span className="text-xs font-bold flex items-center gap-1 text-[#2C1E16] dark:text-[#F6EFE2]">
                  <Flame className="w-3.5 h-3.5 text-cabai-600" /> Pedas
                </span>
              </label>
            </div>
          </div>

          {/* Media: Image & YouTube */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C3A21] dark:text-outline-variant">
                Foto Resep (Upload atau URL Gambar)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
                />
                <label className="px-3.5 py-2 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] hover:bg-[#E2D1B0] text-[#5C3A21] dark:text-outline-variant cursor-pointer text-xs font-bold flex items-center gap-1 border-2 border-[#5C3A21]/40 shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? '...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              {imageUrl && (
                <div className="relative mt-2 aspect-video max-h-36 rounded-xl overflow-hidden border-2 border-[#5C3A21] bg-black">
                  <img
                    src={imageUrl}
                    alt="Preview Resep"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 px-2 py-1 text-[10px] font-bold bg-cabai-600 text-white rounded-lg"
                  >
                    Hapus Foto
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C3A21] dark:text-outline-variant">
                Tautan Video YouTube (Opsional)
              </label>
              <div className="relative">
                <Youtube className="w-4 h-4 text-cabai-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#EFE4CE]/50 dark:bg-wood-950 border-2 border-[#5C3A21]/40 text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Bahan Masakan */}
        <div className="bg-[#FCF9F2] dark:bg-[#241912] p-4 sm:p-7 rounded-2xl border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#5C3A21]/20">
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-[#2C1E16] dark:text-[#F6EFE2]">
                2. Komposisi Bahan
              </h3>
              <p className="text-xs text-[#5C3A21] dark:text-outline-variant">
                Tuliskan takaran yang jelas agar mudah disesuaikan porsinya
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="px-3 py-1.5 rounded-xl bg-[#4A7C59] text-white hover:bg-secondary-container text-xs font-bold flex items-center gap-1 border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Bahan
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div
                key={idx}
                className="bg-[#EFE4CE]/60 dark:bg-wood-950 p-3 sm:p-2 rounded-xl border-2 border-[#5C3A21]/30 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2"
              >
                <div className="flex items-center gap-2 sm:flex-1">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => {
                      const next = [...ingredients];
                      next[idx].name = e.target.value;
                      setIngredients(next);
                    }}
                    placeholder="Nama Bahan (misal: Daging Sapi)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#2C1E16] border border-[#5C3A21]/40 text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    disabled={ingredients.length <= 1}
                    className="sm:hidden p-2 text-[#8C6239] hover:text-cabai-600 disabled:opacity-30 rounded-lg shrink-0"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:contents">
                  <input
                    type="text"
                    value={ing.detail}
                    onChange={(e) => {
                      const next = [...ingredients];
                      next[idx].detail = e.target.value;
                      setIngredients(next);
                    }}
                    placeholder="Takaran (500 gr)"
                    className="w-full sm:w-36 px-3 py-2 rounded-xl bg-white dark:bg-[#2C1E16] border border-[#5C3A21]/40 text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32] font-mono"
                  />
                  <input
                    type="text"
                    value={ing.role}
                    onChange={(e) => {
                      const next = [...ingredients];
                      next[idx].role = e.target.value;
                      setIngredients(next);
                    }}
                    placeholder="Peran/Tips (opsional)"
                    className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#2C1E16] border border-[#5C3A21]/40 text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  disabled={ingredients.length <= 1}
                  className="hidden sm:block p-2 text-[#8C6239] hover:text-cabai-600 disabled:opacity-30 rounded-xl shrink-0"
                  title="Hapus baris"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Langkah Instruksi Memasak */}
        <div className="bg-[#FCF9F2] dark:bg-[#241912] p-4 sm:p-7 rounded-2xl border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#5C3A21]/20">
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-[#2C1E16] dark:text-[#F6EFE2]">
                3. Langkah Memasak (Instruksi)
              </h3>
              <p className="text-xs text-[#5C3A21] dark:text-outline-variant">
                Langkah ini akan dibacakan oleh suara pada mode perapian dapur
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddInstruction}
              className="px-3 py-1.5 rounded-xl bg-[#4A7C59] text-white hover:bg-secondary-container text-xs font-bold flex items-center gap-1 border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Langkah
            </button>
          </div>

          <div className="space-y-4">
            {instructions.map((inst, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[#EFE4CE]/60 dark:bg-wood-950 border-2 border-[#5C3A21]/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C85A32] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#C85A32] text-white text-[10px] flex items-center justify-center font-black">
                      {idx + 1}
                    </span>
                    Tahapan Resep
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    className="p-1 text-[#8C6239] hover:text-cabai-600 rounded-lg"
                    title="Hapus langkah"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={inst.title}
                  onChange={(e) => {
                    const next = [...instructions];
                    next[idx].title = e.target.value;
                    setInstructions(next);
                  }}
                  placeholder="Judul langkah (misal: Menumis Bumbu Halus)"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#2C1E16] border border-[#5C3A21]/40 text-xs font-bold text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
                />
                <textarea
                  value={inst.text}
                  onChange={(e) => {
                    const next = [...instructions];
                    next[idx].text = e.target.value;
                    setInstructions(next);
                  }}
                  placeholder="Jelaskan detail tindakan secara berurutan. Cantumkan menit bila memerlukan waktu tertentu (misal: tumis selama 5 menit)..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#2C1E16] border border-[#5C3A21]/40 text-xs text-[#2C1E16] dark:text-[#F6EFE2] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2">
          <Link
            href="/eksplorasi"
            onClick={() => playClickSound()}
            className="flex-1 sm:flex-initial text-center px-6 py-3 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-outline-variant font-bold text-xs hover:bg-[#E2D1B0] border-2 border-[#5C3A21]/40 shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => playClickSound()}
            className="flex-1 sm:flex-initial justify-center px-6 sm:px-8 py-3 rounded-xl bg-[#C85A32] hover:bg-[#A64422] text-white font-black text-xs sm:text-sm border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] disabled:opacity-50 transition-transform active:translate-y-0.5 flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Resep'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
