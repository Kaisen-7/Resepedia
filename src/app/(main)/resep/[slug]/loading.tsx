import React from 'react';

export default function RecipeLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-16 space-y-8 animate-pulse">
      <div className="h-6 w-32 bg-[#E2D1B0] dark:bg-[#3D291D] rounded-lg border-2 border-[#5C3A21]/30" />
      <div className="space-y-4">
        <div className="h-4 w-24 bg-[#C85A32]/30 rounded-full" />
        <div className="h-10 w-2/3 bg-[#E2D1B0] dark:bg-[#3D291D] rounded-2xl border-2 border-[#5C3A21]/30" />
        <div className="h-4 w-1/2 bg-[#E2D1B0] dark:bg-[#3D291D] rounded-lg" />
      </div>
      <div className="aspect-21/9 w-full bg-[#E2D1B0] dark:bg-[#3D291D] rounded-3xl border-[3px] border-[#5C3A21]/40" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 h-96 bg-[#E2D1B0] dark:bg-[#3D291D] rounded-3xl border-[3px] border-[#5C3A21]/40" />
        <div className="lg:col-span-7 space-y-4">
          <div className="h-32 bg-[#E2D1B0] dark:bg-[#3D291D] rounded-3xl border-[3px] border-[#5C3A21]/40" />
          <div className="h-32 bg-[#E2D1B0] dark:bg-[#3D291D] rounded-3xl border-[3px] border-[#5C3A21]/40" />
          <div className="h-32 bg-[#E2D1B0] dark:bg-[#3D291D] rounded-3xl border-[3px] border-[#5C3A21]/40" />
        </div>
      </div>
    </div>
  );
}
