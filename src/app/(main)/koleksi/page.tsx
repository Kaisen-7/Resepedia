import React from 'react';
import { Metadata } from 'next';
import { getRecipes, getCurrentUser, getSavedRecipeIds } from '@/lib/firebase/firestore-queries';
import KoleksiClient from '@/components/koleksi/KoleksiClient';

export const metadata: Metadata = {
  title: 'Koleksi Resep & Kreasi Saya | Resepedia',
  description: 'Daftar resep favorit tersimpan dan resep kreasi Anda di Resepedia.',
};

export const dynamic = 'force-dynamic';

export default async function KoleksiPage() {
  const [recipes, user] = await Promise.all([
    getRecipes(),
    getCurrentUser(),
  ]);

  const savedIds = user ? await getSavedRecipeIds(user.id) : [];

  return (
    <KoleksiClient
      allRecipes={recipes}
      savedRecipeIds={savedIds}
      userId={user?.id || null}
    />
  );
}
