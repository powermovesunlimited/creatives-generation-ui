"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const ShimmerEffect = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="bg-muted h-64 w-full rounded-md animate-pulse"
      ></div>
    ))}
  </div>
);

function LoadingSpinner() {
  return (
    <div className="container mx-auto p-4 flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

function AdResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [requestParams, setRequestParams] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const formData = Object.fromEntries(searchParams.entries());
    setRequestParams(formData);

    const generateAd = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("https://creatives-generation-app.azurewebsites.net/generate_conversion_ad", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === "success") {
            setRecordId(result.data.record_id);
            setStatus("processing");
            // Redirect to ad gallery page
            router.push(`/ad-gallery?recordId=${result.data.record_id}`);
          } else {
            setError("Failed to generate ad: " + result.message);
            setIsLoading(false);
          }
        } else {
          setError("Failed to generate ad");
          setIsLoading(false);
        }
      } catch (error) {
        setError("Error generating ad: " + (error as Error).message);
        setIsLoading(false);
      }
    };

    generateAd();
  }, [searchParams, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-background min-h-screen">
      <div className="flex flex-row gap-4 mb-6 items-center">
        <Link href="/generate-ad" className="text-sm w-fit">
          <Button variant="outline" className="hover:bg-primary/10 hover:text-primary transition-all duration-300" size="sm">
            <FaArrowLeft className="mr-2" />
            Go Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">
          Your Ad Request
        </h1>
      </div>

      <div className="border border-muted rounded-lg p-4 shadow-sm bg-card">
        <h2 className="text-xl font-semibold mb-3 text-primary">Request Parameters</h2>
        {requestParams && Object.entries(requestParams).map(([key, value]) => (
          <p key={key} className="mb-2">
            <strong>{key}:</strong> {value}
          </p>
        ))}
        <Link href="/ad-gallery">
          <Button className="mt-4">
            View Ad Gallery
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AdResults() {
  return (
    <Suspense fallback={<ShimmerEffect />}>
      <AdResultsContent />
    </Suspense>
  );
}