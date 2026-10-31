'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase/admin';
import { RecipeDocument, Recipe, generateSlug, generateKeywords } from '@/types';

export async function createRecipeAction(
  recipeData: Omit<RecipeDocument, 'id' | 'slug' | 'ingredientNames' | 'searchKeywords' | 'createdAt'>,
  userId?: string
): Promise<{ success: boolean; recipe?: Recipe; error?: string }> {
  try {
    const recipesRef = adminDb.collection('recipes');
    const docRef = recipesRef.doc();
    const slug = generateSlug(recipeData.title, docRef.id);

    const ingredientNames = (recipeData.ingredients || []).map((i) =>
      i.name.toLowerCase().trim()
    );
    const searchKeywords = generateKeywords(
      recipeData.title,
      recipeData.region,
      recipeData.ingredients || []
    );

    const newDoc: RecipeDocument = {
      id: docRef.id,
      slug,
      title: recipeData.title,
      description: recipeData.description || '',
      image: recipeData.image || '',
      prepTime: recipeData.prepTime || '15 Mnt',
      cookTime: recipeData.cookTime || '30 Mnt',
      difficulty: recipeData.difficulty || 'Medium',
      calories: recipeData.calories || '300 kcal',
      category: recipeData.category || 'Main Course',
      region: recipeData.region || 'Jawa',
      spicy: Boolean(recipeData.spicy),
      servings: recipeData.servings || '4 Porsi',
      youtubeUrl: recipeData.youtubeUrl || null,
      videoUrl: recipeData.videoUrl || null,
      nutrition: recipeData.nutrition || { protein: '0g', fat: '0g', carbs: '0g' },
      variations: recipeData.variations || [],
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || [],
      rating: 0,
      ratingCount: 0,
      authorId: userId || recipeData.authorId || null,
      authorName: recipeData.authorName || 'Chef Resepedia',
      isDefault: false,
      ingredientNames,
      searchKeywords,
      createdAt: Date.now(),
    };

    await docRef.set(newDoc);

    revalidatePath('/');
    revalidatePath('/eksplorasi');
    revalidatePath('/koleksi');

    return { success: true, recipe: newDoc };
  } catch (err: any) {
    console.error('createRecipeAction error:', err);
    return { success: false, error: err.message };
  }
}

export async function updateRecipeAction(
  id: string,
  updates: Partial<RecipeDocument>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = adminDb.collection('recipes').doc(id);

    const cleanUpdates: any = { ...updates };
    delete cleanUpdates.id;

    if (updates.title && updates.ingredients) {
      cleanUpdates.ingredientNames = updates.ingredients.map((i) =>
        i.name.toLowerCase().trim()
      );
      cleanUpdates.searchKeywords = generateKeywords(
        updates.title,
        updates.region || 'Nusantara',
        updates.ingredients
      );
    }

    await docRef.update(cleanUpdates);

    revalidatePath('/');
    revalidatePath('/eksplorasi');
    if (updates.slug) {
      revalidatePath(`/resep/${updates.slug}`);
    } else {
      revalidatePath(`/resep/${id}`);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteRecipeAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = adminDb.collection('recipes').doc(id);
    await docRef.delete();

    revalidatePath('/');
    revalidatePath('/eksplorasi');
    revalidatePath('/koleksi');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateRatingAction(
  id: string,
  userRating: number,
  currentRating: number = 0,
  currentCount: number = 0
): Promise<{ success: boolean; newRating?: number; newCount?: number; error?: string }> {
  try {
    const docRef = adminDb.collection('recipes').doc(id);

    const newCount = currentCount + 1;
    const newRating = Number(((currentRating * currentCount + userRating) / newCount).toFixed(1));

    await docRef.update({
      rating: newRating,
      ratingCount: newCount,
    });

    revalidatePath('/');
    revalidatePath(`/resep/${id}`);
    return { success: true, newRating, newCount };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
