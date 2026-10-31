import { Recipe } from '@/types';

export function generateRecipeJsonLd(recipe: Recipe, baseUrl: string = 'https://resepedia.id') {
  const recipeUrl = `${baseUrl}/resep/${recipe.slug || recipe.id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: [recipe.image],
    description: recipe.description,
    author: {
      '@type': 'Person',
      name: recipe.authorName || 'Resepedia Chef',
    },
    datePublished: '2026-01-01',
    prepTime: recipe.prepTime ? `PT${recipe.prepTime.replace(/[^0-9]/g, '')}M` : 'PT15M',
    cookTime: recipe.cookTime ? `PT${recipe.cookTime.replace(/[^0-9]/g, '')}M` : 'PT30M',
    recipeYield: recipe.servings || '4 Servings',
    recipeCategory: recipe.category,
    recipeCuisine: `Indonesian (${recipe.region || 'Nusantara'})`,
    keywords: `${recipe.title}, resep ${recipe.region}, masakan nusantara, kuliner indonesia`,
    recipeIngredient: recipe.ingredients.map(
      (ing) => `${ing.name} ${ing.detail ? `(${ing.detail})` : ''}`.trim()
    ),
    recipeInstructions: recipe.instructions.map((step, idx) => ({
      '@type': 'HowToStep',
      name: step.title || `Langkah ${idx + 1}`,
      text: step.text,
      position: idx + 1,
    })),
    aggregateRating: recipe.rating && recipe.rating > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: recipe.rating.toString(),
          reviewCount: (recipe.ratingCount || 1).toString(),
        }
      : undefined,
    video: recipe.youtubeUrl
      ? {
          '@type': 'VideoObject',
          name: `Cara Memasak ${recipe.title}`,
          description: recipe.description,
          thumbnailUrl: [recipe.image],
          embedUrl: recipe.youtubeUrl,
          uploadDate: '2026-01-01',
        }
      : undefined,
  };
}
