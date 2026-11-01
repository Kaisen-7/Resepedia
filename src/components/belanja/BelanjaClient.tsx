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
  ChevronLeft,
  ArrowRight,
  Wifi,
} from 'lucide-react';
import { ShoppingItem } from '@/types';
import {
  addShoppingItemAction,
  toggleCheckShoppingItemAction,
  deleteShoppingItemAction,
  clearCheckedItemsAction,
} from '@/actions/shopping.actions';
import { subscribeShoppingItems } from '@/lib/firebase/service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface BelanjaClientProps {
  initialItems: ShoppingItem[];
}

export default function BelanjaClient({ initialItems }: BelanjaClientProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [customName, setCustomName] = useState('');
  const [customDetail, setCustomDetail] = useState('');
  const [isRealtime, setIsRealtime] = useState(false);

  // Real-time Firestore onSnapshot listener when user is logged in
  useEffect(() => {
    if (user?.uid) {
      setIsRealtime(true);
      const unsubscribe = subscribeShoppingItems(user.uid, (cloudItems) => {
        setItems(cloudItems);
      });
      return () => unsubscribe();
    } else {
      setIsRealtime(false);
      const saved = localStorage.getItem('guest_shopping_items');
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {}
      }
    }
  }, [user]);

  const saveGuestItems = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    localStorage.setItem('guest_shopping_items', JSON.stringify(newItems));
  };

  const handleToggleCheck = async (item: ShoppingItem) => {
    const updated = items.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i));
    setItems(updated);

    if (user?.uid) {
      await toggleCheckShoppingItemAction(item.id, item.checked, user.uid);
    } else {
      saveGuestItems(updated);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);

    if (user?.uid) {
      await deleteShoppingItemAction(id, user.uid);
    } else {
      saveGuestItems(updated);
    }
    toast.info('Item dihapus dari daftar belanja');
  };

  const handleClearChecked = async () => {
    const updated = items.filter((i) => !i.checked);
    setItems(updated);

    if (user?.uid) {
      await clearCheckedItemsAction(user.uid);
    } else {
      saveGuestItems(updated);
    }
    toast.success('Bahan yang sudah dibeli berhasil dibersihkan');
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    if (user?.uid) {
      const res = await addShoppingItemAction(
        customName.trim(),
        customDetail.trim(),
        'Catatan Pribadi',
        user.uid
      );
      if (res.success && res.item) {
        setCustomName('');
        setCustomDetail('');
        toast.success(`Ditambahkan: ${customName}`);
      }
    } else {
      const newItem: ShoppingItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: customName.trim(),
        detail: customDetail.trim(),
        checked: false,
        recipeTitle: 'Catatan Pribadi',
        createdAt: Date.now(),
      };
      saveGuestItems([...items, newItem]);
      setCustomName('');
      setCustomDetail('');
      toast.success(`Ditambahkan: ${newItem.name}`);
    }
  };

  // Group items by recipeTitle
  const groups = useMemo(() => {
    const map: Record<string, ShoppingItem[]> = {};
    items.forEach((item) => {
      const title = item.recipeTitle || 'Catatan Pribadi';
      if (!map[title]) map[title] = [];
      map[title].push(item);
    });
    return Object.entries(map).map(([title, list]) => {
      const total = list.length;
      const checked = list.filter((i) => i.checked).length;
      const isComplete = total > 0 && checked === total;
      return { title, list, total, checked, isComplete };
    });
  }, [items]);

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
            Daftar Belanja Pasar
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {totalAllItems > 0
              ? `${totalChecked} dari ${totalAllItems} bahan telah dibeli`
              : 'Daftar belanja Anda masih kosong.'}
          </p>
        </div>

        {totalChecked > 0 && (
          <button
            onClick={handleClearChecked}
            className="px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-xs font-bold text-zinc-600 dark:text-zinc-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" /> Bersihkan yang Selesai ({totalChecked})
          </button>
        )}
      </div>

      {/* Quick Add Custom Item Form */}
      <form
        onSubmit={handleAddCustom}
        className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center gap-2"
      >
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Nama bahan tambahan (misal: Minyak Goreng, Garam)..."
          className="w-full sm:flex-1 px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          value={customDetail}
          onChange={(e) => setCustomDetail(e.target.value)}
          placeholder="Takaran (1 liter, 2 ikat)..."
          className="w-full sm:w-48 px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!customName.trim()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary-container disabled:opacity-40 transition-transform active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </form>

      {/* Grouped Shopping Lists */}
      {groups.length > 0 ? (
        <div className="space-y-6">
          {groups.map((group, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-5 sm:p-6 border transition-all ${
                group.isComplete
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                      group.isComplete
                        ? 'bg-emerald-500 text-white'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {group.isComplete ? '✓' : idx + 1}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                      {group.title}
                    </h3>
                    <span className="text-[11px] text-zinc-500">
                      {group.checked}/{group.total} bahan selesai
                    </span>
                  </div>
                </div>

                {group.isComplete && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Siap Masak!
                  </span>
                )}
              </div>

              <ul className="space-y-2.5">
                {group.list.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <button
                      onClick={() => handleToggleCheck(item)}
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      {item.checked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                      )}
                      <div>
                        <span
                          className={`text-sm font-semibold transition-all ${
                            item.checked
                              ? 'line-through text-zinc-400 dark:text-zinc-500'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.detail && (
                          <span className="text-xs text-zinc-400 block font-mono">
                            {item.detail}
                          </span>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors rounded-lg"
                      title="Hapus bahan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
            Daftar Belanja Kosong
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
            Pilih resep masakan yang ingin Anda buat, lalu tekan tombol <strong>"Masukkan ke Daftar Belanja"</strong> pada halaman resep.
          </p>
          <Link
            href="/eksplorasi"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container"
          >
            Eksplorasi Resep <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
