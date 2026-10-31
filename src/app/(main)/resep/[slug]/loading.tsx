import React from 'react';

export default function RecipeLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      <div className="space-y-4">
        <div className="h-4 w-24 bg-primary/20 rounded-full" />
        <div className="h-10 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      </div>
      <div className="aspect-[21/9] w-full bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 h-96 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        <div className="lg:col-span-7 space-y-4">
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
