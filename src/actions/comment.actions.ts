'use server';

import { revalidatePath } from 'next/cache';
import { adminDb, hasAdminCredentials } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Comment, mapCommentDocToComment } from '@/types';

export async function createCommentAction(
  recipeId: string,
  text: string,
  author: { id: string; name: string; avatarUrl?: string | null },
  rating?: number
): Promise<{ success: boolean; comment?: Comment; newRating?: number; newCount?: number; error?: string }> {
  try {
    if (!text.trim()) {
      return { success: false, error: 'Teks ulasan tidak boleh kosong.' };
    }

    const now = Date.now();
    const validRating = rating && rating >= 1 && rating <= 5 ? rating : null;

    const newCommentData = {
      id: 'cmt_' + Math.random().toString(36).substring(2, 9),
      recipeId,
      authorId: author.id,
      authorName: author.name || 'Chef Tamu',
      authorAvatar: author.avatarUrl || null,
      text: text.trim().slice(0, 500),
      rating: validRating,
      helpfulCount: 0,
      repliesCount: 0,
      createdAt: now,
    };

    if (!hasAdminCredentials || !adminDb) {
      // In standalone / client mode, return the created comment for client state
      return {
        success: true,
        comment: mapCommentDocToComment(newCommentData),
        newRating: validRating || undefined,
        newCount: validRating ? 1 : 0,
      };
    }

    const commentsRef = adminDb
      .collection('recipes')
      .doc(recipeId)
      .collection('comments');

    const docRef = commentsRef.doc();
    newCommentData.id = docRef.id;

    await docRef.set(newCommentData);

    let updatedRating: number | undefined;
    let updatedCount: number | undefined;

    // If a valid star rating was provided, recalculate recipe average rating
    if (validRating) {
      try {
        const recipeRef = adminDb.collection('recipes').doc(recipeId);
        const recipeSnap = await recipeRef.get();
        if (recipeSnap.exists) {
          const recipeData = recipeSnap.data();
          const currentCount = Number(recipeData?.ratingCount || 0);
          const currentRating = Number(recipeData?.rating || 0);
          const newCount = currentCount + 1;
          const newRating = Number(((currentRating * currentCount + validRating) / newCount).toFixed(1));

          await recipeRef.update({
            rating: newRating,
            ratingCount: newCount,
          });

          updatedRating = newRating;
          updatedCount = newCount;
        }
      } catch (rateErr) {
        console.warn('Could not update aggregated recipe rating:', rateErr);
      }
    }

    revalidatePath(`/resep/${recipeId}`);
    revalidatePath('/');
    revalidatePath('/eksplorasi');

    return {
      success: true,
      comment: mapCommentDocToComment(newCommentData),
      newRating: updatedRating,
      newCount: updatedCount,
    };
  } catch (err: any) {
    console.error('createCommentAction error:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteCommentAction(
  commentId: string,
  recipeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!hasAdminCredentials || !adminDb) {
      return { success: true };
    }

    await adminDb
      .collection('recipes')
      .doc(recipeId)
      .collection('comments')
      .doc(commentId)
      .delete();

    revalidatePath(`/resep/${recipeId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function incrementCommentHelpfulAction(
  commentId: string,
  currentHelpful: number,
  recipeId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const newCount = currentHelpful + 1;
    if (!hasAdminCredentials || !adminDb) {
      return { success: true, count: newCount };
    }

    const commentRef = adminDb
      .collection('recipes')
      .doc(recipeId)
      .collection('comments')
      .doc(commentId);

    await commentRef.update({
      helpfulCount: FieldValue.increment(1),
    });

    revalidatePath(`/resep/${recipeId}`);
    return { success: true, count: newCount };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
