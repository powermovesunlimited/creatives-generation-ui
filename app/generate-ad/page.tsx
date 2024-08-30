import { Suspense } from 'react';
import GenerateAdClient from './GenerateAdClient';

export default function GenerateAdPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateAdClient />
    </Suspense>
  );
}