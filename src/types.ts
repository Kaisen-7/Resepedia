/**
 * Resepedia Core Type Definitions
 * Bridging Firestore document models with UI components.
 */

export * from './types/recipe.types';
import {
  RecipeDocument,
  CommentDocument,
  ShoppingItemDocument,
  UserDocument,
  Nutrition,
  Variation,
  Ingredient,
  Instruction,
} from './types/recipe.types';

// Aliases for component backward compatibility
export type Recipe = RecipeDocument;
export type ShoppingItem = ShoppingItemDocument;

export interface Comment {
  id: string;
  name: string;
  time: string;
  timestamp: number;
  text: string;
  avatar?: string;
  initial?: string;
  helpfulCount: number;
  repliesCount: number;
}

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}

export function generateSlug(title: string, id: string): string {
  const cleanTitle = (title || 'resep')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const shortId = (id || '').slice(0, 6) || Math.random().toString(36).substring(2, 8);
  return `${cleanTitle}-${shortId}`;
}

export function generateKeywords(
  title: string,
  region: string,
  ingredients: Array<{ name: string }>
): string[] {
  const words = `${title} ${region} ${ingredients.map((i) => i.name).join(' ')}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return Array.from(new Set(words));
}

export function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} hari lalu`;
  if (diffHours > 0) return `${diffHours} jam lalu`;
  if (diffMins > 0) return `${diffMins} menit lalu`;
  return 'Baru saja';
}

export function mapCommentDocToComment(docData: any): Comment {
  const ts = docData.createdAt || Date.now();
  return {
    id: docData.id,
    name: docData.authorName || 'Chef Tamu',
    time: formatTimeAgo(ts),
    timestamp: ts,
    text: docData.text || '',
    avatar: docData.authorAvatar || undefined,
    initial: (docData.authorName || 'U').charAt(0).toUpperCase(),
    helpfulCount: docData.helpfulCount || 0,
    repliesCount: docData.repliesCount || 0,
  };
}
