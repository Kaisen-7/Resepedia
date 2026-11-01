import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { TimerProvider } from '@/contexts/TimerContext';
import { AIProvider } from '@/contexts/AIContext';
import CookingTimer from '@/components/widgets/CookingTimer';
import AIChatDrawer from '@/components/ai/AIChatDrawer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resepedia-seven.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'Resepedia — Ensiklopedi & Asisten Dapur Kuliner Nusantara',
    template: '%s | Resepedia',
  },
  description:
    'Eksplorasi ribuan resep masakan tradisional autentik Nusantara, dilengkapi panduan memasak bebas genggam dengan suara, kalkulator porsi dinamis, dan Asisten Dapur cerdas.',
  keywords: [
    'resep masakan',
    'kuliner nusantara',
    'masakan indonesia',
    'resep rendang',
    'resep soto',
    'asisten dapur',
    'resepedia',
  ],
  authors: [{ name: 'Resepedia Community' }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Resepedia — Ensiklopedi & Asisten Dapur Kuliner Nusantara',
    description:
      'Katalog resep masakan Nusantara interaktif terlengkap dengan asisten kuliner dan mode memasak hands-free.',
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
  themeColor: '#E04F26',
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
                <AIProvider>
                  {children}
                  <CookingTimer />
                  <AIChatDrawer />
                </AIProvider>
              </TimerProvider>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
