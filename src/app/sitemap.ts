import { MetadataRoute } from 'next';
import { getRecipes } from '@/lib/firebase/firestore-queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://resepedia.id';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/eksplorasi`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/belanja`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic recipe routes
  try {
    const recipes = await getRecipes();
    const recipeRoutes: MetadataRoute.Sitemap = recipes.map((recipe) => ({
      url: `${baseUrl}/resep/${recipe.slug || recipe.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...recipeRoutes];
  } catch {
    return staticRoutes;
  }
}
