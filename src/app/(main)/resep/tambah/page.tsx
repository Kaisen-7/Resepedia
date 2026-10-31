import React from 'react';
import { Metadata } from 'next';
import AddRecipeClient from '@/components/recipe/AddRecipeClient';

export const metadata: Metadata = {
  title: 'Tulis Resep Baru | Resepedia',
  description: 'Publikasikan resep masakan autentik Nusantara Anda ke komunitas Resepedia.',
};

export default function TambahResepPage() {
  return <AddRecipeClient />;
}
