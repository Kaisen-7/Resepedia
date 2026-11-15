import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChefHat, Globe, Shield, Heart, ArrowRight, Flame, Scroll, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Resepedia — Ensiklopedi Kuliner Nusantara',
  description:
    'Misi Resepedia dalam melestarikan warisan resep masakan autentik Nusantara dari Sabang sampai Merauke.',
};

export default function TentangPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 pb-28 md:pb-16 space-y-10 sm:space-y-12">
      {/* Hero Mission */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE4CE] dark:bg-[#3D291D] text-[#8C2D19] dark:text-[#E26E45] border-2 border-[#5C3A21] shadow-[2px_2px_0px_#2C1E16] text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Warisan Rasa Nusantara</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-[#2C1E16] dark:text-[#F6EFE2] tracking-tight leading-tight">
          Menjaga Autentisitas Kuliner Nusantara Tetap Hidup
        </h1>
        <p className="text-sm sm:text-base text-[#5C3A21] dark:text-[#D9C8AA] max-w-2xl mx-auto leading-relaxed">
          Resepedia lahir dari kecintaan mendalam pada pusaka kuliner tradisional Indonesia yang kaya rempah, kaya filosofi, dan penuh kehangatan persaudaraan.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div className="p-6 sm:p-8 bg-[#FCF9F2] dark:bg-[#342419] rounded-3xl border-[3px] border-[#5C3A21] shadow-[5px_5px_0px_#2C1E16] space-y-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-[#2C1E16] dark:text-[#F6EFE2]">
            Pelestarian Autentik
          </h3>
          <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] leading-relaxed">
            Mendokumentasikan resep dari Sabang sampai Merauke secara terperinci—mulai dari peran setiap bumbu aromatik, takaran porsi, hingga teknik pengolahan lambat khas warisan leluhur.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-[#FCF9F2] dark:bg-[#342419] rounded-3xl border-[3px] border-[#5C3A21] shadow-[5px_5px_0px_#2C1E16] space-y-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#4A7C59] text-white flex items-center justify-center border-2 border-[#2C1E16] shadow-[2px_2px_0px_#2C1E16]">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-[#2C1E16] dark:text-[#F6EFE2]">
            Teknologi Ramah Dapur
          </h3>
          <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] leading-relaxed">
            Menghadirkan fitur interaktif seperti <em>Zen Cook Mode</em> yang membacakan langkah memasak dengan audio bebas genggam, timer masak serbaguna, kalkulator porsi dinamis, dan Kitab Rempah.
          </p>
        </div>
      </div>

      {/* Community Banner */}
      <div className="bg-[#EFE4CE] dark:bg-[#2C1E16] rounded-3xl p-6 sm:p-8 border-[3px] border-[#5C3A21] shadow-[5px_5px_0px_#2C1E16] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-black uppercase text-[#8C2D19] dark:text-[#E26E45]">
            <Sparkles className="w-4 h-4" />
            <span>Seruan Pahlawan Kuliner</span>
          </div>
          <h4 className="font-display font-bold text-xl text-[#2C1E16] dark:text-[#F6EFE2]">
            Bergabunglah Menjadi Kontributor Resepedia
          </h4>
          <p className="text-xs sm:text-sm text-[#5C3A21] dark:text-[#D9C8AA] max-w-lg leading-relaxed">
            Bagikan resep khas daerahmu atau kreasi hidangan keluarga yang paling dicintai ke segenap penjelajah rasa Nusantara.
          </p>
        </div>

        <Link
          href="/resep/tambah"
          className="w-full sm:w-auto text-center px-6 py-3 rounded-2xl bg-[#C85A32] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#2C1E16] shadow-[3px_3px_0px_#2C1E16] hover:bg-[#A34321] transition-transform active:scale-95 shrink-0"
        >
          Tulis Resep Sekarang
        </Link>
      </div>
    </div>
  );
}
