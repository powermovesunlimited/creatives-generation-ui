'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessMessage() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      router.push('/generate-ad');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-green-500 text-white p-4 text-center z-50">
      <p className="text-lg font-semibold">Purchase successful! Your credits have been added.</p>
    </div>
  );
}