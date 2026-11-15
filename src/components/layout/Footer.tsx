'use client';

import React from 'react';
import Link from 'next/link';
import { ChefHat } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="mt-20 border-t-2 border-[#5C3A21]/20 dark:border-[#8C6239]/30 bg-[#FCF9F2] dark:bg-[#1C1410] pb-28 md:pb-14 pt-12 sm:pt-16 text-[#5C3A21] dark:text-[#D9C8AA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand & Mission */}
          <div className="space-y-4 sm:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-black text-2xl tracking-tight text-[#2C1E16] dark:text-[#F6EFE2] block leading-none">
                  Resepedia
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C85A32] dark:text-[#E26E45]">
                  {language === 'en' ? 'Archipelago Tavern & Grimoire' : 'Kedai & Kitab Kuliner Nusantara'}
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed max-w-md text-[#5C3A21] dark:text-[#D9C8AA]">
              {language === 'en'
                ? 'Authentic Indonesian culinary recipe grimoire, equipped with traditional Spice Almanac, hearth hands-free cooking mode, and portion scaler.'
                : 'Ensiklopedi resep masakan Nusantara autentik, dilengkapi Kitab Rahasia Rempah & Substitusi, mode perapian bebas genggam, dan takaran porsi terukur.'}
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A7C59] dark:text-[#88C59A]">
              <ChefHat className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? 'Curated by archipelago culinary guild & home cooks'
                  : 'Dikelola oleh serikat koki rumahan & penjaga warisan nusantara'}
              </span>
            </div>
          </div>

          {/* Navigasi Kuliner */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#2C1E16] dark:text-[#F6EFE2] border-b border-[#5C3A21]/20 pb-1">
              {language === 'en' ? 'Archipelago Regions' : 'Kepulauan Citarasa'}
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/eksplorasi?region=Sumatra" className="hover:text-[#C85A32] transition-colors">
                  Sumatra (Rendang, Gulai)
                </Link>
              </li>
              <li>
                <Link href="/eksplorasi?region=Jawa" className="hover:text-[#C85A32] transition-colors">
                  Jawa (Gudeg, Rawon, Soto)
                </Link>
              </li>
              <li>
                <Link href="/eksplorasi?region=Bali" className="hover:text-[#C85A32] transition-colors">
                  Bali & Nusa Tenggara
                </Link>
              </li>
              <li>
                <Link href="/eksplorasi?region=Sulawesi" className="hover:text-[#C85A32] transition-colors">
                  Sulawesi (Coto, Woku, Konro)
                </Link>
              </li>
              <li>
                <Link href="/eksplorasi?region=Kalimantan" className="hover:text-[#C85A32] transition-colors">
                  Kalimantan & Papua
                </Link>
              </li>
            </ul>
          </div>

          {/* Fitur & Pintasan */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#2C1E16] dark:text-[#F6EFE2] border-b border-[#5C3A21]/20 pb-1">
              {language === 'en' ? 'Grimoire Features' : 'Fitur & Pintasan'}
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/eksplorasi" className="hover:text-[#C85A32] transition-colors">
                  {language === 'en' ? 'Archipelago Catalog' : 'Eksplorasi Semua Resep'}
                </Link>
              </li>
              <li>
                <Link href="/resep/tambah" className="hover:text-[#C85A32] transition-colors">
                  {t('Tulis Resep')}
                </Link>
              </li>
              <li>
                <Link href="/belanja" className="hover:text-[#C85A32] transition-colors">
                  {t('Daftar Belanja')}
                </Link>
              </li>
              <li>
                <Link href="/koleksi" className="hover:text-[#C85A32] transition-colors">
                  {t('Koleksi')}
                </Link>
              </li>
              <li>
                <Link href="/profil" className="hover:text-[#C85A32] transition-colors">
                  {t('Pengaturan & Preferensi')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-[#5C3A21]/20 dark:border-[#8C6239]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C6239] dark:text-[#D1A67B] gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Resepedia. {language === 'en' ? 'Crafted with love for Indonesian culinary heritage 🇮🇩' : 'Dibuat dengan cinta untuk pusaka kuliner Nusantara 🇮🇩'}</p>
          <p className="flex items-center gap-1.5 font-bold">
            {language === 'en' ? '100% Handcrafted • Offline-First • Zero AI Slop' : '100% Buatan Tangan • Offline-First • Ramah Dapur'}
          </p>
        </div>
      </div>
    </footer>
  );
}
