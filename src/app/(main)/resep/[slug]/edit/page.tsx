import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRecipeBySlugOrId } from '@/lib/firebase/firestore-queries';
import EditRecipeClient from '@/components/recipe/EditRecipeClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlugOrId(slug);

  if (!recipe) {
    return { title: 'Edit Resep | Resepedia' };
  }

  return {
    title: `Edit ${recipe.title} | Resepedia`,
  };
}

export default async function EditRecipePage({ params }: Props) {
  const { slug } = await params;
  const recipe = await getRecipeBySlugOrId(slug);

  if (!recipe) {
    notFound();
  }

  return <EditRecipeClient recipe={recipe} />;
}
