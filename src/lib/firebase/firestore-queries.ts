import { adminDb, hasAdminCredentials } from './admin';
import {
  RecipeDocument,
  CommentDocument,
  ShoppingItemDocument,
  UserDocument,
} from '@/types/recipe.types';
import { mapCommentDocToComment, Comment } from '@/types';
import {
  FALLBACK_RECIPES,
  getFallbackRecipeBySlugOrId,
} from '@/lib/data/seed-recipes';

/**
 * Helper to ensure objects passed to Client Components are plain JSON-serializable,
 * converting Firestore Timestamp objects ({ seconds, nanoseconds }) to numbers.
 */
function sanitizeDoc<T>(doc: any): T {
  if (!doc) return doc;
  return JSON.parse(
    JSON.stringify(doc, (_, value) => {
      if (
        value &&
        typeof value === 'object' &&
        ('_seconds' in value || 'seconds' in value) &&
        !Array.isArray(value)
      ) {
        return (value._seconds ?? value.seconds) * 1000;
      }
      return value;
    })
  );
}

/**
 * Timeout wrapper to prevent serverless function hangs when Firestore is unreachable
 */
async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[Resepedia] Firestore query timed out after ${ms}ms. Using fallback.`);
      resolve(fallback);
    }, ms);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    console.error('[Resepedia] Firestore query error:', err);
    return fallback;
  }
}

export async function getRecipes(): Promise<RecipeDocument[]> {
  if (!hasAdminCredentials) {
    console.warn('[Resepedia] Admin credentials not configured. Serving fallback recipes.');
    return FALLBACK_RECIPES;
  }

  return withTimeout(
    (async () => {
      const snapshot = await adminDb
        .collection('recipes')
        .orderBy('createdAt', 'desc')
        .get();

      if (snapshot.empty) {
        return FALLBACK_RECIPES;
      }

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return sanitizeDoc<RecipeDocument>({
          id: doc.id,
          ...data,
        });
      });
    })(),
    4000,
    FALLBACK_RECIPES
  );
}

export async function getRecipeBySlugOrId(slugOrId: string): Promise<RecipeDocument | null> {
  if (!hasAdminCredentials) {
    return getFallbackRecipeBySlugOrId(slugOrId);
  }

  const fallback = getFallbackRecipeBySlugOrId(slugOrId);

  return withTimeout(
    (async () => {
      // 1. Try matching slug
      const bySlug = await adminDb
        .collection('recipes')
        .where('slug', '==', slugOrId)
        .limit(1)
        .get();

      if (!bySlug.empty) {
        const docSnap = bySlug.docs[0];
        return sanitizeDoc<RecipeDocument>({ id: docSnap.id, ...docSnap.data() });
      }

      // 2. Try matching document ID directly
      const byId = await adminDb.collection('recipes').doc(slugOrId).get();
      if (byId.exists) {
        return sanitizeDoc<RecipeDocument>({ id: byId.id, ...byId.data() });
      }

      return fallback;
    })(),
    4000,
    fallback
  );
}

export async function getComments(recipeId: string): Promise<Comment[]> {
  if (!hasAdminCredentials) {
    return [];
  }

  return withTimeout(
    (async () => {
      const snapshot = await adminDb
        .collection('recipes')
        .doc(recipeId)
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((d) =>
        sanitizeDoc<Comment>(mapCommentDocToComment({ id: d.id, ...d.data() }))
      );
    })(),
    3000,
    []
  );
}

export async function getSavedRecipeIds(userId?: string): Promise<string[]> {
  if (!userId || !hasAdminCredentials) return [];

  return withTimeout(
    (async () => {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        return (data?.savedRecipeIds as string[]) || [];
      }
      return [];
    })(),
    3000,
    []
  );
}

export async function getShoppingItems(userId?: string): Promise<ShoppingItemDocument[]> {
  if (!userId || !hasAdminCredentials) return [];

  return withTimeout(
    (async () => {
      const snapshot = await adminDb
        .collection('users')
        .doc(userId)
        .collection('shopping_items')
        .orderBy('createdAt', 'asc')
        .get();

      return snapshot.docs.map((d) =>
        sanitizeDoc<ShoppingItemDocument>({
          id: d.id,
          ...d.data(),
        })
      );
    })(),
    3000,
    []
  );
}

export async function getCurrentUser() {
  return null;
}
