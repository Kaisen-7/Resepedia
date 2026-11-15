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
  Award,
  Zap,
} from 'lucide-react';
import { Recipe } from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getMyLocalRecipes } from '@/lib/utils/recipe-storage';
import { playClickSound } from '@/lib/utils/sound-effects';
import { getLocalMastery, UserMastery } from '@/lib/utils/mastery-storage';

interface HomeClientProps {
  initialRecipes: Recipe[];
  savedRecipeIds: string[];
}

export default function HomeClient({ initialRecipes, savedRecipeIds }: HomeClientProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [localMyRecipes, setLocalMyRecipes] = useState<Recipe[]>([]);
  const [mastery, setMastery] = useState<UserMastery | null>(null);

  useEffect(() => {
    setLocalMyRecipes(getMyLocalRecipes(user?.uid));
    setMastery(getLocalMastery(user?.uid, language));

    const handleUpdated = () => setLocalMyRecipes(getMyLocalRecipes(user?.uid));
    const handleMasteryUpdated = () => setMastery(getLocalMastery(user?.uid, language));

    window.addEventListener('my-recipes-updated', handleUpdated);
    window.addEventListener('mastery-updated', handleMasteryUpdated);

    return () => {
      window.removeEventListener('my-recipes-updated', handleUpdated);
      window.removeEventListener('mastery-updated', handleMasteryUpdated);
    };
  }, [user, language]);

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
    { name: 'All', label: t('Semua Daerah'), badge: language === 'en' ? 'Archipelago Tavern' : 'Kedai Nusantara' },
    { name: 'Sumatra', label: 'Sumatra', badge: language === 'en' ? 'Rendang & Curry' : 'Rendang & Gulai' },
    { name: 'Jawa', label: language === 'en' ? 'Java' : 'Jawa', badge: language === 'en' ? 'Rawon & Soto' : 'Rawon & Soto' },
    { name: 'Bali', label: 'Bali & NTB', badge: language === 'en' ? 'Betutu & Matah' : 'Betutu & Matah' },
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
    playClickSound();
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const openAlmanac = (query: string = '') => {
    playClickSound();
    window.dispatchEvent(new CustomEvent('open-spice-almanac', { detail: { query } }));
  };

  // Filter recipes based on search, region, category, and selected ingredients
  const filteredRecipes = useMemo(() => {
    return allCombinedRecipes.filter((recipe) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = recipe.title.toLowerCase().includes(q);
        const descMatch = recipe.description?.toLowerCase().includes(q);
        const ingMatch = recipe.ingredients.some((i) => i.name.toLowerCase().includes(q));
        const regionMatch = recipe.region?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !ingMatch && !regionMatch) return false;
      }

      if (selectedRegion !== 'All' && recipe.region !== selectedRegion) return false;
      if (selectedCategory !== 'All' && recipe.category !== selectedCategory) return false;

      if (selectedIngredients.length > 0) {
        const recipeIngNames = recipe.ingredients.map((i) => i.name.toLowerCase());
        const hasSelected = selectedIngredients.some((ing) =>
          recipeIngNames.some((rIng) => rIng.includes(ing.toLowerCase()))
        );
        if (!hasSelected) return false;
      }

      return true;
    });
  }, [allCombinedRecipes, searchQuery, selectedRegion, selectedCategory, selectedIngredients]);

  return (
    <div className="space-y-10 sm:space-y-16 pb-28 md:pb-16">
      {/* Hero Section - Papan Kedai Nusantara */}
      <section className="relative pt-6 sm:pt-12 pb-8 sm:pb-12 bg-linear-to-b from-[#EFE4CE]/60 via-[#F6EFE2] to-[#F6EFE2] dark:from-[#241912] dark:to-[#1C1410] border-b-2 border-[#5C3A21]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-5">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#C85A32] dark:text-[#E26E45] text-xs font-black tracking-wide border-2 border-[#5C3A21]/30 shadow-[2px_2px_0px_#2C1E16]">
              <Utensils className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Archipelago Tavern & Grimoire' : 'Kedai & Kitab Resep Nusantara'}</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-2xl sm:text-5xl lg:text-6xl text-[#2C1E16] dark:text-[#F6EFE2] tracking-tight leading-[1.18] sm:leading-[1.15]">
              {greeting.title}
            </h1>

            <p className="text-xs sm:text-base text-[#5C3A21] dark:text-[#D9C8AA] max-w-xl mx-auto leading-relaxed">
              {t(
                'Jelajahi warisan resep autentik dari 6 kepulauan besar Indonesia. Dilengkapi takaran porsi terukur dan panduan langkah demi langkah.'
              )}
            </p>

            {/* Practical Search Bar */}
            <div className="pt-2 max-w-2xl mx-auto space-y-2.5">
              <div className="relative flex items-center bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-1.5 sm:p-2 border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[4px_4px_0px_#2C1E16]">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#8C6239] ml-2.5 sm:ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Search recipes, spices, or regions...'
                      : 'Cari masakan atau bahan (Ayam, Rendang, Santan)...'
                  }
                  className="w-full bg-transparent px-2.5 sm:px-3 py-2 text-xs sm:text-base text-[#2C1E16] dark:text-[#F6EFE2] placeholder-[#8C6239]/60 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#8C6239] hover:text-[#2C1E16] px-2 font-bold shrink-0"
                  >
                    {language === 'en' ? 'Clear' : 'Hapus'}
                  </button>
                )}
                <button
                  onClick={() => openAlmanac(searchQuery)}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4A7C59] text-white hover:bg-[#365C41] text-xs font-bold border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5 shrink-0"
                  title={language === 'en' ? 'Open Spice Almanac' : 'Buka Kitab Rempah Nusantara'}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Spice Almanac' : 'Kitab Rempah'}</span>
                </button>
              </div>

              {/* Mobile Quick Shortcut to Kitab Rempah */}
              <div className="flex sm:hidden items-center justify-center gap-2">
                <button
                  onClick={() => openAlmanac(searchQuery)}
                  className="w-full py-2 px-3 rounded-xl bg-[#4A7C59] text-white text-xs font-bold border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] flex items-center justify-center gap-1.5 active:translate-y-0.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Open Spice Almanac & Substitutes' : 'Buka Kitab Rempah & Substitusi'}</span>
                </button>
              </div>

              {/* Chef Mastery Status Banner if user has played */}
              {mastery && mastery.cookedRecipeIds.length > 0 && (
                <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] border-2 border-[#D99B26] shadow-[2px_2px_0px_#2C1E16] flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D99B26] shrink-0" />
                    <span className="text-[#2C1E16] dark:text-[#F6EFE2] truncate">
                      {mastery.title} (Level {mastery.level})
                    </span>
                  </div>
                  <span className="text-[#4A7C59] font-mono shrink-0 ml-2">
                    {mastery.cookedRecipeIds.length} {language === 'en' ? 'Mastered' : 'Dikuasai'} (+{mastery.xp} XP)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Ingredient Pantry Filter */}
        <section className="bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-4 sm:p-6 border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[4px_4px_0px_#2C1E16] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-[#2C1E16] dark:text-[#F6EFE2]">
                {language === 'en' ? 'Pantry Ingredients at Home' : 'Punya Bahan Apa di Rumah?'}
              </h3>
              <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA]">
                {language === 'en'
                  ? 'Select available kitchen ingredients to reveal matching recipes'
                  : 'Pilih bahan yang ada di kulkas atau dapur Anda'}
              </p>
            </div>
            {selectedIngredients.length > 0 && (
              <button
                onClick={() => {
                  playClickSound();
                  setSelectedIngredients([]);
                }}
                className="text-xs font-bold text-[#C85A32] hover:underline"
              >
                {language === 'en' ? 'Reset Ingredients' : 'Atur Ulang Bahan'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
            {popularIngredients.map((ing) => {
              const isSelected = selectedIngredients.includes(ing);
              return (
                <button
                  key={ing}
                  onClick={() => toggleIngredient(ing)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 flex items-center gap-1.5 active:translate-y-0.5 ${
                    isSelected
                      ? 'bg-[#C85A32] text-white border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]'
                      : 'bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] border-[#5C3A21]/30 hover:border-[#5C3A21]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{ing}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Region Archipelago Filter */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#5C3A21]/20 pb-3 flex-wrap gap-2">
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#2C1E16] dark:text-[#F6EFE2] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#C85A32]" />
                <span>{language === 'en' ? 'Archipelago Regions' : 'Kepulauan Citarasa Nusantara'}</span>
              </h2>
              <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA]">
                {language === 'en'
                  ? 'Discover traditional culinary signatures from across the islands'
                  : 'Jelajahi resep khas daerah dari Sabang sampai Merauke'}
              </p>
            </div>

            <Link
              href="/eksplorasi"
              onClick={() => playClickSound()}
              className="text-xs font-black text-[#C85A32] hover:underline flex items-center gap-1"
            >
              <span>{language === 'en' ? 'View All Scrolls' : 'Lihat Semua Gulungan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {regions.map((reg) => {
              const isSelected = selectedRegion === reg.name;
              return (
                <button
                  key={reg.name}
                  onClick={() => {
                    playClickSound();
                    setSelectedRegion(reg.name);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all active:translate-y-0.5 last:col-span-2 sm:last:col-span-1 ${
                    isSelected
                      ? 'bg-[#C85A32] text-white border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16]'
                      : 'bg-[#FCF9F2] dark:bg-[#241912] border-[#5C3A21]/40 text-[#2C1E16] dark:text-[#F6EFE2] hover:border-[#5C3A21]'
                  }`}
                >
                  <span className="font-display font-black text-xs sm:text-sm block">
                    {reg.label}
                  </span>
                  <span
                    className={`text-[10px] mt-0.5 block truncate ${
                      isSelected ? 'text-amber-200' : 'text-[#8C6239] dark:text-[#D1A67B]'
                    }`}
                  >
                    {reg.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Category Tabs & Recipe Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full sm:w-auto">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playClickSound();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 active:translate-y-0.5 shrink-0 ${
                      isSelected
                        ? 'bg-[#4A7C59] text-white border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]'
                        : 'bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#D9C8AA] border-[#5C3A21]/30 hover:border-[#5C3A21]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-mono font-bold text-[#8C6239]">
              {filteredRecipes.length} {language === 'en' ? 'scrolls found' : 'gulungan ditemukan'}
            </span>
          </div>

          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={savedRecipeIds.includes(recipe.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-[3px] border-dashed border-[#5C3A21]/40 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#EFE4CE] text-[#C85A32] flex items-center justify-center mx-auto border border-[#5C3A21]/30">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-base text-[#2C1E16] dark:text-[#F6EFE2]">
                {language === 'en' ? 'No recipes found' : 'Tidak ada resep yang sesuai'}
              </h3>
              <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA] max-w-md mx-auto leading-relaxed">
                {language === 'en'
                  ? 'Try fewer search keywords or adjust pantry ingredients to discover more archipelago recipes.'
                  : 'Coba kurangi kata kunci pencarian atau sesuaikan pilihan bahan kulkas untuk melihat resep Nusantara lainnya.'}
              </p>
              <button
                onClick={() => {
                  playClickSound();
                  setSearchQuery('');
                  setSelectedRegion('All');
                  setSelectedCategory('All');
                  setSelectedIngredients([]);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-bold border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
              >
                {language === 'en' ? 'Reset All Filters' : 'Reset Semua Filter'}
              </button>
            </div>
          )}
        </section>

        {/* Kitab Rempah Nusantara Showcase Banner (Replaces AI Slop Banner) */}
        <section className="bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-5 sm:p-10 border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[6px_6px_0px_#2C1E16] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#4A7C59]/15 text-[#4A7C59] dark:text-[#88C59A] border border-[#4A7C59]/30 text-xs font-black">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Archipelago Spice Almanac' : 'Kitab Rempah & Rahasia Bumbu'}</span>
            </div>
            <h3 className="font-display font-black text-xl sm:text-3xl text-[#2C1E16] dark:text-[#F6EFE2] leading-tight">
              {language === 'en'
                ? 'Missing an Ingredient or Need Accurate Substitutes?'
                : 'Bingung Takaran Bumbu atau Kehabisan Bahan?'}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] leading-relaxed">
              {language === 'en'
                ? 'Open the Nusantara Spice Almanac for instant ratios on candlenut, kluwek, galangal, tamarind, and other authentic spices. 100% curated, zero wait time, completely offline.'
                : 'Buka Kitab Rempah Nusantara untuk mengetahui profil rasa, peran kuliner, dan racikan darurat kemiri, kluwek, laja, asam kandis, dan bumbu tradisional lainnya secara instan!'}
            </p>
          </div>

          <button
            onClick={() => openAlmanac()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#4A7C59] hover:bg-[#365C41] text-white font-black text-xs sm:text-sm border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] transition-transform active:translate-y-0.5 shrink-0 flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'en' ? 'Open Spice Almanac' : 'Buka Kitab Rempah'}</span>
          </button>
        </section>
      </div>
    </div>
  );
}
