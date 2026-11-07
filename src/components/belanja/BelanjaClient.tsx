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
  Wifi,
} from 'lucide-react';
import { ShoppingItem } from '@/types';
import {
  getLocalShoppingItems,
  addShoppingItem,
  toggleCheckShoppingItem,
  deleteShoppingItem,
  clearCheckedShoppingItems,
} from '@/lib/utils/shopping-storage';
import { subscribeShoppingItems } from '@/lib/firebase/service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const [isRealtime, setIsRealtime] = useState(false);

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
      setIsRealtime(true);
      unsubscribeFirestore = subscribeShoppingItems(user.uid, (cloudItems) => {
        if (cloudItems && cloudItems.length > 0) {
          setItems(cloudItems);
        }
      });
    } else {
      setIsRealtime(false);
    }

    return () => {
      window.removeEventListener('shopping-list-updated', handleShoppingUpdated);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [user]);

  const handleToggleCheck = async (item: ShoppingItem) => {
    const nextChecked = !item.checked;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: nextChecked } : i))
    );
    await toggleCheckShoppingItem(item.id, item.checked, user?.uid);
  };

  const handleDeleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteShoppingItem(id, user?.uid);
    toast.info(
      language === 'en'
        ? 'Item removed from shopping list'
        : 'Item dihapus dari daftar belanja'
    );
  };

  const handleClearChecked = async () => {
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
  const groups = useMemo(() => {
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

  const totalAllItems = items.length;
  const totalChecked = items.filter((i) => i.checked).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" /> Market Assistant
            {isRealtime && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50">
                <Wifi className="w-3 h-3" /> Real-time Cloud Sync
              </span>
            )}
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
            {t('Daftar Belanja Pasar')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {totalAllItems > 0
              ? `${totalChecked} / ${totalAllItems} ${t('bahan telah dibeli')}`
              : t('Daftar belanja Anda masih kosong.')}
          </p>
        </div>

        {totalChecked > 0 && (
          <button
            onClick={handleClearChecked}
            className="px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-xs font-bold text-zinc-600 dark:text-zinc-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" /> {t('Bersihkan yang Selesai')} ({totalChecked})
          </button>
        )}
      </div>

      {/* Quick Add Custom Item Form */}
      <form
        onSubmit={handleAddCustom}
        className="bg-white dark:bg-zinc-900 p-3.5 sm:p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder={t('Nama bahan tambahan (misal: Minyak Goreng, Garam)...')}
          className="w-full sm:flex-1 px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customDetail}
            onChange={(e) => setCustomDetail(e.target.value)}
            placeholder={t('Takaran (1 liter, 2 ikat)...')}
            className="flex-1 sm:w-48 px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> {t('Tambah Bahan')}
          </button>
        </div>
      </form>

      {/* Items List grouped by recipe */}
      {groups.length > 0 ? (
        <div className="space-y-6">
          {groups.map((group, gIdx) => (
            <div
              key={gIdx}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {group.title}
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-400">
                  {group.checked}/{group.total}
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {group.list.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleCheck(item)}
                    className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.checked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 shrink-0 group-hover:text-primary transition-colors" />
                      )}
                      <div className="min-w-0">
                        <span
                          className={`text-sm block truncate transition-all ${
                            item.checked
                              ? 'line-through text-zinc-400 dark:text-zinc-500 font-normal'
                              : 'text-zinc-800 dark:text-zinc-200 font-semibold'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.detail && (
                          <span className="text-xs text-zinc-400 block truncate">
                            {item.detail}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                      title={language === 'en' ? 'Delete item' : 'Hapus bahan'}
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
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ListChecks className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
            {t('Daftar belanja Anda masih kosong.')}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            {language === 'en'
              ? 'Add ingredients from recipe detail pages or type above to create your market shopping list.'
              : 'Tambahkan bahan dari halaman detail resep atau ketik di atas untuk membuat catatan belanja pasar Anda.'}
          </p>
          <Link
            href="/eksplorasi"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-sm"
          >
            {t('Jelajahi Resep Sekarang')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
