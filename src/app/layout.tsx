import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { TimerProvider } from '@/contexts/TimerContext';
import { AIProvider } from '@/contexts/AIContext';
import CookingTimer from '@/components/widgets/CookingTimer';
import AIChatDrawer from '@/components/ai/AIChatDrawer';

export const metadata: Metadata = {
  title: {
    default: 'Resepedia — Ensiklopedi & Asisten Koki Cerdas Kuliner Nusantara',
    template: '%s | Resepedia',
  },
  description:
    'Eksplorasi ribuan resep masakan tradisional autentik Nusantara, dilengkapi panduan memasak bebas genggam dengan suara, kalkulator porsi dinamis, dan Chef AI cerdas.',
  keywords: [
    'resep masakan',
    'kuliner nusantara',
    'masakan indonesia',
    'resep rendang',
    'resep soto',
    'chef ai',
    'resepedia',
  ],
  authors: [{ name: 'Resepedia Community' }],
  metadataBase: new URL('https://resepedia.id'),
  openGraph: {
    title: 'Resepedia — Ensiklopedi & Asisten Koki Cerdas Kuliner Nusantara',
    description:
      'Katalog resep masakan Nusantara interaktif terlengkap dengan Chef AI dan mode memasak hands-free.',
    url: 'https://resepedia.id',
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
