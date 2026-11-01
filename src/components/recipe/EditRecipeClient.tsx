'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Save,
  Trash2,
  Plus,
  Upload,
  ChefHat,
  Flame,
  Clock,
  Users,
  Youtube,
  AlertCircle,
} from 'lucide-react';
import { Recipe } from '@/types';
import { updateRecipeAction, deleteRecipeAction } from '@/actions/recipe.actions';
import { extractYouTubeVideoId } from '@/lib/utils/youtube';
import { uploadRecipeImage } from '@/lib/firebase/service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface EditRecipeClientProps {
  recipe: Recipe;
}

export default function EditRecipeClient({ recipe }: EditRecipeClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState(recipe.title || '');
  const [description, setDescription] = useState(recipe.description || '');
  const [prepTime, setPrepTime] = useState(recipe.prepTime || '15 Mnt');
  const [cookTime, setCookTime] = useState(recipe.cookTime || '30 Mnt');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(
    recipe.difficulty || 'Medium'
  );
  const [category, setCategory] = useState<'Appetizer' | 'Main Course' | 'Dessert' | 'Drink'>(
    recipe.category as any || 'Main Course'
  );
  const [region, setRegion] = useState(recipe.region || 'Jawa');
  const [servings, setServings] = useState(recipe.servings || '4 Porsi');
  const [calories, setCalories] = useState(recipe.calories || '350 kcal');
  const [spicy, setSpicy] = useState(Boolean(recipe.spicy));
  const [imageUrl, setImageUrl] = useState(recipe.image || '');
  const [youtubeUrl, setYoutubeUrl] = useState(recipe.youtubeUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Ingredients state
  const [ingredients, setIngredients] = useState(
    recipe.ingredients && recipe.ingredients.length > 0
      ? recipe.ingredients.map((i) => ({ ...i }))
      : [{ name: '', detail: '', role: '' }]
  );

  // Instructions state
  const [instructions, setInstructions] = useState(
    recipe.instructions && recipe.instructions.length > 0
      ? recipe.instructions.map((ins) => ({ ...ins }))
      : [{ title: 'Langkah 1', text: '' }]
  );

  // Variations state
  const [variations, setVariations] = useState(
    recipe.variations && recipe.variations.length > 0
      ? recipe.variations.map((v) => ({ ...v }))
      : []
  );

  // Nutrition state
  const [nutrition, setNutrition] = useState({
    protein: recipe.nutrition?.protein || '0g',
    fat: recipe.nutrition?.fat || '0g',
    carbs: recipe.nutrition?.carbs || '0g',
  });

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

  const handleAddVariation = () => {
    setVariations((prev) => [...prev, { title: '', description: '' }]);
  };

  const handleRemoveVariation = (idx: number) => {
    setVariations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadRecipeImage(file, user?.uid);
      if (publicUrl) {
        setImageUrl(publicUrl);
        toast.success('Foto resep berhasil diperbarui!');
      } else {
        toast.error('Gagal mengunggah foto. Anda dapat memasukkan URL gambar langsung.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat unggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Judul dan deskripsi resep wajib diisi');
      return;
    }

    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      toast.error('Tambahkan minimal 1 bahan masakan');
      return;
    }

    const validInstructions = instructions.filter((i) => i.text.trim());
    if (validInstructions.length === 0) {
      toast.error('Tambahkan minimal 1 langkah cara memasak');
      return;
    }

    setIsSubmitting(true);

    const updates = {
      title: title.trim(),
      description: description.trim(),
      image: imageUrl.trim() || recipe.image,
      prepTime,
      cookTime,
      difficulty,
      calories,
      category,
      region,
      spicy,
      servings,
      youtubeUrl: (() => { const id = extractYouTubeVideoId(youtubeUrl); return id ? ('https://www.youtube-nocookie.com/embed/' + id) : (youtubeUrl.trim() || null); })(),
      nutrition,
      variations: variations.filter((v) => v.title.trim()),
      ingredients: validIngredients,
      instructions: validInstructions,
      slug: recipe.slug,
    };

    const res = await updateRecipeAction(recipe.id, updates);
    if (res.success) {
      toast.success('Resep berhasil diperbarui!');
      router.push(`/resep/${recipe.slug || recipe.id}`);
      router.refresh();
    } else {
      toast.error(res.error || 'Gagal menyimpan pembaruan resep');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteRecipeAction(recipe.id);
    if (res.success) {
      toast.success('Resep berhasil dihapus.');
      router.push('/koleksi');
      router.refresh();
    } else {
      toast.error(res.error || 'Gagal menghapus resep');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const backUrl = `/resep/${recipe.slug || recipe.id}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-primary transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Batal & Kembali ke Resep
          </Link>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100">
            Edit Resep Masakan
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Perbarui takaran bahan, langkah memasak, atau foto hidangan Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Hapus Resep"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            1. Informasi Utama Hidangan
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Judul Resep <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Rendang Sapi Asli Payakumbuh"
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Deskripsi & Cerita Kuliner <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan cita rasa khas, keunikan rempah, atau latar belakang masakan ini..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Photo / Image */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Foto Hidangan
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {imageUrl && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 dark:border-zinc-700 shrink-0">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Masukkan URL foto (https://...)"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Mengunggah...' : 'Unggah File Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-zinc-400">JPG, PNG, atau WebP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Tutorial Link */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Link Video YouTube (Opsional)
              </label>
              <div className="relative">
                <Youtube className="w-4 h-4 text-red-500 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Metadata & Specifications */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            2. Karakteristik & Takaran
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Kategori Hidangan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Main Course">Makanan Utama (Main Course)</option>
                <option value="Appetizer">Hidangan Pembuka / Camilan</option>
                <option value="Dessert">Hidangan Penutup (Dessert)</option>
                <option value="Drink">Minuman Tradisional (Drink)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Asal Wilayah Nusantara
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Sumatra">Sumatra (Minang, Batak, Aceh, Palembang)</option>
                <option value="Jawa">Jawa (Sunda, Jawa Tengah, Jawa Timur, Betawi)</option>
                <option value="Bali">Bali & Nusa Tenggara</option>
                <option value="Sulawesi">Sulawesi (Makassar, Manado, Toraja)</option>
                <option value="Kalimantan">Kalimantan (Banjar, Dayak, Melayu)</option>
                <option value="Papua">Papua & Maluku</option>
                <option value="Nusantara">Nusantara Universal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Tingkat Kesulitan
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Easy">Mudah (Easy)</option>
                <option value="Medium">Menengah (Medium)</option>
                <option value="Hard">Mahir (Hard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Waktu Persiapan
              </label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15 Mnt"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Waktu Memasak
              </label>
              <input
                type="text"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="30 Mnt"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Porsi Standar
              </label>
              <input
                type="text"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4 Porsi"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Spicy Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSpicy(!spicy)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                spicy
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{spicy ? 'Cita Rasa Pedas Aktif' : 'Tidak Terlalu Pedas'}</span>
            </button>
            <span className="text-[11px] text-zinc-500">
              Menampilkan label pedas pada katalog resep
            </span>
          </div>
        </div>

        {/* Section 3: Ingredients */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
                3. Bahan-Bahan Masakan
              </h2>
              <p className="text-xs text-zinc-500">
                Tulis nama bahan, takaran, dan fungsinya (misal: bumbu halus, aroma, topping)
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Bahan
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 sm:gap-3 items-center bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60"
              >
                <div className="col-span-5 sm:col-span-5">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].name = e.target.value;
                      setIngredients(updated);
                    }}
                    placeholder="Nama bahan (Daging Sapi, Santan...)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="col-span-3 sm:col-span-3">
                  <input
                    type="text"
                    value={ing.detail}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].detail = e.target.value;
                      setIngredients(updated);
                    }}
                    placeholder="Takaran (500 gr, 2 sdm...)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
                <div className="col-span-3 sm:col-span-3">
                  <input
                    type="text"
                    value={ing.role || ''}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[idx].role = e.target.value;
                      setIngredients(updated);
                    }}
                    placeholder="Keterangan (Bumbu halus, Rempah aroma...)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    disabled={ingredients.length <= 1}
                    className="p-1.5 text-zinc-400 hover:text-red-500 disabled:opacity-30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Instructions */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
                4. Langkah-Langkah Memasak
              </h2>
              <p className="text-xs text-zinc-500">
                Jelaskan cara memasak secara bertahap dan mudah dipahami.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddInstruction}
              className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Langkah
            </button>
          </div>

          <div className="space-y-4">
            {instructions.map((step, idx) => (
              <div
                key={idx}
                className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const updated = [...instructions];
                        updated[idx].title = e.target.value;
                        setInstructions(updated);
                      }}
                      placeholder={`Judul langkah (misal: Menumis Bumbu)`}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    disabled={instructions.length <= 1}
                    className="p-1.5 text-zinc-400 hover:text-red-500 disabled:opacity-30 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={step.text}
                  onChange={(e) => {
                    const updated = [...instructions];
                    updated[idx].text = e.target.value;
                    setInstructions(updated);
                  }}
                  placeholder="Jelaskan detail tindakan pada langkah ini (masukkan durasi misal: 'tumis selama 5 menit' untuk mengaktifkan timer otomatis)..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Variations & Tips */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
                5. Variasi & Tips Tambahan (Opsional)
              </h2>
              <p className="text-xs text-zinc-500">
                Berikan opsi modifikasi bahan atau rahasia memasak agar hidangan lebih maksimal.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariation}
              className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Tips
            </button>
          </div>

          {variations.length > 0 ? (
            <div className="space-y-3">
              {variations.map((v, idx) => (
                <div
                  key={idx}
                  className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={v.title}
                      onChange={(e) => {
                        const updated = [...variations];
                        updated[idx].title = e.target.value;
                        setVariations(updated);
                      }}
                      placeholder="Judul Tips (misal: Versi Rendah Lemak)"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariation(idx)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={v.description}
                    onChange={(e) => {
                      const updated = [...variations];
                      updated[idx].description = e.target.value;
                      setVariations(updated);
                    }}
                    placeholder="Penjelasan tips modifikasi..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic">Belum ada tips variasi tambahan.</p>
          )}
        </div>

        {/* Submit Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl flex items-center justify-between gap-4">
          <Link
            href={backUrl}
            className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 px-4 py-2"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-container disabled:opacity-50 shadow-md shadow-primary/25 transition-transform active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
                Hapus Resep Ini?
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                Tindakan ini permanen. Resep <strong>{recipe.title}</strong> beserta seluruh data bahan dan ulasannya akan dihapus dari Resepedia.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Resep'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
