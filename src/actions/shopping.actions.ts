'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase/admin';
import { ShoppingItemDocument } from '@/types/recipe.types';

export async function addShoppingItemAction(
  name: string,
  detail: string,
  recipeTitle?: string,
  userId?: string
): Promise<{ success: boolean; item?: ShoppingItemDocument; error?: string }> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'Silakan masuk untuk menyinkronkan daftar belanja ke akun Cloud.',
      };
    }

    const itemsRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('shopping_items');

    const docRef = itemsRef.doc();
    const now = Date.now();

    const newItem: ShoppingItemDocument = {
      id: docRef.id,
      name: name.trim(),
      detail: detail.trim(),
      checked: false,
      recipeTitle: recipeTitle || null,
      createdAt: now,
    };

    await docRef.set(newItem);

    revalidatePath('/belanja');
    return { success: true, item: newItem };
  } catch (err: any) {
    console.error('addShoppingItemAction error:', err);
    return { success: false, error: err.message };
  }
}

export async function toggleCheckShoppingItemAction(
  itemId: string,
  currentChecked: boolean,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) return { success: false, error: 'User tidak ditemukan' };

    const itemRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('shopping_items')
      .doc(itemId);

    await itemRef.update({
      checked: !currentChecked,
    });

    revalidatePath('/belanja');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteShoppingItemAction(
  itemId: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) return { success: false, error: 'User tidak ditemukan' };

    await adminDb
      .collection('users')
      .doc(userId)
      .collection('shopping_items')
      .doc(itemId)
      .delete();

    revalidatePath('/belanja');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function clearCheckedItemsAction(
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) return { success: false, error: 'User tidak ditemukan' };

    const itemsRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('shopping_items');

    const snapshot = await itemsRef.where('checked', '==', true).get();
    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    revalidatePath('/belanja');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
