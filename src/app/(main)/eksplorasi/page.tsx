import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getRecipes, getCurrentUser, getSavedRecipeIds } from '@/lib/firebase/firestore-queries';
import EksplorasiClient from '@/components/eksplorasi/EksplorasiClient';

export const metadata: Metadata = {
  title: 'Eksplorasi Resep Nusantara | Resepedia',
  description:
    'Cari dan temukan resep masakan autentik Nusantara dari Sumatra, Jawa, Bali, Sulawesi, Kalimantan, hingga Papua dengan filter cerdas.',
};

export const dynamic = 'force-dynamic';

export default async function EksplorasiPage() {
  const [recipes, user] = await Promise.all([
    getRecipes(),
    getCurrentUser(),
  ]);

  const savedIds = user ? await getSavedRecipeIds(user.id) : [];

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          </div>
        </div>
      }
    >
      <EksplorasiClient initialRecipes={recipes} savedRecipeIds={savedIds} />
    </Suspense>
  );
}
