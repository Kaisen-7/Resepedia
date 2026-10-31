import { adminDb } from './admin';
import {
  RecipeDocument,
  CommentDocument,
  ShoppingItemDocument,
  UserDocument,
} from '@/types/recipe.types';
import { mapCommentDocToComment, Comment } from '@/types';

export async function getRecipes(): Promise<RecipeDocument[]> {
  try {
    const snapshot = await adminDb
      .collection('recipes')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as RecipeDocument;
    });
  } catch (err) {
    console.error('getRecipes Firestore query error:', err);
    return [];
  }
}

export async function getRecipeBySlugOrId(slugOrId: string): Promise<RecipeDocument | null> {
  try {
    // 1. Try matching slug
    const bySlug = await adminDb
      .collection('recipes')
      .where('slug', '==', slugOrId)
      .limit(1)
      .get();

    if (!bySlug.empty) {
      const docSnap = bySlug.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as RecipeDocument;
    }

    // 2. Try matching document ID directly
    const byId = await adminDb.collection('recipes').doc(slugOrId).get();
    if (byId.exists) {
      return { id: byId.id, ...byId.data() } as RecipeDocument;
    }

    return null;
  } catch (err) {
    console.error('getRecipeBySlugOrId Firestore error:', err);
    return null;
  }
}

export async function getComments(recipeId: string): Promise<Comment[]> {
  try {
    const snapshot = await adminDb
      .collection('recipes')
      .doc(recipeId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((d) =>
      mapCommentDocToComment({ id: d.id, ...d.data() })
    );
  } catch (err) {
    console.error('getComments Firestore error:', err);
    return [];
  }
}

export async function getSavedRecipeIds(userId?: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      return (data?.savedRecipeIds as string[]) || [];
    }
    return [];
  } catch (err) {
    console.error('getSavedRecipeIds Firestore error:', err);
    return [];
  }
}

export async function getShoppingItems(userId?: string): Promise<ShoppingItemDocument[]> {
  if (!userId) return [];
  try {
    const snapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('shopping_items')
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...d.data(),
        } as ShoppingItemDocument)
    );
  } catch (err) {
    console.error('getShoppingItems Firestore error:', err);
    return [];
  }
}

export async function getCurrentUser() {
  // Can be extracted from session cookie if configured, or client-side hydrated.
  return null;
}
