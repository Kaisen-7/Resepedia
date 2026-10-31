import React from 'react';
import { getRecipes, getCurrentUser, getSavedRecipeIds } from '@/lib/firebase/firestore-queries';
import HomeClient from '@/components/home/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [recipes, user] = await Promise.all([
    getRecipes(),
    getCurrentUser(),
  ]);

  const savedIds = user ? await getSavedRecipeIds(user.id) : [];

  return <HomeClient initialRecipes={recipes} savedRecipeIds={savedIds} />;
}
