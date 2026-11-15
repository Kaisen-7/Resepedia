import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { TimerProvider } from '@/contexts/TimerContext';
import CookingTimer from '@/components/widgets/CookingTimer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resepedia-seven.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'Resepedia — Ensiklopedi & Kitab Kuliner Nusantara',
    template: '%s | Resepedia',
  },
  description:
    'Eksplorasi ribuan resep masakan tradisional autentik Nusantara, dilengkapi Mode Perapian dengan panduan suara, Kitab Rempah & Substitusi bumbu instan, dan kalkulator porsi rombongan.',
  keywords: [
    'resep masakan',
    'kuliner nusantara',
    'masakan indonesia',
    'resep rendang',
    'resep soto',
    'kitab rempah',
    'resepedia',
  ],
  authors: [{ name: 'Resepedia Community' }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Resepedia — Ensiklopedi & Kitab Kuliner Nusantara',
    description:
      'Katalog resep masakan Nusantara interaktif terlengkap dengan Mode Perapian dan Kitab Rempah Tradisional.',
    url: siteUrl,
    siteName: 'Resepedia',
    locale: 'id_ID',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#C85A32',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-surface text-on-surface font-sans antialiased selection:bg-primary/20 selection:text-primary">
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <TimerProvider>
                {children}
                <CookingTimer />
              </TimerProvider>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
