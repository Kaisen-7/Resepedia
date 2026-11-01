'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase/client';
import { UserDocument } from '@/types/recipe.types';
import {
  getLocalSavedRecipeIds,
  saveLocalSavedRecipeIds,
} from '@/lib/utils/recipe-storage';
import { toggleSaveRecipeAction } from '@/actions/bookmark.actions';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isGuest: boolean;
  userData: UserDocument | null;
  savedRecipeIds: string[];
  toggleBookmark: (recipeId: string) => Promise<boolean>;
  isRecipeSaved: (recipeId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserDocument | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize saved recipes from local storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initialSaved = getLocalSavedRecipeIds(user?.uid);
    if (initialSaved.length > 0) {
      setSavedRecipeIds(initialSaved);
    }

    const handleBookmarksUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.savedRecipeIds) {
        setSavedRecipeIds(customEvent.detail.savedRecipeIds);
      } else {
        setSavedRecipeIds(getLocalSavedRecipeIds(user?.uid));
      }
    };

    window.addEventListener('bookmarks-updated', handleBookmarksUpdated);
    return () => window.removeEventListener('bookmarks-updated', handleBookmarksUpdated);
  }, [user]);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Load initial local saved recipes for this user
        const localSaved = getLocalSavedRecipeIds(firebaseUser.uid);
        if (localSaved.length > 0) {
          setSavedRecipeIds(localSaved);
        }

        const userRef = doc(db, 'users', firebaseUser.uid);

        // Real-time listen to user document (savedRecipeIds, preferences)
        unsubscribeDoc = onSnapshot(
          userRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserDocument;
              setUserData(data);
              const cloudSaved: string[] = data.savedRecipeIds || [];
              // Merge local and cloud saved IDs
              const merged = Array.from(new Set([...cloudSaved, ...localSaved]));
              setSavedRecipeIds(merged);
              saveLocalSavedRecipeIds(merged, firebaseUser.uid);
            } else {
              // First time login: create user document
              const newUserData: UserDocument = {
                id: firebaseUser.uid,
                displayName: firebaseUser.displayName || 'Chef Resepedia',
                email: firebaseUser.email || '',
                avatarUrl: firebaseUser.photoURL || null,
                savedRecipeIds: localSaved,
                preferences: {
                  darkMode: false,
                  language: 'id',
                  dietary: 'None',
                },
                createdAt: Date.now(),
              };
              await setDoc(userRef, newUserData).catch(() => {});
              setUserData(newUserData);
              setSavedRecipeIds(localSaved);
            }
          },
          (err) => {
            console.warn('[Resepedia] Firestore snapshot warning:', err);
            // Fallback to local storage if Firestore permissions or offline
            setSavedRecipeIds(getLocalSavedRecipeIds(firebaseUser.uid));
          }
        );
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        setUserData(null);
        setSavedRecipeIds(getLocalSavedRecipeIds(null));
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const toggleBookmark = useCallback(
    async (recipeId: string): Promise<boolean> => {
      const isCurrentlySaved = savedRecipeIds.includes(recipeId);
      const nextSavedState = !isCurrentlySaved;

      const newIds = nextSavedState
        ? [...savedRecipeIds, recipeId]
        : savedRecipeIds.filter((id) => id !== recipeId);

      // Optimistic instant state update
      setSavedRecipeIds(newIds);
      saveLocalSavedRecipeIds(newIds, user?.uid);

      if (user) {
        // 1. Direct Client Firestore write
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, { savedRecipeIds: newIds }, { merge: true });
        } catch (err) {
          console.warn('[Resepedia] Direct Firestore bookmark save failed, using local fallback:', err);
        }

        // 2. Server Action invocation
        try {
          await toggleSaveRecipeAction(recipeId, isCurrentlySaved, user.uid);
        } catch {}
      }

      return nextSavedState;
    },
    [savedRecipeIds, user]
  );

  const isRecipeSaved = useCallback(
    (recipeId: string): boolean => {
      return savedRecipeIds.includes(recipeId);
    },
    [savedRecipeIds]
  );

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in with Google Firebase:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logout,
        isGuest: !user && !loading,
        userData,
        savedRecipeIds,
        toggleBookmark,
        isRecipeSaved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
