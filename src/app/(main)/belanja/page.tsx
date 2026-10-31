import React from 'react';
import { Metadata } from 'next';
import { getCurrentUser, getShoppingItems } from '@/lib/firebase/firestore-queries';
import BelanjaClient from '@/components/belanja/BelanjaClient';

export const metadata: Metadata = {
  title: 'Daftar Belanja Pasar | Resepedia',
  description: 'Daftar belanja bahan masakan otomatis terorganisir per resep Nusantara.',
};

export const dynamic = 'force-dynamic';

export default async function BelanjaPage() {
  const user = await getCurrentUser();
  const shoppingItems = user ? await getShoppingItems(user.id) : [];

  return <BelanjaClient initialItems={shoppingItems} />;
}
