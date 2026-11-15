/**
 * Resepedia Cozy RPG — Chef Cooking Mastery & XP Storage
 * Pure deterministic gamification for recipes cooked.
 */

import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserMastery {
  xp: number;
  level: number;
  title: string;
  cookedRecipeIds: string[];
  nextLevelXp: number;
  currentLevelBaseXp: number;
  progressPercent: number;
}

const COOKED_RECIPES_KEY = 'culinary_cooked_recipes';
const MASTERY_KEY = 'culinary_mastery';

export function calculateLevelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 25)) + 1;
}

export function calculateXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 25;
}

export function getChefTitle(level: number, language: 'id' | 'en' = 'id'): string {
  if (level <= 2) {
    return language === 'en' ? 'Apprentice Cook' : 'Peracik Magang';
  }
  if (level <= 5) {
    return language === 'en' ? 'Hearth Keeper' : 'Penjaga Bara Dapur';
  }
  if (level <= 9) {
    return language === 'en' ? 'Spice Champion' : 'Pendekar Rempah';
  }
  return language === 'en' ? 'Grandmaster Culinary Guru' : 'Empu Kuliner Agung';
}

export function getLocalCookedRecipeIds(userId?: string | null): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = userId ? `${COOKED_RECIPES_KEY}_${userId}` : COOKED_RECIPES_KEY;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveLocalCookedRecipeIds(ids: string[], userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const key = userId ? `${COOKED_RECIPES_KEY}_${userId}` : COOKED_RECIPES_KEY;
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {}
}

export function getLocalMastery(userId?: string | null, language: 'id' | 'en' = 'id'): UserMastery {
  let xp = 0;
  const cookedIds = getLocalCookedRecipeIds(userId);

  if (typeof window !== 'undefined') {
    try {
      const key = userId ? `${MASTERY_KEY}_${userId}` : MASTERY_KEY;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.xp === 'number') {
          xp = parsed.xp;
        }
      }
    } catch {}
  }

  const level = calculateLevelFromXp(xp);
  const currentLevelBaseXp = calculateXpForLevel(level);
  const nextLevelXp = calculateXpForLevel(level + 1);
  const xpInCurrentLevel = xp - currentLevelBaseXp;
  const xpNeededForNext = nextLevelXp - currentLevelBaseXp;
  const progressPercent =
    xpNeededForNext > 0 ? Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100)) : 100;

  return {
    xp,
    level,
    title: getChefTitle(level, language),
    cookedRecipeIds: cookedIds,
    nextLevelXp,
    currentLevelBaseXp,
    progressPercent,
  };
}

export function saveLocalMastery(xp: number, userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const key = userId ? `${MASTERY_KEY}_${userId}` : MASTERY_KEY;
    localStorage.setItem(key, JSON.stringify({ xp }));
    window.dispatchEvent(new CustomEvent('mastery-updated', { detail: { xp } }));
  } catch {}
}

/**
 * Klaim XP saat pengguna menyelesaikan hidangan (Quest Selesai)
 */
export async function claimRecipeCooked(
  recipeId: string,
  difficulty: 'Easy' | 'Medium' | 'Hard' | string,
  userId?: string | null,
  language: 'id' | 'en' = 'id'
): Promise<{
  xpGained: number;
  totalXp: number;
  oldLevel: number;
  newLevel: number;
  levelUp: boolean;
  newTitle: string;
}> {
  let xpGained = 50;
  if (difficulty === 'Medium') xpGained = 100;
  if (difficulty === 'Hard') xpGained = 200;

  const currentCooked = getLocalCookedRecipeIds(userId);
  const isFirstTime = !currentCooked.includes(recipeId);
  const updatedCooked = isFirstTime ? [...currentCooked, recipeId] : currentCooked;
  saveLocalCookedRecipeIds(updatedCooked, userId);

  const currentMastery = getLocalMastery(userId, language);
  const oldLevel = currentMastery.level;

  // Jika ini pertama kali dimasak, tambahkan full XP; jika repeat, tambahkan 25 bonus XP
  const actualXpToAdd = isFirstTime ? xpGained : 25;
  const totalXp = currentMastery.xp + actualXpToAdd;
  saveLocalMastery(totalXp, userId);

  const newLevel = calculateLevelFromXp(totalXp);
  const levelUp = newLevel > oldLevel;
  const newTitle = getChefTitle(newLevel, language);

  // Sync to Firestore if user logged in
  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          cookedRecipeIds: updatedCooked,
          xp: totalXp,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[Resepedia] Failed to sync mastery to Firestore:', err);
    }
  }

  return {
    xpGained: actualXpToAdd,
    totalXp,
    oldLevel,
    newLevel,
    levelUp,
    newTitle,
  };
}
