'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Comment, mapCommentDocToComment } from '@/types';

export async function createCommentAction(
  recipeId: string,
  text: string,
  author: { id: string; name: string; avatarUrl?: string | null }
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    if (!text.trim()) {
      return { success: false, error: 'Teks ulasan tidak boleh kosong.' };
    }

    const commentsRef = adminDb
      .collection('recipes')
      .doc(recipeId)
      .collection('comments');

    const docRef = commentsRef.doc();
    const now = Date.now();

    const newCommentData = {
      id: docRef.id,
      recipeId,
      authorId: author.id,
      authorName: author.name || 'Chef Tamu',
      authorAvatar: author.avatarUrl || null,
      text: text.trim().slice(0, 500),
      helpfulCount: 0,
      repliesCount: 0,
      createdAt: now,
    };

    await docRef.set(newCommentData);

    revalidatePath(`/resep/${recipeId}`);
    return {
      success: true,
      comment: mapCommentDocToComment(newCommentData),
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
  currentCount: number,
  recipeId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const commentRef = adminDb
      .collection('recipes')
      .doc(recipeId)
      .collection('comments')
      .doc(commentId);

    await commentRef.update({
      helpfulCount: FieldValue.increment(1),
    });

    const newCount = currentCount + 1;
    revalidatePath(`/resep/${recipeId}`);
    return { success: true, count: newCount };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
