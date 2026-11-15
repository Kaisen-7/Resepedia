/**
 * Resepedia — Cloud Firestore Document Interfaces
 */

export interface UserPreferences {
  darkMode: boolean;
  language: 'id' | 'en';
  dietary: 'None' | 'Vegetarian' | 'Vegan' | 'Gluten Free' | 'Halal';
  soundEffectsEnabled?: boolean;
}

export interface UserDocument {
  id: string; // Firebase Auth UID
  displayName: string;
  email: string;
  avatarUrl: string | null;
  savedRecipeIds: string[]; // Pengganti tabel saved_recipes
  cookedRecipeIds?: string[]; // ID resep yang sudah diselesaikan (Quest Selesai)
  xp?: number; // Total cooking XP
  unlockedBadges?: string[]; // Lencana koki yang terbuka
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
  rating?: number | null; // 1 - 5 stars
  helpfulCount: number;
  repliesCount: number;
  createdAt: number;
  time?: string;
  initial?: string;
}

export interface SpiceSubstitute {
  name: string;
  ratio: string; // Misal "1:1" atau "1 butir = 1/2 sdt kemiri halus"
  notes: string;
}

export interface SpiceAlmanacEntry {
  id: string;
  name: string;
  regionalName?: string; // Nama daerah (misal: "Muncang" di Sunda)
  aliases: string[]; // ['kemiri', 'candlenut', 'muncang']
  category: 'Rimpang' | 'Bumbu Kering' | 'Daun & Batang' | 'Buah & Asam' | 'Pelengkap';
  flavorProfile: string; // Profil rasa (gurih berminyak, pedas hangat, dll.)
  culinaryRole: string; // Fungsi masakan
  substitutes: SpiceSubstitute[];
  storageTip: string;
  icon?: string;
}
