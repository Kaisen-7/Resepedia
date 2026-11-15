'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Compass, Feather, ShoppingBag, BookOpen } from 'lucide-react';
import { playClickSound } from '@/lib/utils/sound-effects';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();

  const tabs = [
    {
      label: language === 'en' ? 'Tavern' : 'Kedai',
      href: '/',
      icon: Home,
    },
    {
      label: language === 'en' ? 'Map' : 'Peta',
      href: '/eksplorasi',
      icon: Compass,
    },
    {
      label: language === 'en' ? 'Craft' : 'Tulis',
      href: '/resep/tambah',
      icon: Feather,
      isAction: true,
    },
    {
      label: language === 'en' ? 'Basket' : 'Bakul',
      href: '/belanja',
      icon: ShoppingBag,
    },
    {
      label: language === 'en' ? 'Grimoire' : 'Buku',
      href: '/profil',
      icon: BookOpen,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F6EFE2]/95 dark:bg-[#1C1410]/95 backdrop-blur-md border-t-2 border-[#5C3A21]/40 dark:border-[#8C6239]/50 px-2 py-1 shadow-[0px_-4px_0px_rgba(44,30,22,0.06)] pb-[max(env(safe-area-inset-bottom),0.35rem)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab, idx) => {
          const isActive = pathname === tab.href;

          if (tab.isAction) {
            return (
              <Link
                key={idx}
                href={tab.href}
                onClick={() => playClickSound()}
                className="flex flex-col items-center justify-center -mt-5 group"
                title="Tulis Resep Masakan Baru"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16] transition-transform active:translate-y-0.5 group-hover:scale-105">
                  <Feather className="w-5 h-5 stroke-2" />
                </div>
                <span className="text-[10px] font-black text-[#C85A32] mt-0.5">
                  {tab.label}
                </span>
              </Link>
            );
          }

          const Icon = tab.icon;

          return (
            <Link
              key={idx}
              href={tab.href}
              onClick={() => playClickSound()}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                isActive
                  ? 'text-[#C85A32] bg-[#EFE4CE] dark:bg-[#2C1E16] border border-[#5C3A21]/30 font-black'
                  : 'text-[#5C3A21] dark:text-[#D9C8AA] hover:text-[#2C1E16]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-3' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
