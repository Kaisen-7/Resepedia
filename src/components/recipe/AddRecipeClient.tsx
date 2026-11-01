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

export default function AddRecipeClient() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const toast = useToast();

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
    setIngredients((prev) => [...prev, { name: '', detail: '', role: '' }]);
  };

  const handleRemoveIngredient = (idx: number) => {
    if (ingredients.length > 1) {
      setIngredients((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleAddInstruction = () => {
    setInstructions((prev) => [
      ...prev,
      { title: `Langkah ${prev.length + 1}`, text: '' },
    ]);
  };

  const handleRemoveInstruction = (idx: number) => {
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
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <ChefHat className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-zinc-900 dark:text-zinc-100">
          Masuk untuk Menulis Resep
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
          Anda perlu masuk terlebih dahulu untuk mempublikasikan resep masakan Anda di Resepedia.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="px-6 py-3 rounded-full bg-primary text-white font-bold text-xs hover:bg-primary-container shadow-md shadow-primary/20"
        >
          Masuk dengan Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/eksplorasi"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-primary transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" /> Batal & Kembali
        </Link>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Tulis Resep Nusantara Baru
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Bagikan warisan rasa tradisional masakan Anda agar dapat dinikmati ribuan pecinta kuliner lainnya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informasi Utama */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            1. Informasi Resep
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Judul Resep <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Rendang Daging Sapi Khas Minang Autentik"
              required
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Deskripsi Singkat <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan keistimewaan rasa, aroma, atau sejarah singkat hidangan ini..."
              rows={3}
              required
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Region, Category, Difficulty Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Wilayah Asal</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
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
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Kategori Hidangan</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Main Course">Hidangan Utama (Main Course)</option>
                <option value="Appetizer">Hidangan Pembuka / Camilan</option>
                <option value="Dessert">Hidangan Penutup (Dessert)</option>
                <option value="Drink">Minuman Tradisional</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Tingkat Kesulitan</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Easy">Mudah (Easy)</option>
                <option value="Medium">Sedang (Medium)</option>
                <option value="Hard">Mahir (Hard)</option>
              </select>
            </div>
          </div>

          {/* Time, Servings, Spicy row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Waktu Persiapan</label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15 Mnt"
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Waktu Memasak</label>
              <input
                type="text"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="45 Mnt"
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Porsi Saji</label>
              <input
                type="text"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4 Porsi"
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={spicy}
                  onChange={(e) => setSpicy(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-xs font-bold flex items-center gap-1 text-zinc-800 dark:text-zinc-200">
                  <Flame className="w-3.5 h-3.5 text-red-500" /> Pedas
                </span>
              </label>
            </div>
          </div>

          {/* Media: Image & YouTube */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Unggah Foto Resep / URL Gambar
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <label className="px-3.5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 cursor-pointer text-xs font-bold flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Memproses...' : 'Upload Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              {imageUrl && (
                <div className="relative mt-2 aspect-video max-h-36 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={imageUrl}
                    alt="Preview Resep"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 px-2 py-1 text-[10px] font-bold bg-black/70 hover:bg-black text-white rounded-lg backdrop-blur-sm"
                  >
                    Hapus Foto
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Tautan Video YouTube (Opsional)
              </label>
              <div className="relative">
                <Youtube className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Bahan Masakan */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
                2. Komposisi Bahan
              </h3>
              <p className="text-xs text-zinc-500">Tuliskan takaran yang jelas agar mudah disesuaikan porsinya</p>
            </div>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Bahan
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => {
                    const next = [...ingredients];
                    next[idx].name = e.target.value;
                    setIngredients(next);
                  }}
                  placeholder="Nama Bahan (misal: Daging Sapi Has Luar)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <input
                  type="text"
                  value={ing.detail}
                  onChange={(e) => {
                    const next = [...ingredients];
                    next[idx].detail = e.target.value;
                    setIngredients(next);
                  }}
                  placeholder="Takaran (500 gr)"
                  className="w-36 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <input
                  type="text"
                  value={ing.role}
                  onChange={(e) => {
                    const next = [...ingredients];
                    next[idx].role = e.target.value;
                    setIngredients(next);
                  }}
                  placeholder="Peran/Tips (potong dadu 3cm)"
                  className="hidden sm:block flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  className="p-2.5 text-zinc-400 hover:text-red-500 rounded-xl"
                  title="Hapus baris"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Langkah Instruksi Memasak */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
                3. Langkah Memasak (Instruksi)
              </h3>
              <p className="text-xs text-zinc-500">
                Langkah ini akan dibacakan oleh suara asisten pada mode bebas genggam
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddInstruction}
              className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Langkah
            </button>
          </div>

          <div className="space-y-4">
            {instructions.map((inst, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-primary text-white text-[10px] flex items-center justify-center font-black">
                      {idx + 1}
                    </span>
                    Judul Langkah
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    className="p-1 text-zinc-400 hover:text-red-500 rounded-lg"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/eksplorasi"
            className="px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-200"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-xs sm:text-sm shadow-xl shadow-primary/25 disabled:opacity-50 transition-transform active:scale-95 flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Resep'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
