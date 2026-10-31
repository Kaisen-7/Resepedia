'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Flame,
  ChefHat,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  Check,
} from 'lucide-react';
import { Recipe } from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAI } from '@/contexts/AIContext';

interface HomeClientProps {
  initialRecipes: Recipe[];
  savedRecipeIds: string[];
}

export default function HomeClient({ initialRecipes, savedRecipeIds }: HomeClientProps) {
  const { openAI } = useAI();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return { title: 'Selamat Pagi! Mau Sarapan Apa Hari Ini?', time: 'pagi' };
    if (hour < 15) return { title: 'Selamat Siang! Siap Masak Makan Siang Lezat?', time: 'siang' };
    if (hour < 18) return { title: 'Selamat Sore! Cari Ide Camilan atau Makan Malam?', time: 'sore' };
    return { title: 'Selamat Malam! Butuh Inspirasi Masakan Hangat?', time: 'malam' };
  };

  const greeting = getGreeting();

  const regions = [
    { name: 'All', label: 'Semua Wilayah' },
    { name: 'Sumatra', label: 'Sumatra', badge: 'Rendang & Gulai' },
    { name: 'Jawa', label: 'Jawa', badge: 'Rawon & Soto' },
    { name: 'Bali', label: 'Bali & NTB', badge: 'Betutu & Sambal Matah' },
    { name: 'Sulawesi', label: 'Sulawesi', badge: 'Coto & Woku' },
    { name: 'Kalimantan', label: 'Kalimantan', badge: 'Soto Banjar' },
    { name: 'Papua', label: 'Papua & Maluku', badge: 'Ikan Kuah Kuning' },
  ];

  const categories = ['All', 'Main Course', 'Appetizer', 'Dessert', 'Drink'];

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
  ];

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  // Filter recipes based on search, region, category, and fridge ingredients
  const filteredRecipes = useMemo(() => {
    return initialRecipes.filter((recipe) => {
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
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-b from-primary/5 via-surface to-surface border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resepedia v1.0 • Ensiklopedi Kuliner Nusantara</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-on-surface tracking-tight leading-[1.15]">
              {greeting.title}
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
              Jelajahi warisan resep autentik dari 6 pulau besar Indonesia. Didukung panduan memasak bersuara bebas genggam dan konsultasi bumbu bersama Chef AI.
            </p>

            {/* Smart Search Bar */}
            <div className="pt-2 max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-3xl p-2 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200/80 dark:border-zinc-800 focus-within:border-primary/80 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                <Search className="w-5 h-5 text-zinc-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari masakan (Rendang, Rawon, Coto) atau bahan..."
                  className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  onClick={() => openAI()}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-transform active:scale-95 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tanya AI</span>
                </button>
              </div>

              {/* Quick Prompt Chips */}
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-zinc-500">
                <span className="font-semibold text-zinc-400">Populer:</span>
                {['Rendang Padang', 'Soto Betawi', 'Sate Madura', 'Gado-Gado', 'Ayam Betutu'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSearchQuery(item)}
                    className="hover:text-primary transition-colors hover:underline"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Ingredient-First Filter ("Bahan di Kulkas") */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>🧊 Bahan di Kulkas Kamu</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                  Filter Cerdas
                </span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pilih bahan yang ada di dapur, Resepedia akan menyaring resep yang cocok untukmu.
              </p>
            </div>
            {selectedIngredients.length > 0 && (
              <button
                onClick={() => setSelectedIngredients([])}
                className="text-xs font-bold text-primary hover:underline text-left"
              >
                Reset Bahan ({selectedIngredients.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {popularIngredients.map((ing) => {
              const isSelected = selectedIngredients.includes(ing);
              return (
                <button
                  key={ing}
                  onClick={() => toggleIngredient(ing)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-secondary text-white shadow-md shadow-secondary/20 scale-105'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
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
                <Compass className="w-5 h-5 text-primary" /> Jelajahi Pulau Nusantara
              </h2>
              <p className="text-xs text-zinc-500">Cita rasa khas rempah dari Sabang sampai Merauke</p>
            </div>
            <Link
              href="/eksplorasi"
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {regions.map((reg) => {
              const isActive = selectedRegion === reg.name;
              return (
                <button
                  key={reg.name}
                  onClick={() => setSelectedRegion(reg.name)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all text-left flex flex-col gap-0.5 border ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:border-primary/50'
                  }`}
                >
                  <span className="font-bold">{reg.label}</span>
                  {reg.badge && (
                    <span
                      className={`text-[10px] ${isActive ? 'text-white/80' : 'text-zinc-400'}`}
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
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat === 'All' ? 'Semua Hidangan' : cat}
              </button>
            );
          })}
        </div>

        {/* Recipe Cards Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
            <div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100">
                {selectedRegion === 'All' ? 'Resep Pilihan Nusantara' : `Masakan Khas ${selectedRegion}`}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Ditemukan <strong>{filteredRecipes.length}</strong> resep masakan
              </p>
            </div>
          </div>

          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
                Tidak ada resep yang cocok
              </h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Coba ubah kata kunci pencarian atau bersihkan filter bahan kulkas untuk melihat resep lainnya.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRegion('All');
                  setSelectedCategory('All');
                  setSelectedIngredients([]);
                }}
                className="px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </section>

        {/* Chef AI Banner CTA */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary to-primary-container p-6 sm:p-10 text-white shadow-xl shadow-primary/20">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> Asisten Cerdas Dapur
            </span>
            <h3 className="font-display font-black text-2xl sm:text-4xl leading-tight">
              Punya bahan terbatas di rumah tapi bingung mau masak apa?
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Konsultasikan dengan Chef Resepedia AI. Dapatkan rekomendasi racikan bumbu alternatif dan resep instan dalam hitungan detik!
            </p>
            <button
              onClick={() => openAI()}
              className="px-6 py-3 rounded-full bg-white text-primary font-bold text-xs sm:text-sm shadow-lg hover:bg-zinc-100 transition-transform active:scale-95"
            >
              Mulai Ngobrol dengan Chef AI
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
