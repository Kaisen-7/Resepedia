'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Archive,
  Info,
  Check,
} from 'lucide-react';
import { SPICE_ALMANAC, searchSpices } from '@/lib/data/spice-almanac';
import { SpiceAlmanacEntry } from '@/types/recipe.types';
import { useLanguage } from '@/contexts/LanguageContext';
import { playClickSound, playPageTurnSound } from '@/lib/utils/sound-effects';

interface SpiceAlmanacDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  selectedSpiceId?: string | null;
}

export default function SpiceAlmanacDrawer({
  isOpen,
  onClose,
  initialQuery = '',
  selectedSpiceId = null,
}: SpiceAlmanacDrawerProps) {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSpice, setActiveSpice] = useState<SpiceAlmanacEntry | null>(null);

  useEffect(() => {
    if (isOpen) {
      playPageTurnSound();
      if (initialQuery) {
        setQuery(initialQuery);
      }
      if (selectedSpiceId) {
        const found = SPICE_ALMANAC.find((s) => s.id === selectedSpiceId);
        if (found) setActiveSpice(found);
      } else if (!activeSpice) {
        setActiveSpice(SPICE_ALMANAC[0]);
      }
    }
  }, [isOpen, initialQuery, selectedSpiceId]);

  if (!isOpen) return null;

  const categories = [
    { id: 'All', label: language === 'en' ? 'All Spices' : 'Semua Rempah' },
    { id: 'Rimpang', label: language === 'en' ? 'Rhizomes' : 'Rimpang' },
    { id: 'Bumbu Kering', label: language === 'en' ? 'Dry Spices' : 'Bumbu Kering' },
    { id: 'Daun & Batang', label: language === 'en' ? 'Leaves & Stems' : 'Daun & Batang' },
    { id: 'Buah & Asam', label: language === 'en' ? 'Fruits & Sours' : 'Buah & Asam' },
    { id: 'Pelengkap', label: language === 'en' ? 'Condiments' : 'Pelengkap' },
  ];

  const filteredSpices = searchSpices(query, selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#FCF9F2] dark:bg-[#1C1410] border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[6px_6px_0px_#2C1E16] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Papan Kitab Rempah */}
        <div className="p-4 sm:p-5 bg-[#EFE4CE] dark:bg-[#2C1E16] border-b-2 border-[#5C3A21] dark:border-[#8C6239] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32] text-white flex items-center justify-center border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-[#2C1E16] dark:text-[#F6EFE2] flex items-center gap-2">
                {language === 'en' ? 'Nusantara Spice Almanac' : 'Kitab Rempah & Substitusi Nusantara'}
              </h2>
              <p className="text-xs text-[#5C3A21] dark:text-[#E2D1B0]">
                {language === 'en'
                  ? 'Curated reference for Indonesian spices, flavor profiles & emergency substitutes'
                  : 'Panduan rempah tradisional, profil rasa & racikan substitusi darurat akurat'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-[#F6EFE2] dark:bg-[#422B1D] text-[#2C1E16] dark:text-[#F6EFE2] hover:bg-[#E2D1B0] border-2 border-[#5C3A21] active:translate-y-0.5 transition-transform"
            aria-label="Tutup Kitab"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 sm:p-4 bg-[#F6EFE2] dark:bg-[#241912] border-b border-[#5C3A21]/30 dark:border-[#8C6239]/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C6239] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Search spice, substitute, or dialect (e.g. kemiri, kluwek, asam)...'
                  : 'Cari nama bumbu, pengganti, atau sebutan daerah (misal: kemiri, laja, kluwek)...'
              }
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#1C1410] border-2 border-[#5C3A21]/60 dark:border-[#8C6239]/80 text-[#2C1E16] dark:text-[#F6EFE2] placeholder-[#8C6239]/60 focus:outline-none focus:border-[#C85A32]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C6239] hover:text-[#2C1E16]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-[#C85A32] text-white border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]'
                    : 'bg-[#EFE4CE] dark:bg-[#2C1E16] text-[#5C3A21] dark:text-[#E2D1B0] border-[#5C3A21]/40 hover:bg-[#E2D1B0]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Body: Master-Detail Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          {/* Left Column: List of Spices */}
          <div className="md:col-span-5 p-3 overflow-y-auto border-b md:border-b-0 md:border-r border-[#5C3A21]/30 dark:border-[#8C6239]/40 space-y-2 max-h-[35vh] md:max-h-[55vh]">
            {filteredSpices.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8C6239]">
                {language === 'en'
                  ? 'No spices match your search query.'
                  : 'Bumbu atau rempah tidak ditemukan dalam kitab.'}
              </div>
            ) : (
              filteredSpices.map((spice) => {
                const isSelected = activeSpice?.id === spice.id;
                return (
                  <button
                    key={spice.id}
                    onClick={() => {
                      playClickSound();
                      setActiveSpice(spice);
                    }}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#EFE4CE] dark:bg-[#422B1D] border-[#C85A32] shadow-[3px_3px_0px_#2C1E16] translate-x-1'
                        : 'bg-white dark:bg-[#241912] border-[#5C3A21]/40 hover:border-[#5C3A21]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-sm text-[#2C1E16] dark:text-[#F6EFE2]">
                          {spice.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4A7C59]/15 text-[#4A7C59] dark:text-[#88C59A] font-bold">
                          {spice.category}
                        </span>
                      </div>
                      {spice.regionalName && (
                        <p className="text-[11px] text-[#8C6239] dark:text-[#D1A67B] italic mt-0.5 line-clamp-1">
                          {spice.regionalName}
                        </p>
                      )}
                    </div>
                    {spice.substitutes.length > 0 && (
                      <span className="text-[10px] bg-[#D99B26]/15 text-[#9E6E12] dark:text-[#E9B858] font-bold px-1.5 py-0.5 rounded shrink-0">
                        {spice.substitutes.length} {language === 'en' ? 'Substitutes' : 'Pengganti'}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed View */}
          <div className="md:col-span-7 p-4 sm:p-6 overflow-y-auto bg-white/60 dark:bg-[#1C1410]/60 space-y-5 max-h-[55vh]">
            {activeSpice ? (
              <>
                {/* Title & Regional Name */}
                <div className="border-b-2 border-[#5C3A21]/20 dark:border-[#8C6239]/30 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-black text-xl sm:text-2xl text-[#2C1E16] dark:text-[#F6EFE2]">
                      {activeSpice.name}
                    </h3>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#C85A32]/10 text-[#C85A32] dark:text-[#E87E58] border border-[#C85A32]/30">
                      {activeSpice.category}
                    </span>
                  </div>
                  {activeSpice.regionalName && (
                    <p className="text-xs text-[#8C6239] dark:text-[#D1A67B] italic mt-1">
                      {language === 'en' ? 'Regional names' : 'Nama daerah / sebutan lain'}:{' '}
                      <span className="font-semibold">{activeSpice.regionalName}</span>
                    </p>
                  )}
                </div>

                {/* Flavor Profile & Culinary Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F6EFE2] dark:bg-[#2C1E16] border border-[#5C3A21]/30">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32] block mb-1">
                      {language === 'en' ? 'Flavor Profile' : 'Profil Rasa & Aroma'}
                    </span>
                    <p className="text-xs text-[#2C1E16] dark:text-[#E2D1B0] leading-relaxed">
                      {activeSpice.flavorProfile}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F6EFE2] dark:bg-[#2C1E16] border border-[#5C3A21]/30">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#4A7C59] block mb-1">
                      {language === 'en' ? 'Culinary Role' : 'Fungsi Masakan'}
                    </span>
                    <p className="text-xs text-[#2C1E16] dark:text-[#E2D1B0] leading-relaxed">
                      {activeSpice.culinaryRole}
                    </p>
                  </div>
                </div>

                {/* Emergency Substitutes Box (High Value RPG Feature) */}
                <div className="p-4 rounded-xl bg-[#EFE4CE] dark:bg-[#241912] border-2 border-[#D99B26] shadow-[3px_3px_0px_#2C1E16] space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#D99B26] text-white flex items-center justify-center font-bold text-xs">
                      ★
                    </div>
                    <h4 className="font-display font-bold text-sm text-[#2C1E16] dark:text-[#F6EFE2]">
                      {language === 'en' ? 'Emergency Substitutes' : 'Kitab Pengganti Darurat'}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {activeSpice.substitutes.map((sub, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white dark:bg-[#1C1410] border border-[#5C3A21]/40 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-[#2C1E16] dark:text-[#F6EFE2]">
                          <span>{sub.name}</span>
                          <span className="font-mono text-[11px] text-[#C85A32] bg-[#C85A32]/10 px-2 py-0.5 rounded">
                            {sub.ratio}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5C3A21] dark:text-[#BFA588]">
                          {sub.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage Tip */}
                <div className="p-3 rounded-xl bg-[#F6EFE2] dark:bg-[#2C1E16] border border-[#5C3A21]/20 flex items-start gap-2.5 text-xs text-[#5C3A21] dark:text-[#D1A67B]">
                  <Archive className="w-4 h-4 text-[#8C6239] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#2C1E16] dark:text-[#F6EFE2] block mb-0.5">
                      {language === 'en' ? 'Kitchen Storage Advice' : 'Petuah Simpan Dapur'}:
                    </span>
                    <p>{activeSpice.storageTip}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-[#8C6239]">
                {language === 'en' ? 'Select a spice to view its secret properties.' : 'Pilih bumbu dari daftar di samping.'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#EFE4CE] dark:bg-[#2C1E16] border-t-2 border-[#5C3A21] dark:border-[#8C6239] flex items-center justify-between text-xs text-[#5C3A21] dark:text-[#E2D1B0] px-4">
          <span className="font-mono text-[11px]">
            {filteredSpices.length} {language === 'en' ? 'spices available' : 'bumbu tercatat'}
          </span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-[#C85A32] text-white font-bold text-xs border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
          >
            {language === 'en' ? 'Close Almanac' : 'Tutup Kitab'}
          </button>
        </div>
      </div>
    </div>
  );
}
