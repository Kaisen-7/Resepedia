'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ListChecks,
  ArrowRight,
  Store,
  Scroll,
} from 'lucide-react';
import { ShoppingItem } from '@/types';
import {
  getLocalShoppingItems,
  saveLocalShoppingItems,
  addShoppingItem,
  toggleCheckShoppingItem,
  deleteShoppingItem,
  clearCheckedShoppingItems,
} from '@/lib/utils/shopping-storage';
import { subscribeShoppingItems } from '@/lib/firebase/service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { playClickSound, playChimeSound } from '@/lib/utils/sound-effects';

interface BelanjaClientProps {
  initialItems: ShoppingItem[];
}

export default function BelanjaClient({ initialItems }: BelanjaClientProps) {
  const { user } = useAuth();
  const toast = useToast();
  const { t, language } = useLanguage();
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [customName, setCustomName] = useState('');
  const [customDetail, setCustomDetail] = useState('');
  const [viewMode, setViewMode] = useState<'recipe' | 'market'>('recipe');

  // Load from local storage and sync with Firestore
  useEffect(() => {
    const local = getLocalShoppingItems(user?.uid);
    if (local.length > 0) {
      setItems(local);
    }

    const handleShoppingUpdated = () => {
      setItems(getLocalShoppingItems(user?.uid));
    };

    window.addEventListener('shopping-list-updated', handleShoppingUpdated);

    let unsubscribeFirestore: (() => void) | null = null;
    if (user?.uid) {
      unsubscribeFirestore = subscribeShoppingItems(user.uid, (cloudItems) => {
        if (cloudItems && cloudItems.length > 0) {
          setItems(cloudItems);
          saveLocalShoppingItems(cloudItems, user.uid);
        }
      });
    }

    return () => {
      window.removeEventListener('shopping-list-updated', handleShoppingUpdated);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [user]);

  const handleToggleCheck = async (item: ShoppingItem) => {
    const nextChecked = !item.checked;
    if (nextChecked) playChimeSound();
    else playClickSound();

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: nextChecked } : i))
    );
    await toggleCheckShoppingItem(item.id, item.checked, user?.uid);
  };

  const handleDeleteItem = async (id: string) => {
    playClickSound();
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteShoppingItem(id, user?.uid);
    toast.info(
      language === 'en'
        ? 'Item removed from shopping basket'
        : 'Bahan dihapus dari bakul belanja'
    );
  };

  const handleClearChecked = async () => {
    playClickSound();
    setItems((prev) => prev.filter((i) => !i.checked));
    await clearCheckedShoppingItems(user?.uid);
    toast.success(
      language === 'en'
        ? 'Purchased items cleared'
        : 'Bahan yang sudah dibeli berhasil dibersihkan'
    );
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    playClickSound();
    const newItem = await addShoppingItem(
      customName.trim(),
      customDetail.trim(),
      t('Catatan Pribadi'),
      user?.uid
    );

    setItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
    setCustomName('');
    setCustomDetail('');
    toast.success(
      language === 'en' ? `Added: ${newItem.name}` : `Ditambahkan: ${newItem.name}`
    );
  };

  // Group items by recipeTitle
  const recipeGroups = useMemo(() => {
    const map: Record<string, ShoppingItem[]> = {};
    items.forEach((item) => {
      const title = item.recipeTitle || t('Catatan Pribadi');
      if (!map[title]) map[title] = [];
      map[title].push(item);
    });
    return Object.entries(map).map(([title, list]) => {
      const total = list.length;
      const checked = list.filter((i) => i.checked).length;
      const isComplete = total > 0 && checked === total;
      return { title, list, total, checked, isComplete };
    });
  }, [items, t]);

  // Group items by Traditional Market Stalls (Lapak Pasar)
  const marketStallGroups = useMemo(() => {
    const stalls: Record<string, ShoppingItem[]> = {
      [language === 'en' ? '🌿 Herbs & Spices Stall' : '🌿 Lapak Rimpang & Bumbu']: [],
      [language === 'en' ? '🥬 Vegetables & Greens Stall' : '🥬 Lapak Sayur & Daun']: [],
      [language === 'en' ? '🥩 Meat & Seafood Stall' : '🥩 Lapak Daging & Hasil Laut']: [],
      [language === 'en' ? '🥥 Coconut & Pantry Essentials' : '🥥 Warung Sembako & Santan']: [],
    };

    const spiceKeywords = [
      'bawang', 'kunyit', 'jahe', 'lengkuas', 'laja', 'serai', 'daun salam',
      'daun jeruk', 'kemiri', 'ketumbar', 'merica', 'cabai', 'kluwek',
      'kencur', 'pala', 'cengkeh', 'terasi', 'asam', 'jinten', 'kapulaga',
    ];
    const vegKeywords = [
      'kangkung', 'bayam', 'kol', 'wortel', 'buncis', 'kacang', 'labu',
      'tauge', 'seledri', 'daun bawang', 'timun', 'tomat', 'nangka', 'petai',
      'terong', 'singkong', 'kentang',
    ];
    const meatKeywords = [
      'ayam', 'sapi', 'daging', 'ikan', 'udang', 'cumi', 'iga', 'buntut',
      'kambing', 'telur', 'bebek',
    ];

    items.forEach((item) => {
      const lower = item.name.toLowerCase();
      if (spiceKeywords.some((k) => lower.includes(k))) {
        stalls[language === 'en' ? '🌿 Herbs & Spices Stall' : '🌿 Lapak Rimpang & Bumbu'].push(item);
      } else if (vegKeywords.some((k) => lower.includes(k))) {
        stalls[language === 'en' ? '🥬 Vegetables & Greens Stall' : '🥬 Lapak Sayur & Daun'].push(item);
      } else if (meatKeywords.some((k) => lower.includes(k))) {
        stalls[language === 'en' ? '🥩 Meat & Seafood Stall' : '🥩 Lapak Daging & Hasil Laut'].push(item);
      } else {
        stalls[language === 'en' ? '🥥 Coconut & Pantry Essentials' : '🥥 Warung Sembako & Santan'].push(item);
      }
    });

    return Object.entries(stalls)
      .filter(([_, list]) => list.length > 0)
      .map(([title, list]) => {
        const total = list.length;
        const checked = list.filter((i) => i.checked).length;
        const isComplete = total > 0 && checked === total;
        return { title, list, total, checked, isComplete };
      });
  }, [items, language]);

  const activeGroups = viewMode === 'recipe' ? recipeGroups : marketStallGroups;
  const totalAllItems = items.length;
  const totalChecked = items.filter((i) => i.checked).length;
  const progressPercent =
    totalAllItems > 0 ? Math.round((totalChecked / totalAllItems) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-28 md:pb-16 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#5C3A21]/20 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#C85A32] text-white flex items-center justify-center border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#2C1E16] dark:text-[#F6EFE2]">
              {language === 'en' ? 'Archipelago Market Basket' : 'Bakul Belanja Pasar'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] mt-1">
            {language === 'en'
              ? 'Organized checklist for your trip to traditional market stalls'
              : 'Daftar belanja taktis yang otomatis terkumpul dari gulungan resep Anda'}
          </p>
        </div>

        {totalChecked > 0 && (
          <button
            onClick={handleClearChecked}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#EFE4CE] dark:bg-[#2C1E16] hover:bg-[#B83B2B] hover:text-white text-[#B83B2B] border-2 border-[#5C3A21]/40 text-xs font-black shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5 transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {language === 'en'
                ? `Clear (${totalChecked}) Bought`
                : `Hapus (${totalChecked}) Terbeli`}
            </span>
          </button>
        )}
      </div>

      {/* Progress & Stalls View Switch */}
      <div className="bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl p-4 sm:p-5 border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[4px_4px_0px_#2C1E16] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-bold text-[#2C1E16] dark:text-[#F6EFE2]">
            {language === 'en' ? 'Basket Progress' : 'Kesiapan Belanja'}:{' '}
            <span className="font-mono text-[#C85A32]">
              {totalChecked} / {totalAllItems} {language === 'en' ? 'Items' : 'Bahan'}
            </span>
          </span>
          <span className="font-mono font-black text-xs text-[#4A7C59]">
            {progressPercent}%
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-[#EFE4CE] dark:bg-[#1C1410] border border-[#5C3A21]/30 overflow-hidden">
          <div
            className="h-full bg-[#4A7C59] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* View Mode Toggle: Per Recipe vs Per Market Stall */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-[#5C3A21]/20">
          <span className="text-[11px] font-bold text-[#5C3A21] dark:text-[#D9C8AA]">
            {language === 'en' ? 'Grouping Mode' : 'Mode Tampilan'}:
          </span>
          <div className="flex items-center gap-1.5 bg-[#EFE4CE] dark:bg-[#1C1410] p-1 rounded-xl border border-[#5C3A21]/40 w-full sm:w-auto">
            <button
              onClick={() => {
                playClickSound();
                setViewMode('recipe');
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'recipe'
                  ? 'bg-[#C85A32] text-white border border-[#2C1E16] shadow-[1px_1px_0px_#2C1E16]'
                  : 'text-[#5C3A21] dark:text-[#D9C8AA]'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'By Recipe' : 'Per Gulungan'}</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setViewMode('market');
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'market'
                  ? 'bg-[#C85A32] text-white border border-[#2C1E16] shadow-[1px_1px_0px_#2C1E16]'
                  : 'text-[#5C3A21] dark:text-[#D9C8AA]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'By Market Stall' : 'Lapak Pasar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Ingredient Form */}
      <form
        onSubmit={handleAddCustom}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-2 border-[#5C3A21]/40 shadow-[3px_3px_0px_#2C1E16]"
      >
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder={
            language === 'en'
              ? 'Add extra item (e.g. eggs, frying oil)...'
              : 'Tambah bahan tambahan (misal: telur, minyak goreng)...'
          }
          className="flex-1 w-full bg-[#EFE4CE]/50 dark:bg-[#1C1410] px-3 py-2 rounded-xl text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] placeholder-[#8C6239]/60 border border-[#5C3A21]/30 focus:outline-none focus:border-[#C85A32]"
        />
        <input
          type="text"
          value={customDetail}
          onChange={(e) => setCustomDetail(e.target.value)}
          placeholder={
            language === 'en' ? 'Amount (e.g. 1 kg)' : 'Jumlah (misal: 1 kg)'
          }
          className="w-full sm:w-36 bg-[#EFE4CE]/50 dark:bg-[#1C1410] px-3 py-2 rounded-xl text-xs sm:text-sm text-[#2C1E16] dark:text-[#F6EFE2] placeholder-[#8C6239]/60 border border-[#5C3A21]/30 focus:outline-none focus:border-[#C85A32]"
        />
        <button
          type="submit"
          disabled={!customName.trim()}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#A64422] disabled:opacity-40 border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5 flex items-center justify-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('Tambah')}</span>
        </button>
      </form>

      {/* Grouped Shopping Lists */}
      {totalAllItems > 0 ? (
        <div className="space-y-5 sm:space-y-6">
          {activeGroups.map((group, gIdx) => (
            <div
              key={gIdx}
              className="bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-[3px] border-[#5C3A21] dark:border-[#8C6239] shadow-[4px_4px_0px_#2C1E16] overflow-hidden"
            >
              <div className="p-3.5 sm:p-4 bg-[#EFE4CE] dark:bg-[#2C1E16] border-b-2 border-[#5C3A21]/40 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-display font-black text-xs sm:text-base text-[#2C1E16] dark:text-[#F6EFE2] truncate">
                    {group.title}
                  </h3>
                  {group.isComplete && (
                    <span className="px-2 py-0.5 rounded-md bg-[#4A7C59] text-white text-[10px] font-black border border-[#2C1E16] shrink-0">
                      ✓ {language === 'en' ? 'Complete' : 'Lengkap'}
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-[#8C6239] shrink-0 ml-2">
                  {group.checked}/{group.total}
                </span>
              </div>

              <div className="p-2 sm:p-4 divide-y divide-[#5C3A21]/15">
                {group.list.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleCheck(item)}
                    className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-[#EFE4CE]/50 dark:hover:bg-[#2C1E16]/50 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        aria-label="Tandai bahan"
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                          item.checked
                            ? 'bg-[#4A7C59] border-[#2C1E16] text-white'
                            : 'bg-white dark:bg-[#2C1E16] border-[#5C3A21]/50 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-xs sm:text-sm font-bold block truncate ${
                            item.checked
                              ? 'line-through text-[#8C6239] opacity-60'
                              : 'text-[#2C1E16] dark:text-[#F6EFE2]'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.detail && (
                          <span className="text-[11px] font-mono text-[#C85A32] block truncate">
                            {item.detail}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1.5 text-[#8C6239] hover:text-[#B83B2B] transition-colors shrink-0"
                      title={language === 'en' ? 'Delete' : 'Hapus'}
                      aria-label="Hapus bahan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sm:py-20 px-4 bg-[#FCF9F2] dark:bg-[#241912] rounded-2xl border-[3px] border-dashed border-[#5C3A21]/40 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#EFE4CE] text-[#C85A32] flex items-center justify-center mx-auto border border-[#5C3A21]/30">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base sm:text-lg text-[#2C1E16] dark:text-[#F6EFE2]">
            {language === 'en' ? 'Market basket is empty' : 'Bakul belanja Anda masih kosong'}
          </h3>
          <p className="text-xs text-[#5C3A21] dark:text-[#D9C8AA] max-w-sm mx-auto leading-relaxed">
            {language === 'en'
              ? 'Add ingredients from recipe scroll details to build your traditional market list.'
              : 'Buka lembar resep apa pun dan klik "Masukkan Semua ke Daftar Belanja" untuk mencatat bahan masakan.'}
          </p>
          <Link
            href="/eksplorasi"
            onClick={() => playClickSound()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C85A32] text-white font-black text-xs border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] active:translate-y-0.5"
          >
            <span>{language === 'en' ? 'Explore Recipe Scrolls' : 'Jelajahi Gulungan Resep'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
