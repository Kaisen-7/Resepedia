'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase/client';
import { UserDocument } from '@/types/recipe.types';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isGuest: boolean;
  userData: UserDocument | null;
  savedRecipeIds: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserDocument | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);

        // Real-time listen to user document (savedRecipeIds, preferences)
        unsubscribeDoc = onSnapshot(userRef, async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserDocument;
            setUserData(data);
            setSavedRecipeIds(data.savedRecipeIds || []);
          } else {
            // First time login: create user document
            const newUserData: UserDocument = {
              id: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Chef Resepedia',
              email: firebaseUser.email || '',
              avatarUrl: firebaseUser.photoURL || null,
              savedRecipeIds: [],
              preferences: {
                darkMode: false,
                language: 'id',
                dietary: 'None',
              },
              createdAt: Date.now(),
            };
            await setDoc(userRef, newUserData);
            setUserData(newUserData);
            setSavedRecipeIds([]);
          }
        });
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        setUserData(null);
        setSavedRecipeIds([]);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

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
