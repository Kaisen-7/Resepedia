'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, ShoppingBag, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Eksplorasi', href: '/eksplorasi', icon: Compass },
    { label: 'Tulis', href: '/resep/tambah', icon: Plus, isAction: true },
    { label: 'Belanja', href: '/belanja', icon: ShoppingBag },
    { label: 'Profil', href: '/profil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 py-1 shadow-lg pb-[max(env(safe-area-inset-bottom),0.35rem)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab, idx) => {
          const isActive = pathname === tab.href;

          if (tab.isAction) {
            return (
              <Link
                key={idx}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-5 group"
                title="Tulis Resep Masakan Baru"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 transition-transform active:scale-90 group-hover:scale-105 border-2 border-white dark:border-zinc-900">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black text-primary mt-0.5">Tulis Resep</span>
              </Link>
            );
          }

          const Icon = tab.icon;

          return (
            <Link
              key={idx}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-black' : 'font-semibold'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
