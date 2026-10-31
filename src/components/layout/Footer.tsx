import React from 'react';
import Link from 'next/link';
import { ChefHat, Heart, Globe, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-surface-container-low dark:bg-zinc-950 pb-24 md:pb-12 pt-14 text-on-surface-variant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-on-surface">
                Resepedia
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-md text-zinc-600 dark:text-zinc-400">
              Ensiklopedi resep masakan Nusantara dan dunia yang interaktif, dilengkapi kecerdasan buatan Chef AI, mode memasak bebas genggam, dan kalkulator porsi presisi.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Sparkles className="w-4 h-4" />
              <span>Didukung oleh Google Gemini 2.5 Flash</span>
            </div>
          </div>

          {/* Navigasi Kuliner */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-on-surface">
              Jelajah Wilayah
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/eksplorasi?region=Sumatra" className="hover:text-primary transition-colors">
                  Sumatra (Rendang, Gulai)
                </Link>
              </li>
              <li>
                <Link href="/eksplorasi?region=Jawa" className="hover:text-primary transition-colors">
                  Jawa (Gudeg, Rawon, Soto)
                </Link>
              </li>
              <li>
                <Link href="/eksplorasi?region=Bali" className="hover:text-primary transition-colors">
                  Bali & Nusa Tenggara
                </Link>
              </li>
              <li>
                <Link href="/eksplorasi?region=Sulawesi" className="hover:text-primary transition-colors">
                  Sulawesi (Coto, Konro)
                </Link>
              </li>
              <li>
                <Link href="/eksplorasi?region=Kalimantan" className="hover:text-primary transition-colors">
                  Kalimantan & Papua
                </Link>
              </li>
            </ul>
          </div>

          {/* Informasi & Kebijakan */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-on-surface">
              Tentang & Bantuan
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/tentang" className="hover:text-primary transition-colors">
                  Misi Pelestarian Budaya
                </Link>
              </li>
              <li>
                <Link href="/profil" className="hover:text-primary transition-colors">
                  Preferensi & Akun
                </Link>
              </li>
              <li>
                <Link href="/resep/tambah" className="hover:text-primary transition-colors">
                  Kontribusi Resep Baru
                </Link>
              </li>
              <li>
                <Link href="/belanja" className="hover:text-primary transition-colors">
                  Daftar Belanja Pasar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Resepedia. Dibuat dengan cinta untuk kuliner Indonesia 🇮🇩</p>
          <p className="flex items-center gap-1.5">
            Dikelola oleh komunitas koki rumahan nusantara
          </p>
        </div>
      </div>
    </footer>
  );
}
