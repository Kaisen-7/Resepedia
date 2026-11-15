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
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  // Fallback to guest / legacy recipes if user is logged in
  if (userId) {
    const guestRaw = localStorage.getItem(GUEST_RECIPES_KEY) || localStorage.getItem('my_recipes');
    if (guestRaw) {
      try {
        const parsed = JSON.parse(guestRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(key, JSON.stringify(parsed));
          return parsed;
        }
      } catch {}
    }
  }

  const legacy = localStorage.getItem('my_recipes');
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
      setDoc(docRef, { ...recipe, authorId: userId } as RecipeDocument, { merge: true }).catch(() => {});
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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  // Fallback to guest or legacy bookmarks if logged in
  if (userId) {
    const guestRaw = localStorage.getItem(GUEST_SAVED_KEY) || localStorage.getItem('saved_recipes');
    if (guestRaw) {
      try {
        const parsed = JSON.parse(guestRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(key, JSON.stringify(parsed));
          return parsed;
        }
      } catch {}
    }
  }

  const legacy = localStorage.getItem('saved_recipes');
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

/**
 * Migrates guest bookmarks and recipes to the logged-in user profile.
 */
export function migrateGuestDataToUser(userId: string): {
  migratedBookmarks: string[];
  migratedRecipes: Recipe[];
} {
  if (typeof window === 'undefined' || !userId) {
    return { migratedBookmarks: [], migratedRecipes: [] };
  }

  // 1. Migrate Bookmarks
  const guestSaved = getLocalSavedRecipeIds(null);
  const userSaved = getLocalSavedRecipeIds(userId);
  const mergedSaved = Array.from(new Set([...userSaved, ...guestSaved]));
  if (mergedSaved.length > 0) {
    localStorage.setItem(`saved_recipes_${userId}`, JSON.stringify(mergedSaved));
    localStorage.removeItem(GUEST_SAVED_KEY);
    localStorage.removeItem('saved_recipes');
    window.dispatchEvent(
      new CustomEvent('bookmarks-updated', { detail: { savedRecipeIds: mergedSaved } })
    );
  }

  // 2. Migrate Recipes
  const guestRecipes = getMyLocalRecipes(null);
  const userRecipes = getMyLocalRecipes(userId);
  const recipeMap = new Map<string, Recipe>();
  guestRecipes.forEach((r) => recipeMap.set(r.id, { ...r, authorId: userId }));
  userRecipes.forEach((r) => recipeMap.set(r.id, r));
  const mergedRecipes = Array.from(recipeMap.values());
  if (mergedRecipes.length > 0) {
    localStorage.setItem(`my_recipes_${userId}`, JSON.stringify(mergedRecipes));
    localStorage.removeItem(GUEST_RECIPES_KEY);
    localStorage.removeItem('my_recipes');
    window.dispatchEvent(
      new CustomEvent('my-recipes-updated', { detail: { count: mergedRecipes.length } })
    );
  }

  return { migratedBookmarks: mergedSaved, migratedRecipes: mergedRecipes };
}
