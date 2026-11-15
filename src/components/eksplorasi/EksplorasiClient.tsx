'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Flame, Compass, FilterX } from 'lucide-react';
import { Recipe } from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { playClickSound } from '@/lib/utils/sound-effects';

interface EksplorasiClientProps {
  initialRecipes: Recipe[];
  savedRecipeIds: string[];
}

export default function EksplorasiClient({
  initialRecipes,
  savedRecipeIds,
}: EksplorasiClientProps) {
  const { t, language } = useLanguage();
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

  const getRegionLabel = (reg: string) => {
    if (reg === 'All') return language === 'en' ? 'All Archipelago' : 'Seluruh Wilayah';
    if (reg === 'Jawa') return language === 'en' ? 'Java' : 'Jawa';
    return reg;
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === 'All') return language === 'en' ? 'All Categories' : 'Semua Kategori';
    if (cat === 'Main Course') return t('Makanan Utama');
    if (cat === 'Appetizer') return t('Camilan & Pembuka');
    if (cat === 'Dessert') return t('Hidangan Penutup');
    if (cat === 'Drink') return t('Minuman Tradisional');
    return cat;
  };

  const getDifficultyLabel = (diff: string) => {
    if (diff === 'All') return language === 'en' ? 'All Ranks' : 'Semua Tingkat';
    if (diff === 'Easy') return language === 'en' ? '★ Rank C (Beginner)' : '★ Rank C (Pemula)';
    if (diff === 'Medium') return language === 'en' ? '★★ Rank B (Skilled)' : '★★ Rank B (Terampil)';
    if (diff === 'Hard') return language === 'en' ? '★★★ Rank A (Mastery)' : '★★★ Rank A (Mahakarya)';
    return diff;
  };

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
    playClickSound();
    setQuery('');
    setSelectedRegion('All');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSpicyOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Title */}
      <div className="space-y-2 border-b-2 border-[#5C3A21]/20 pb-6">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#2C1E16] dark:text-[#F6EFE2] flex items-center gap-2">
          <Compass className="w-8 h-8 text-[#C85A32]" /> {t('Eksplorasi Kuliner Nusantara')}
        </h1>
        <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] max-w-2xl">
          {t(
            'Telusuri ratusan resep masakan autentik Indonesia dengan filter komprehensif berdasarkan wilayah, bahan, tingkat kesulitan, dan kategori hidangan.'
          )}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-4 sm:p-5 border-3 border-[#5C3A21] dark:border-[#8C6239] shadow-[5px_5px_0px_#2C1E16] space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#8C6239] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'en'
                ? 'Search by recipe scroll name, spices, or regional keywords...'
                : 'Cari berdasarkan nama gulungan resep, bumbu, atau bahan...'
            }
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-[#1C1410] border-2 border-[#5C3A21]/50 text-sm text-[#2C1E16] dark:text-[#F6EFE2] placeholder-[#8C6239]/60 focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        {/* Filter Pills row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
            <span className="text-xs font-bold text-[#8C6239] mr-1 shrink-0">
              {language === 'en' ? 'Region:' : 'Pulau:'}
            </span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => {
                  playClickSound();
                  setSelectedRegion(reg);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border-2 active:translate-y-0.5 ${
                  selectedRegion === reg
                    ? 'bg-[#C85A32] text-white border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]'
                    : 'bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] border-[#5C3A21]/30 hover:border-[#5C3A21]'
                }`}
              >
                {getRegionLabel(reg)}
              </button>
            ))}
          </div>

          {/* Quick Spicy toggle & Reset */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <button
              onClick={() => {
                playClickSound();
                setSpicyOnly(!spicyOnly);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all active:translate-y-0.5 ${
                spicyOnly
                  ? 'bg-[#B83B2B] text-white border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]'
                  : 'bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] border-[#5C3A21]/30 hover:border-[#B83B2B]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> {language === 'en' ? 'Spicy Only' : 'Pedas Saja'}
            </button>

            <button
              onClick={handleResetFilters}
              className="p-1.5 text-[#8C6239] hover:text-[#2C1E16] dark:hover:text-[#F6EFE2] rounded-lg"
              title={language === 'en' ? 'Reset Filters' : 'Reset Filter'}
            >
              <FilterX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Second row: Categories & Difficulties & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t-2 border-[#5C3A21]/20 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8C6239] font-bold">{t('Kategori')}:</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  playClickSound();
                  setSelectedCategory(e.target.value);
                }}
                className="bg-[#EFE4CE] dark:bg-[#2C1E16] rounded-xl px-2.5 py-1 font-bold text-[#2C1E16] dark:text-[#F6EFE2] border-2 border-[#5C3A21]/40 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {getCategoryLabel(c)}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8C6239] font-bold">{t('Tingkat Kesulitan')}:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  playClickSound();
                  setSelectedDifficulty(e.target.value);
                }}
                className="bg-[#EFE4CE] dark:bg-[#2C1E16] rounded-xl px-2.5 py-1 font-bold text-[#2C1E16] dark:text-[#F6EFE2] border-2 border-[#5C3A21]/40 focus:outline-none"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {getDifficultyLabel(d)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#8C6239] font-bold">{t('Urutkan:')}</span>
            <select
              value={sortBy}
              onChange={(e) => {
                playClickSound();
                setSortBy(e.target.value as any);
              }}
              className="bg-[#EFE4CE] dark:bg-[#2C1E16] rounded-xl px-2.5 py-1 font-bold text-[#2C1E16] dark:text-[#F6EFE2] border-2 border-[#5C3A21]/40 focus:outline-none"
            >
              <option value="newest">{t('Terbaru')}</option>
              <option value="rating">{t('Rating Tertinggi')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <p className="text-xs font-mono font-bold text-[#8C6239]">
          {language === 'en' ? (
            <>
              Displaying <strong>{filteredRecipes.length}</strong> archipelago scrolls
            </>
          ) : (
            <>
              Menampilkan <strong>{filteredRecipes.length}</strong> gulungan resep
            </>
          )}
        </p>

        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSaved={savedRecipeIds.includes(recipe.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-3 border-dashed border-[#5C3A21]/40 p-8 space-y-3">
            <h4 className="font-display font-bold text-lg text-[#2C1E16] dark:text-[#F6EFE2]">
              {language === 'en'
                ? 'No recipe scrolls match your criteria'
                : 'Tidak ada gulungan resep yang memenuhi kriteria'}
            </h4>
            <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA]">
              {language === 'en'
                ? 'Try clearing some filters or search for more common ingredients.'
                : 'Coba kurangi filter atau gunakan kata kunci pencarian yang lebih umum.'}
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-black border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
            >
              {language === 'en' ? 'Clear Filters' : 'Bersihkan Filter'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
