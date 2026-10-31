import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRecipeBySlugOrId, getComments, getCurrentUser, getSavedRecipeIds } from '@/lib/firebase/firestore-queries';
import { generateRecipeJsonLd } from '@/lib/utils/seo-schema';
import RecipeDetailClient from '@/components/recipe/RecipeDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlugOrId(slug);

  if (!recipe) {
    return {
      title: 'Resep Tidak Ditemukan | Resepedia',
    };
  }

  return {
    title: `${recipe.title} — Resep Asli Khas ${recipe.region || 'Nusantara'}`,
    description: recipe.description,
    openGraph: {
      title: `${recipe.title} | Resepedia`,
      description: recipe.description,
      images: [
        {
          url: recipe.image,
          width: 1200,
          height: 630,
          alt: recipe.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description: recipe.description,
      images: [recipe.image],
    },
  };
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params;
  const recipe = await getRecipeBySlugOrId(slug);

  if (!recipe) {
    notFound();
  }

  const [comments, user] = await Promise.all([
    getComments(recipe.id),
    getCurrentUser(),
  ]);

  const savedIds = user ? await getSavedRecipeIds(user.id) : [];
  const isSavedInitial = savedIds.includes(recipe.id);

  // JSON-LD Google Recipe Structured Data Schema
  const jsonLd = generateRecipeJsonLd(recipe);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecipeDetailClient
        recipe={recipe}
        initialComments={comments}
        isSavedInitial={isSavedInitial}
      />
    </>
  );
}
