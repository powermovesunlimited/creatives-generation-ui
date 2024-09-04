"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { toast } from "@/components/ui/use-toast";

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

function getServerUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SERVER_URL || 'https://creatives-generation-app.azurewebsites.net';
  } else {
    return 'http://localhost:8000';
  }
}

export default function AdResultsClient() {
  const supabase = createClientComponentClient<Database>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [requestParams, setRequestParams] = useState<Record<string, any> | null>(null);
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

  const deductCredit = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching credits:', error);
      throw new Error('Failed to fetch credits');
    }

    if (data.credits < 1) {
      throw new Error('Not enough credits');
    }

    const { error: updateError } = await supabase
      .from('credits')
      .update({ credits: data.credits - 1 })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      throw new Error('Failed to update credits');
    }
  }, [supabase]);

  const generateAd = useCallback(async (formData: Record<string, any>) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Generating ad with Form data:", formData);

      // Check for required fields
      const requiredFields = ['headline', 'body_text', 'call_to_action_text', 'instructional_prompt', 'number_of_variations', 'dimensions'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Ensure number_of_variations is a number
      formData.number_of_variations = Number(formData.number_of_variations);

      const serverUrl = getServerUrl();
      console.log("Server URL:", serverUrl);
      if (!serverUrl) {
        throw new Error("SERVER_URL is not defined in the environment variables");
      }

      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Generate a unique transaction ID
      const transactionId = `${user.id}_${Date.now()}`;

      // Check if this transaction has already been processed
      const { data: existingTransaction } = await supabase
        .from('ad_transactions_test')
        .select('id')
        .eq('transaction_id', transactionId)
        .single();

      if (existingTransaction) {
        console.log('Transaction already processed');
        setIsLoading(false);
        return;
      }

      // Deduct a credit before generating the ad
      await deductCredit(user.id);
      console.log('Posting form data to server:', formData);
      const response = await fetch(`${serverUrl}/generate_conversion_ad`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, user_id: user.id, transaction_id: transactionId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "success") {
          // Record the transaction
          await supabase.from('ad_transactions_test').insert({
            user_id: user.id,
            transaction_id: transactionId,
            ad_id: result.data.record_id
          });

          setRecordId(result.data.record_id);
          setStatus("processing");
          // Redirect to ad gallery page
          router.push(`/ad-gallery?recordId=${result.data.record_id}`);
        } else {
          setError("Failed to generate ad: " + result.message);
          setIsLoading(false);
        }
      } else {
        const errorData = await response.json();
        setError("Failed to generate ad: " + JSON.stringify(errorData));
        setIsLoading(false);
      }
    } catch (error) {
      if ((error as Error).message === 'Not enough credits') {
        toast({
          title: "Error",
          description: "You don't have enough credits to generate an ad. Please purchase more credits.",
          variant: "destructive",
        });
        router.push('/get-credits');
      } else {
        setError("Error generating ad: " + (error as Error).message);
        setIsLoading(false);
      }
    } finally {
      isGeneratingRef.current = false;
    }
  }, [router, getCurrentUser, deductCredit, supabase]);

  const debouncedGenerateAd = useCallback(debounce(generateAd, 300), [generateAd]);

  useEffect(() => {
    const encodedData = searchParams.get('data');
    if (encodedData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(encodedData));
        setRequestParams(decodedData);
        debouncedGenerateAd(decodedData);
      } catch (error) {
        console.error('Error parsing form data:', error);
        setError('Invalid form data. Please try again.');
        setIsLoading(false);
      }
    } else {
      setError('No form data found. Please fill out the form and try again.');
      setIsLoading(false);
    }
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

  const renderValue = (value: any): React.ReactNode => {
    if (typeof value === 'object' && value !== null) {
      return (
        <ul>
          {Object.entries(value).map(([subKey, subValue]) => (
            <li key={subKey}>
              <strong>{subKey}:</strong> {renderValue(subValue)}
            </li>
          ))}
        </ul>
      );
    }
    return String(value);
  };

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
          <div key={key} className="mb-2">
            <strong>{key}:</strong> {renderValue(value)}
          </div>
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