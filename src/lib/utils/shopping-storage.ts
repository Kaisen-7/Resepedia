import { ShoppingItem } from '@/types';
import { db } from '@/lib/firebase/client';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

const GUEST_KEY = 'guest_shopping_items';

function getKey(userId?: string | null): string {
  return userId ? `shopping_items_${userId}` : GUEST_KEY;
}

export function getLocalShoppingItems(userId?: string | null): ShoppingItem[] {
  if (typeof window === 'undefined') return [];
  const primaryKey = getKey(userId);
  const raw = localStorage.getItem(primaryKey);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  // If user just logged in and has guest items, fallback to guest items
  if (userId) {
    const guestRaw = localStorage.getItem(GUEST_KEY);
    if (guestRaw) {
      try {
        const guestItems = JSON.parse(guestRaw);
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          localStorage.setItem(primaryKey, guestRaw);
          return guestItems;
        }
      } catch {}
    }
  }
  return [];
}

export function saveLocalShoppingItems(items: ShoppingItem[], userId?: string | null) {
  if (typeof window === 'undefined') return;
  const key = getKey(userId);
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('shopping-list-updated', { detail: { count: items.length } }));
}

export function getShoppingCount(userId?: string | null): number {
  return getLocalShoppingItems(userId).length;
}

export async function addShoppingItem(
  name: string,
  detail: string,
  recipeTitle?: string,
  userId?: string | null
): Promise<ShoppingItem> {
  const current = getLocalShoppingItems(userId);
  const id = 'shop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newItem: ShoppingItem = {
    id,
    name: name.trim(),
    detail: detail.trim(),
    checked: false,
    recipeTitle: recipeTitle || 'Catatan Pribadi',
    createdAt: Date.now(),
  };

  const updated = [newItem, ...current];
  saveLocalShoppingItems(updated, userId);

  // Sync to Firestore if user logged in
  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'shopping_items', id);
      await setDoc(docRef, newItem);
    } catch (err) {
      console.warn('[Resepedia] Could not sync shopping item to Firestore:', err);
    }
  }

  return newItem;
}

export async function toggleCheckShoppingItem(
  itemId: string,
  currentChecked: boolean,
  userId?: string | null
): Promise<void> {
  const current = getLocalShoppingItems(userId);
  const updated = current.map((i) =>
    i.id === itemId ? { ...i, checked: !currentChecked } : i
  );
  saveLocalShoppingItems(updated, userId);

  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'shopping_items', itemId);
      await updateDoc(docRef, { checked: !currentChecked });
    } catch (err) {
      console.warn('[Resepedia] Could not sync shopping check to Firestore:', err);
    }
  }
}

export async function deleteShoppingItem(
  itemId: string,
  userId?: string | null
): Promise<void> {
  const current = getLocalShoppingItems(userId);
  const updated = current.filter((i) => i.id !== itemId);
  saveLocalShoppingItems(updated, userId);

  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'shopping_items', itemId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('[Resepedia] Could not delete shopping item from Firestore:', err);
    }
  }
}

export async function clearCheckedShoppingItems(
  userId?: string | null
): Promise<void> {
  const current = getLocalShoppingItems(userId);
  const toDelete = current.filter((i) => i.checked);
  const updated = current.filter((i) => !i.checked);
  saveLocalShoppingItems(updated, userId);

  if (userId && toDelete.length > 0) {
    try {
      for (const item of toDelete) {
        const docRef = doc(db, 'users', userId, 'shopping_items', item.id);
        await deleteDoc(docRef);
      }
    } catch (err) {
      console.warn('[Resepedia] Could not clear checked shopping items from Firestore:', err);
    }
  }
}
