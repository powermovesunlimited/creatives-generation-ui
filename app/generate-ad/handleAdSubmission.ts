import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "@/components/ui/use-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type RequestData = {
  headline: string;
  body_text: string;
  additional_description?: string;
  image?: string;
  number_of_variations: number;
  call_to_action_text: string;
  instructional_prompt: string;
  dimensions?: string;
};

export const handleAdSubmission = async (
  formData: RequestData,
  router: AppRouterInstance,
  setShowEmailPrompt: (show: boolean) => void
) => {
  const supabase = createClientComponentClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
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

const proceedToAdGeneration = (formData: RequestData, router: AppRouterInstance) => {
  const queryString = new URLSearchParams(
    Object.entries(formData).map(([key, value]) => [key, value.toString()])
  ).toString();
  router.push(`/ad-results?${queryString}`);
};