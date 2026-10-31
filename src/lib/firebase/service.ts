import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './client';
import { compressImageToDataUrl } from '../utils/image-compression';
import {
  RecipeDocument,
  CommentDocument,
  ShoppingItemDocument,
  UserDocument,
} from '@/types/recipe.types';

// 1. FETCH SEMUA RESEP (Client-side)
export async function fetchRecipes(): Promise<RecipeDocument[]> {
  try {
    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RecipeDocument));
  } catch (err) {
    console.error('Error fetching recipes from Firestore:', err);
    return [];
  }
}

// 2. FETCH RESEP BERDASARKAN SLUG
export async function fetchRecipeBySlug(slug: string): Promise<RecipeDocument | null> {
  try {
    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // Fallback: check by ID if slug is UUID
      const docRef = doc(db, 'recipes', slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as RecipeDocument;
      }
      return null;
    }
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as RecipeDocument;
  } catch (err) {
    console.error('Error fetching recipe by slug:', err);
    return null;
  }
}

// 3. BOOKMARK / SIMPAN RESEP (arrayUnion & arrayRemove pada dokumen users/{userId})
export async function toggleSaveRecipe(userId: string, recipeId: string, isSaved: boolean) {
  const userRef = doc(db, 'users', userId);
  await setDoc(
    userRef,
    {
      savedRecipeIds: isSaved ? arrayRemove(recipeId) : arrayUnion(recipeId),
    },
    { merge: true }
  );
}

// 4. UPDATE RATING RESEP SECARA ATOMIK (runTransaction)
export async function submitRecipeRating(recipeId: string, newScore: number) {
  const recipeRef = doc(db, 'recipes', recipeId);
  return await runTransaction(db, async (transaction) => {
    const recipeSnap = await transaction.get(recipeRef);
    if (!recipeSnap.exists()) throw new Error('Resep tidak ditemukan');

    const data = recipeSnap.data();
    const oldRating = Number(data.rating || 0);
    const oldCount = Number(data.ratingCount || 0);

    const updatedCount = oldCount + 1;
    const updatedRating = Number(((oldRating * oldCount + newScore) / updatedCount).toFixed(1));

    transaction.update(recipeRef, {
      rating: updatedRating,
      ratingCount: updatedCount,
    });

    return { updatedRating, updatedCount };
  });
}

// 5. KOMENTAR & UPVOTE HELPFUL (Subkoleksi recipes/{recipeId}/comments)
export async function addComment(
  recipeId: string,
  comment: {
    authorId: string;
    authorName: string;
    authorAvatar?: string | null;
    text: string;
  }
): Promise<CommentDocument> {
  const commentsRef = collection(db, 'recipes', recipeId, 'comments');
  const now = Date.now();
  const docRef = await addDoc(commentsRef, {
    recipeId,
    authorId: comment.authorId,
    authorName: comment.authorName,
    authorAvatar: comment.authorAvatar || null,
    text: comment.text,
    helpfulCount: 0,
    repliesCount: 0,
    createdAt: now,
  });

  return {
    id: docRef.id,
    recipeId,
    authorId: comment.authorId,
    authorName: comment.authorName,
    authorAvatar: comment.authorAvatar || null,
    text: comment.text,
    helpfulCount: 0,
    repliesCount: 0,
    createdAt: now,
  };
}

export async function incrementCommentHelpful(recipeId: string, commentId: string) {
  const commentRef = doc(db, 'recipes', recipeId, 'comments', commentId);
  await updateDoc(commentRef, {
    helpfulCount: increment(1),
  });
}

// 6. UPLOAD GAMBAR RESEP KE FIREBASE STORAGE (DENGAN FALLBACK OTOMATIS KOMPRESI WEBP UNTUK SPARK PLAN GRATIS)
export async function uploadRecipeImage(file: File, userId?: string): Promise<string> {
  const uid = userId || 'anonymous';
  try {
    const ext = file.name.split('.').pop();
    const filePath = `recipes/${uid}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const storageRef = ref(storage, filePath);

    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    });
    return await getDownloadURL(snapshot.ref);
  } catch (storageErr) {
    console.warn(
      'Firebase Cloud Storage tidak aktif (Spark Plan). Menggunakan kompresi client-side WebP (~50KB) yang langsung tersimpan di Cloud Firestore:',
      storageErr
    );
    // Fallback otomatis: Kompresi gambar menjadi WebP/JPEG ringan (~50KB) yang disimpan langsung di Firestore
    return await compressImageToDataUrl(file);
  }
}

// 7. REAL-TIME LISTENER DAFTAR BELANJA (onSnapshot untuk users/{userId}/shopping_items)
export function subscribeShoppingItems(
  userId: string,
  onUpdate: (items: ShoppingItemDocument[]) => void
): Unsubscribe {
  const itemsRef = collection(db, 'users', userId, 'shopping_items');
  const q = query(itemsRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...d.data(),
        } as ShoppingItemDocument)
    );
    onUpdate(items);
  });
}
