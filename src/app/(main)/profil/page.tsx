import React from 'react';
import { Metadata } from 'next';
import { getCurrentUser, getSavedRecipeIds, getShoppingItems, getRecipes } from '@/lib/firebase/firestore-queries';
import ProfilClient from '@/components/profil/ProfilClient';

export const metadata: Metadata = {
  title: 'Profil & Preferensi Pengguna | Resepedia',
  description: 'Kelola preferensi tema, bahasa, diet, serta ringkasan akun Resepedia Anda.',
};

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const user = await getCurrentUser();
  const [recipes, savedIds, shoppingItems] = await Promise.all([
    getRecipes(),
    user ? getSavedRecipeIds(user.id) : [],
    user ? getShoppingItems(user.id) : [],
  ]);

  const myRecipesCount = user ? recipes.filter((r) => r.authorId === user.id).length : 0;

  return (
    <ProfilClient
      savedCount={savedIds.length}
      shoppingCount={shoppingItems.length}
      myRecipesCount={myRecipesCount}
    />
  );
}
