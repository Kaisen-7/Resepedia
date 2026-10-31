/**
 * Resepedia — Cloud Firestore Document Interfaces
 */

export interface UserPreferences {
  darkMode: boolean;
  language: 'id' | 'en';
  dietary: 'None' | 'Vegetarian' | 'Vegan' | 'Gluten Free' | 'Halal';
}

export interface UserDocument {
  id: string; // Firebase Auth UID
  displayName: string;
  email: string;
  avatarUrl: string | null;
  savedRecipeIds: string[]; // Pengganti tabel saved_recipes
  preferences: UserPreferences;
  createdAt: number;
}

export interface ShoppingItemDocument {
  id: string;
  name: string;
  detail: string;
  checked: boolean;
  recipeTitle: string | null;
  createdAt: number;
}

export interface Nutrition {
  protein: string;
  fat: string;
  carbs: string;
}

export interface Variation {
  title: string;
  description: string;
  icon?: string;
}

export interface Ingredient {
  name: string;
  detail: string;
  role?: string;
}

export interface Instruction {
  title: string;
  text: string;
}

export interface RecipeDocument {
  id: string;
  slug: string; // URL-friendly: "rendang-daging-padang-a8f2"
  title: string;
  description: string;
  image: string; // URL dari Firebase Storage atau eksternal
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: string;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Drink';
  region: 'Sumatra' | 'Jawa' | 'Bali' | 'Sulawesi' | 'Kalimantan' | 'Papua' | string;
  spicy: boolean;
  servings: string;
  youtubeUrl?: string | null;
  videoUrl?: string | null;
  nutrition: Nutrition;
  variations: Variation[];
  ingredients: Ingredient[];
  instructions: Instruction[];
  rating: number; // Rata-rata bintang (0.0 - 5.0)
  ratingCount: number; // Jumlah pemberi rating
  authorId: string | null; // UID pembuat resep
  authorName: string;
  isDefault: boolean;

  // Optimasi khusus Firestore untuk filter & pencarian cepat:
  ingredientNames: string[]; // Array lowercase: ["daging sapi", "santan", "serai"]
  searchKeywords: string[]; // Token kata judul, daerah, bahan
  createdAt: number;
}

export interface CommentDocument {
  id: string;
  recipeId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  text: string;
  helpfulCount: number;
  repliesCount: number;
  createdAt: number;
  time?: string;
  initial?: string;
}
