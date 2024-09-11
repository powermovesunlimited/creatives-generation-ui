"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Suspense } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<'authenticated' | 'unauthenticated' | 'loading'>('loading');

  useEffect(() => {
    const supabase = createClientComponentClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <section>
          <Suspense
            fallback={
              <div className="flex w-full px-4 lg:px-40 py-4 items-center border-b text-center gap-8 justify-between h-[69px]" />
            }
          >
            <Navbar authState={authState} />
          </Suspense>
        </section>
        <main className="flex flex-1 flex-col items-center py-16">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}