import React from 'react';
import PublicAdGalleryClient from '@/components/gallery/PublicAdGalleryClient';

export default function PublicGalleryPage() {
  return (
    <div className="w-full bg-background">
      <main className="container mx-auto px-4 py-8">
        <PublicAdGalleryClient />
      </main>
    </div>
  );
}