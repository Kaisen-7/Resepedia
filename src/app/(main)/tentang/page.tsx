import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChefHat, Globe, Shield, Sparkles, Heart, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Resepedia — Misi Pelestarian Kuliner Nusantara',
  description:
    'Mengenal misi Resepedia dalam melestarikan resep tradisional autentik Indonesia dengan teknologi web modern.',
};

export default function TentangPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
          <ChefHat className="w-8 h-8" />
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100 tracking-tight">
          Menjaga Warisan Rasa Nusantara
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Resepedia lahir dari kepedulian terhadap ribuan resep tradisional Indonesia yang perlahan terlupakan. Kami menggabungkan kekayaan rempah kepulauan dengan inovasi kecerdasan buatan modern.
        </p>
      </div>

      {/* Grid Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
            Pelestarian Autentik
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Mendokumentasikan resep dari Sabang sampai Merauke secara terperinci—mulai dari peran setiap bumbu aromatik, takaran porsi, hingga teknik pengolahan lambat khas nenek moyang.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
            Teknologi Ramah Dapur
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Menghadirkan fitur interaktif seperti <em>Zen Cook Mode</em> yang membacakan langkah memasak dengan audio, <em>Cooking Timer Synthesizer</em>, dan kalkulator porsi dinamis.
          </p>
        </div>
      </div>

      {/* Community Banner */}
      <div className="bg-surface-container-low dark:bg-zinc-900/60 rounded-3xl p-8 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h4 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
            Bergabunglah Menjadi Kontributor Resepedia
          </h4>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg leading-relaxed">
            Bagikan resep khas daerahmu atau kreasi hidangan keluarga yang paling dicintai ke jutaan masyarakat Indonesia.
          </p>
        </div>

        <Link
          href="/resep/tambah"
          className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary-container shadow-md shadow-primary/20 transition-transform active:scale-95 shrink-0"
        >
          Tulis Resep Sekarang
        </Link>
      </div>
    </div>
  );
}
