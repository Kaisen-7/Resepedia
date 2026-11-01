import { MetadataRoute } from 'next';
import { getRecipes } from '@/lib/firebase/firestore-queries';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resepedia-seven.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/eksplorasi`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/belanja`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const recipes = await getRecipes();
    const recipeRoutes: MetadataRoute.Sitemap = recipes.map((recipe) => ({
      url: `${siteUrl}/resep/${recipe.slug || recipe.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...recipeRoutes];
  } catch {
    return staticRoutes;
  }
}
