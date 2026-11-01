import { Recipe, RecipeDocument } from '@/types';
import { db } from '@/lib/firebase/client';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

const GUEST_RECIPES_KEY = 'guest_my_recipes';
const GUEST_SAVED_KEY = 'guest_saved_recipes';

export function getMyLocalRecipes(userId?: string | null): Recipe[] {
  if (typeof window === 'undefined') return [];
  const key = userId ? `my_recipes_${userId}` : GUEST_RECIPES_KEY;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return [];
}

export function saveMyLocalRecipe(recipe: Recipe, userId?: string | null): void {
  if (typeof window === 'undefined') return;
  const current = getMyLocalRecipes(userId);
  const updated = [recipe, ...current.filter((r) => r.id !== recipe.id && r.slug !== recipe.slug)];
  const key = userId ? `my_recipes_${userId}` : GUEST_RECIPES_KEY;
  localStorage.setItem(key, JSON.stringify(updated));

  // Sync to Firestore client if user logged in
  if (userId) {
    try {
      const docRef = doc(db, 'recipes', recipe.id);
      setDoc(docRef, recipe as RecipeDocument, { merge: true }).catch(() => {});
    } catch {}
  }

  window.dispatchEvent(new CustomEvent('my-recipes-updated', { detail: { count: updated.length } }));
}

export function deleteMyLocalRecipe(recipeId: string, userId?: string | null): void {
  if (typeof window === 'undefined') return;
  const current = getMyLocalRecipes(userId);
  const updated = current.filter((r) => r.id !== recipeId);
  const key = userId ? `my_recipes_${userId}` : GUEST_RECIPES_KEY;
  localStorage.setItem(key, JSON.stringify(updated));

  if (userId) {
    try {
      const docRef = doc(db, 'recipes', recipeId);
      deleteDoc(docRef).catch(() => {});
    } catch {}
  }

  window.dispatchEvent(new CustomEvent('my-recipes-updated', { detail: { count: updated.length } }));
}

export function getMyLocalRecipesCount(userId?: string | null): number {
  return getMyLocalRecipes(userId).length;
}

export function getLocalSavedRecipeIds(userId?: string | null): string[] {
  if (typeof window === 'undefined') return [];
  const key = userId ? `saved_recipes_${userId}` : GUEST_SAVED_KEY;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export function saveLocalSavedRecipeIds(ids: string[], userId?: string | null): void {
  if (typeof window === 'undefined') return;
  const key = userId ? `saved_recipes_${userId}` : GUEST_SAVED_KEY;
  localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: { savedRecipeIds: ids } }));
}
