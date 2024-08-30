import { Suspense } from 'react';
import AdResultsClient from './AdResultsClient';

function ShimmerEffect() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-muted h-64 w-full rounded-md animate-pulse"
        ></div>
      ))}
    </div>
  );
}

export default function AdResults() {
  return (
    <Suspense fallback={<ShimmerEffect />}>
      <AdResultsClient />
    </Suspense>
  );
}