'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Flame,
  ChefHat,
  ArrowRight,
  Compass,
  Check,
  Utensils,
  BookOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { Recipe } from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAI } from '@/contexts/AIContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getMyLocalRecipes } from '@/lib/utils/recipe-storage';

interface HomeClientProps {
  initialRecipes: Recipe[];
  savedRecipeIds: string[];
}

export default function HomeClient({ initialRecipes, savedRecipeIds }: HomeClientProps) {
  const { openAI } = useAI();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [localMyRecipes, setLocalMyRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    setLocalMyRecipes(getMyLocalRecipes(user?.uid));
    const handleUpdated = () => setLocalMyRecipes(getMyLocalRecipes(user?.uid));
    window.addEventListener('my-recipes-updated', handleUpdated);
    return () => window.removeEventListener('my-recipes-updated', handleUpdated);
  }, [user]);

  const allCombinedRecipes = useMemo(() => {
    const map = new Map<string, Recipe>();
    initialRecipes.forEach((r) => map.set(r.id, r));
    localMyRecipes.forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  }, [initialRecipes, localMyRecipes]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'en') {
      if (hour < 11) return { title: 'What Are You Cooking for Breakfast Today?', time: 'morning' };
      if (hour < 15) return { title: 'Delicious Lunch Inspiration Today', time: 'afternoon' };
      if (hour < 18) return { title: 'Snacks & Afternoon Bites', time: 'afternoon' };
      return { title: 'Comforting Recipes for Dinner', time: 'evening' };
    }
    if (hour < 11) return { title: 'Mau Masak Sarapan Apa Pagi Ini?', time: 'pagi' };
    if (hour < 15) return { title: 'Inspirasi Masakan Lezat Siang Ini', time: 'siang' };
    if (hour < 18) return { title: 'Ide Camilan & Santapan Sore Hari', time: 'sore' };
    return { title: 'Resep Hangat untuk Makan Malam', time: 'malam' };
  };

  const greeting = getGreeting();

  const regions = [
    { name: 'All', label: t('Semua Daerah'), badge: language === 'en' ? 'Whole Archipelago' : 'Seluruh Nusantara' },
    { name: 'Sumatra', label: 'Sumatra', badge: language === 'en' ? 'Rendang & Curry' : 'Rendang & Gulai' },
    { name: 'Jawa', label: language === 'en' ? 'Java' : 'Jawa', badge: language === 'en' ? 'Rawon, Gudeg & Soto' : 'Rawon, Gudeg & Soto' },
    { name: 'Bali', label: 'Bali & NTB', badge: language === 'en' ? 'Betutu & Sambal Matah' : 'Betutu & Sambal Matah' },
    { name: 'Sulawesi', label: 'Sulawesi', badge: language === 'en' ? 'Coto & Woku' : 'Coto & Woku' },
    { name: 'Kalimantan', label: 'Kalimantan', badge: language === 'en' ? 'Soto Banjar' : 'Soto Banjar' },
    { name: 'Papua', label: 'Papua & Maluku', badge: language === 'en' ? 'Yellow Broth' : 'Kuah Kuning' },
  ];

  const categories = [
    { id: 'All', label: t('Semua Hidangan') },
    { id: 'Main Course', label: t('Makanan Utama') },
    { id: 'Appetizer', label: t('Camilan & Pembuka') },
    { id: 'Dessert', label: t('Hidangan Penutup') },
    { id: 'Drink', label: t('Minuman Tradisional') },
  ];

  const popularIngredients = [
    'Ayam',
    'Daging Sapi',
    'Telur',
    'Tahu',
    'Tempe',
    'Santan',
    'Ikan',
    'Cabai',
    'Udang',
    'Bawang Merah',
    'Kunyit',
    'Kecap Manis',
  ];

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  // Filter recipes based on search, region, category, and fridge ingredients
  const filteredRecipes = useMemo(() => {
    return allCombinedRecipes.filter((recipe) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = recipe.title.toLowerCase().includes(query);
        const descMatch = recipe.description?.toLowerCase().includes(query);
        const regionMatch = recipe.region?.toLowerCase().includes(query);
        const ingMatch = recipe.ingredients.some(
          (i) => i.name.toLowerCase().includes(query) || i.detail?.toLowerCase().includes(query)
        );
        if (!titleMatch && !descMatch && !regionMatch && !ingMatch) return false;
      }

      // Region filter
      if (selectedRegion !== 'All' && recipe.region !== selectedRegion) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && recipe.category !== selectedCategory) {
        return false;
      }

      // Fridge ingredients filter
      if (selectedIngredients.length > 0) {
        const recipeIngsText = recipe.ingredients.map((i) => i.name.toLowerCase()).join(' ');
        const matchesAll = selectedIngredients.every((selected) =>
          recipeIngsText.includes(selected.toLowerCase())
        );
        if (!matchesAll) return false;
      }

      return true;
    });
  }, [initialRecipes, searchQuery, selectedRegion, selectedCategory, selectedIngredients]);

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-surface-container-low/60 dark:bg-zinc-900/40 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-5">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
              <Utensils className="w-3.5 h-3.5" />
              <span>Ensiklopedi Kuliner Nusantara</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-[1.15]">
              {greeting.title}
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Jelajahi warisan resep autentik dari 6 kepulauan besar Indonesia. Dilengkapi takaran porsi terukur dan panduan langkah demi langkah.
            </p>

            {/* Practical Search Bar */}
            <div className="pt-2 max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-2xl p-1.5 sm:p-2 shadow-sm border border-zinc-200 dark:border-zinc-800 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 ml-2.5 sm:ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'en' ? 'Search dishes or ingredients (Chicken, Coconut)...' : 'Cari masakan atau bahan (Ayam, Rendang, Santan)...'}
                  className="w-full bg-transparent px-2.5 sm:px-3 py-2 text-xs sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 font-bold shrink-0"
                  >
                    Hapus
                  </button>
                )}
                <button
                  onClick={() => openAI()}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors shrink-0"
                  title="Konsultasi bumbu dan ide masak"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Tanya Dapur</span>
                </button>
              </div>

              {/* Popular Search Suggestions */}
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-zinc-500">
                <span className="font-semibold text-zinc-400">Paling Dicari:</span>
                {['Rendang Sapi', 'Soto Betawi', 'Rawon Daging', 'Gado-Gado', 'Ayam Betutu'].map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => setSearchQuery(item)}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Ingredient-First Filter ("Punya Bahan Apa di Rumah?") */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Punya Bahan Apa di Rumah?</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                  Saring Resep
                </span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pilih persediaan bahan yang ada di dapurmu untuk menemukan hidangan yang cocok.
              </p>
            </div>
            {selectedIngredients.length > 0 && (
              <button
                onClick={() => setSelectedIngredients([])}
                className="text-xs font-bold text-primary hover:underline self-start sm:self-auto"
              >
                Reset Pilihan ({selectedIngredients.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {popularIngredients.map((ing) => {
              const isSelected = selectedIngredients.includes(ing);
              return (
                <button
                  key={ing}
                  onClick={() => toggleIngredient(ing)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-secondary text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                  <span>{ing}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Region Carousel / Tabs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" /> Jelajahi Tradisi Daerah
              </h2>
              <p className="text-xs text-zinc-500">
                Pilih pulau untuk melihat ragam masakan khas rempah setempat
              </p>
            </div>
            <Link
              href="/eksplorasi"
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              Semua Daerah <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {regions.map((reg) => {
              const isActive = selectedRegion === reg.name;
              return (
                <button
                  key={reg.name}
                  onClick={() => setSelectedRegion(reg.name)}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 transition-all text-left flex flex-col gap-0.5 border ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  <span className="font-bold text-sm leading-snug">{reg.label}</span>
                  {reg.badge && (
                    <span
                      className={`text-[10px] ${isActive ? 'text-white/85' : 'text-zinc-400 font-normal'}`}
                    >
                      {reg.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Category Filters Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Recipe Cards Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
            <div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100">
                {selectedRegion === 'All'
                  ? 'Katalog Resep Nusantara'
                  : `Masakan Khas Wilayah ${selectedRegion}`}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Menampilkan <strong>{filteredRecipes.length}</strong> resep masakan
              </p>
            </div>
          </div>

          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={savedRecipeIds.includes(recipe.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                <ChefHat className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
                Tidak ada resep yang sesuai kriteria
              </h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                Coba kurangi kata kunci pencarian atau sesuaikan pilihan bahan kulkas untuk melihat resep Nusantara lainnya.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRegion('All');
                  setSelectedCategory('All');
                  setSelectedIngredients([]);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </section>

        {/* Human, Grounded Kitchen Sous-Chef Card */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-10 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Konsultasi Dapur Interaktif</span>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 leading-tight">
              Bingung Takaran Bumbu atau Bahan Pengganti?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tanyakan pada Asisten Dapur Resepedia untuk tips mengolah santan, racikan rempah alternatif jika bahan tidak lengkap, atau saran menu keluarga.
            </p>
          </div>

          <button
            onClick={() => openAI()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95 shrink-0 flex items-center justify-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            <span>Mulai Tanya Asisten Dapur</span>
          </button>
        </section>
      </div>
    </div>
  );
}
