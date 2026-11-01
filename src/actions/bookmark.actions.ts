'use server';

import { revalidatePath } from 'next/cache';
import { adminDb, hasAdminCredentials } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function toggleSaveRecipeAction(
  recipeId: string,
  isCurrentlySaved: boolean,
  userId?: string
): Promise<{ success: boolean; isSaved: boolean; error?: string }> {
  try {
    if (!userId) {
      return {
        success: false,
        isSaved: isCurrentlySaved,
        error: 'Silakan masuk untuk menyimpan resep favorit.',
      };
    }

    if (!hasAdminCredentials || !adminDb) {
      // Local fallback mode when admin credentials are not in environment
      return { success: true, isSaved: !isCurrentlySaved };
    }

    const userRef = adminDb.collection('users').doc(userId);

    if (isCurrentlySaved) {
      await userRef.set(
        {
          savedRecipeIds: FieldValue.arrayRemove(recipeId),
        },
        { merge: true }
      );
      revalidatePath('/koleksi');
      return { success: true, isSaved: false };
    } else {
      await userRef.set(
        {
          savedRecipeIds: FieldValue.arrayUnion(recipeId),
        },
        { merge: true }
      );
      revalidatePath('/koleksi');
      return { success: true, isSaved: true };
    }
  } catch (err: any) {
    console.error('toggleSaveRecipeAction error:', err);
    return { success: false, isSaved: isCurrentlySaved, error: err.message };
  }
}
