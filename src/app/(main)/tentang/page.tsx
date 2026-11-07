import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChefHat, Globe, Shield, Heart, ArrowRight, Flame } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Resepedia — Ensiklopedi Kuliner Nusantara',
  description:
    'Misi Resepedia dalam melestarikan warisan resep masakan autentik Nusantara dari Sabang sampai Merauke.',
};

export default function TentangPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Hero Mission */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Warisan Rasa Nusantara</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          Menjaga Autentisitas Kuliner Nusantara Tetap Hidup
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Resepedia lahir dari kepedulian terhadap resep masakan tradisional daerah Indonesia yang sarat rempah, cerita, dan kehangatan keluarga di setiap piringnya.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
            Teknologi Ramah Dapur
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Menghadirkan fitur interaktif seperti <em>Zen Cook Mode</em> yang membacakan langkah memasak dengan audio bebas genggam, timer masak, dan kalkulator porsi dinamis.
          </p>
        </div>
      </div>

      {/* Community Banner */}
      <div className="bg-surface-container-low dark:bg-zinc-900/60 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
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
          className="w-full sm:w-auto text-center px-6 py-3 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary-container shadow-md shadow-primary/20 transition-transform active:scale-95 shrink-0"
        >
          Tulis Resep Sekarang
        </Link>
      </div>
    </div>
  );
}
