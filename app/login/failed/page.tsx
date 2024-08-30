import { Suspense } from 'react';
import LoginFailedClient from './LoginFailedClient';

export default function LoginFailedPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFailedClient searchParams={searchParams} />
    </Suspense>
  );
}
