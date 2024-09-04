import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "@/components/ui/use-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const uploadImageToAzure = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload-to-azure', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    console.log('Failed to upload image:', response);
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.url;
};

export type RequestData = {
  headline: string;
  body_text: string;
  additional_description?: string;
  image?: string | File;
  logoImage?: string;
  number_of_variations: number;
  call_to_action_text: string;
  instructional_prompt: string;
  dimensions?: string;
};

const ANONYMOUS_ACCOUNT_LIMIT = 1; // Maximum number of anonymous accounts per IP
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const handleAdSubmission = async (
  formData: RequestData,
  router: AppRouterInstance,
  setShowEmailPrompt: (show: boolean) => void
) => {
  const supabase = createClientComponentClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Check if we're in production environment
    if (process.env.NODE_ENV === 'production') {
      try {
        // Get the user's IP address
        const { data, error } = await supabase.functions.invoke('get-ip-address');
        
        if (error || !data || !data.ip_address) {
          throw new Error('Failed to get IP address');
        }

        const ip_address = data.ip_address;

        // Check the number of anonymous accounts created from this IP in the last 24 hours
        const { data: anonymousAccounts, error: countError } = await supabase
          .from('anonymous_accounts')
          .select('created_at')
          .eq('ip_address', ip_address);

        if (countError) {
          throw new Error('Error checking anonymous accounts');
        }

        if (anonymousAccounts.length >= ANONYMOUS_ACCOUNT_LIMIT) {
          toast({
            title: "Account Creation Limit Reached",
            description: "You've reached the limit for creating anonymous accounts. Please sign up for a full account to continue.",
            variant: "destructive",
          });
          router.push('/login'); // Redirect to signup page
          return;
        }
      } catch (error) {
        console.error("Error in IP address check:", error);
        toast({
          title: "Error",
          description: "Unable to process your request. Please try again later.",
          variant: "destructive",
        });
        return;
      }
    }

    // Create anonymous account
    const { data, error } = await supabase.auth.signUp({
      email: `${Math.random().toString(36).substring(2, 15)}@anonymous.com`,
      password: Math.random().toString(36).substring(2, 15),
    });

    if (error) {
      console.error("Error creating anonymous account:", error);
      toast({
        title: "Error",
        description: "Unable to create an anonymous account. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // Add 5 credits to the new account
    const { error: creditsError } = await supabase
      .from('credits')
      .insert({ 
        user_id: data.user!.id, 
        credits: 5,
        created_at: new Date().toISOString()
      });

    if (creditsError) {
      console.error("Error adding credits:", creditsError);
      toast({
        title: "Error",
        description: "Unable to add credits to your account. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // In production, log the anonymous account creation
    if (process.env.NODE_ENV === 'production') {
      try {
        const { data: ipData, error: ipError } = await supabase.functions.invoke('get-ip-address');
        if (ipError || !ipData || !ipData.ip_address) {
          throw new Error('Failed to get IP address for logging');
        }
        await supabase.from('anonymous_accounts').insert({
          user_id: data.user!.id,
          ip_address: ipData.ip_address,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error logging anonymous account:", error);
        // Continue execution even if logging fails
      }
    }

    // Update the authentication state
    await supabase.auth.getSession();

    // Dispatch the 'anonymous-user-created' event
    window.dispatchEvent(new Event('anonymous-user-created'));

    toast({
      title: "Anonymous Account Created",
      description: "You've been given 5 free credits to start generating ads!",
    });
  } else {
    // Check user's credits
    const { data: creditsData, error: creditsError } = await supabase
      .from('credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (creditsError) {
      console.error("Error fetching credits:", creditsError);
      toast({
        title: "Error",
        description: "Unable to check your credits. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    if (creditsData.credits === 0) {
      // Check if the user is anonymous
      if (user.email?.includes('@anonymous.com')) {
        setShowEmailPrompt(true);
        return;
      } else {
        // Redirect to get-credits page
        router.push('/get-credits');
        return;
      }
    }
  }

  proceedToAdGeneration(formData, router);
};

const proceedToAdGeneration = async (formData: RequestData, router: AppRouterInstance) => {
  let encodedData = { ...formData };

  // If the image is a File object, upload it to Azure Blob Storage and get the URL
  if (formData.image instanceof File) {
    try {
      const imageUrl = await uploadImageToAzure(formData.image);
      console.log("Image uploaded to Azure:", imageUrl);
      encodedData.image = imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Unable to upload image. Please try again later.",
        variant: "destructive",
      });
      return;
    }
  } else if (formData.image === '') {
    // Remove the image field if it's empty
    delete encodedData.image;
  }


  // Encode the entire formData object as a JSON string
  const encodedDataString = encodeURIComponent(JSON.stringify(encodedData));
  router.push(`/ad-results?data=${encodedDataString}`);
};