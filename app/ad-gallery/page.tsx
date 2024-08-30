import { Suspense } from 'react';
import AdGalleryClient from './AdGalleryClient';

export default function AdGallery() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdGalleryClient />
    </Suspense>
  );
}