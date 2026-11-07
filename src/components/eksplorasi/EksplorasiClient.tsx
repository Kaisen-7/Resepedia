'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Flame, Compass, FilterX } from 'lucide-react';
import { Recipe } from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';

interface EksplorasiClientProps {
  initialRecipes: Recipe[];
  savedRecipeIds: string[];
}

export default function EksplorasiClient({
  initialRecipes,
  savedRecipeIds,
}: EksplorasiClientProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialRegion = searchParams.get('region') || 'All';

  const [query, setQuery] = useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'prepTime'>('newest');

  const regions = ['All', 'Sumatra', 'Jawa', 'Bali', 'Sulawesi', 'Kalimantan', 'Papua'];
  const categories = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Drink'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredRecipes = useMemo(() => {
    let result = initialRecipes.filter((recipe) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const titleMatch = recipe.title.toLowerCase().includes(q);
        const descMatch = recipe.description?.toLowerCase().includes(q);
        const ingMatch = recipe.ingredients.some((i) => i.name.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !ingMatch) return false;
      }

      if (selectedRegion !== 'All' && recipe.region !== selectedRegion) return false;
      if (selectedCategory !== 'All' && recipe.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'All' && recipe.difficulty !== selectedDifficulty) return false;
      if (spicyOnly && !recipe.spicy) return false;

      return true;
    });

    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      // already ordered by created_at descending
    }

    return result;
  }, [
    initialRecipes,
    query,
    selectedRegion,
    selectedCategory,
    selectedDifficulty,
    spicyOnly,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedRegion('All');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSpicyOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Title */}
      <div className="space-y-2">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Compass className="w-8 h-8 text-primary" /> Eksplorasi Kuliner Nusantara
        </h1>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Telusuri ratusan resep masakan autentik Indonesia dengan filter komprehensif berdasarkan wilayah, bahan, tingkat kesulitan, dan kategori hidangan.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berdasarkan nama resep, bumbu, atau bahan..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter Pills row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
            <span className="text-xs font-bold text-zinc-400 mr-1 shrink-0">Pulau:</span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedRegion === reg
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
              >
                {reg === 'All' ? 'Semua' : reg}
              </button>
            ))}
          </div>

          {/* Quick Spicy toggle & Reset */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                spicyOnly
                  ? 'bg-red-500 text-white border-red-500 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent hover:border-red-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Pedas Saja
            </button>

            <button
              onClick={handleResetFilters}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
              title="Reset Filter"
            >
              <FilterX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Second row: Categories & Difficulties & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 font-medium">Kategori:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-2.5 py-1 font-bold text-zinc-800 dark:text-zinc-200 border-none focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'Semua Kategori' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 font-medium">Tingkat:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-2.5 py-1 font-bold text-zinc-800 dark:text-zinc-200 border-none focus:outline-none"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'Semua Tingkat' : d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium">Urutan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-2.5 py-1 font-bold text-zinc-800 dark:text-zinc-200 border-none focus:outline-none"
            >
              <option value="newest">Terbaru</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-zinc-500">
          Menampilkan <strong>{filteredRecipes.length}</strong> resep masakan
        </p>

        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSaved={savedRecipeIds.includes(recipe.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-3">
            <h4 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-200">
              Tidak ada resep yang memenuhi kriteria
            </h4>
            <p className="text-xs text-zinc-500">
              Coba kurangi filter atau gunakan kata kunci pencarian yang lebih umum.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container"
            >
              Bersihkan Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
