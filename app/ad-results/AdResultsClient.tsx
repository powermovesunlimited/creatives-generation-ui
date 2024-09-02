"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

function LoadingSpinner() {
  return (
    <div className="container mx-auto p-4 flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

// Debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function AdResultsClient() {
  const supabase = createClientComponentClient<Database>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [requestParams, setRequestParams] = useState<Record<string, string> | null>(null);
  const isGeneratingRef = useRef(false);

  const getCurrentUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error.message);
        throw new Error('Failed to get user');
      }
      if (!user) {
        console.error('No user found');
        throw new Error('No user found');
      }
      return user;
    } catch (err) {
      console.error('Error in getCurrentUser:', err);
      router.push('/login');
      return null;
    }
  }, [supabase.auth, router]);

  const generateAd = useCallback(async (formData: Record<string, string>) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Generating ad with Form data:", formData);
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      console.log("Server URL:", serverUrl);
      if (!serverUrl) {
        throw new Error("SERVER_URL is not defined in the environment variables");
      }

      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${serverUrl}/generate_conversion_ad`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, user_id: user.id }),
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
    } finally {
      isGeneratingRef.current = false;
    }
  }, [router, getCurrentUser]);

  const debouncedGenerateAd = useCallback(debounce(generateAd, 300), [generateAd]);

  useEffect(() => {
    const formData = Object.fromEntries(searchParams.entries());
    setRequestParams(formData);
    debouncedGenerateAd(formData);
  }, [searchParams, debouncedGenerateAd]);

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